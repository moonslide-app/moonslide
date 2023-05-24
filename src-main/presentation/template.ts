import { readFile } from 'fs/promises'
import { copy } from 'fs-extra'
import { TemplateConfig, mapTemplateConfigPaths, parseTemplateConfig } from './templateConfig'
import { resolve, dirname, relative } from 'path'
import { getTemplateFolder, isTemplate } from '../helpers/assets'
import sanitizeHtml from './sanitize'
import { getLocalFileUrl } from '../helpers/protocol'
import { TemplateConfigError, TemplateNotFoundError, wrapErrorIfThrows } from '../../src-shared/errors/WrappingError'

const CONFIG_FILE_NAME = 'config.yml'

export type Template = {
    /**
     * The path of the template folder
     */
    folderPath: string
    /**
     * Returns the loaded config of this template.
     * All paths of the config are resolved absolute paths.
     */
    getConfigAbsolute(): TemplateConfig
    /**
     * Returns the loaded config of this template.
     * All paths of the config are relative from the path `relativeFromPath`.
     * If omitted the paths are loaded relative to the templates folder.
     */
    getConfig(relativeFromPath?: string): TemplateConfig
    /**
     * Returns the loaded config of this template.
     * All paths are urls with the cutsom file protocol and absolute paths,
     * so they can be loaded from the electron app.
     */
    getConfigLocalFile(): TemplateConfig
    /**
     * Returns the content of the presentation html file.
     */
    getPresentationHtml(): Promise<string>
    /**
     * Loads all layouts of the template.
     */
    getLayouts(): Promise<Layouts>
    /**
     * Copies the whole template folder to a new location,
     * @param newLocation the new location where the template should be copied to. The folder should be empty.
     */
    copyTo(newLocation: string): Promise<void>
}

export type Layouts = {
    availableLayouts: string[]
    layoutsHtml: Record<string, string>
    defaultLayoutHtml?: string
}

/**
 * Loads the template folder and the config inside it.
 */
export async function loadTemplate(templateFolderPath: string): Promise<Template> {
    const configFile = await readFile(resolve(templateFolderPath, CONFIG_FILE_NAME)).catch(error => {
        throw new TemplateNotFoundError(templateFolderPath, error)
    })
    const configYaml = configFile.toString()
    const config = wrapErrorIfThrows(
        () => parseTemplateConfig(configYaml),
        error => new TemplateConfigError(error)
    )
    return new TemplateImpl(templateFolderPath, config)
}

/**
 * Tries to find the requested template relative to the markdownfile (or uses standard template if it is a known template).
 */
export function findAndLoadTemplate(template: string, markdownFilePath: string): Promise<Template> {
    if (isTemplate(template)) return loadTemplate(getTemplateFolder(template))
    else return loadTemplate(resolve(dirname(markdownFilePath), template))
}

class TemplateImpl implements Template {
    readonly folderPath: string
    private readonly config: TemplateConfig

    constructor(folderPath: string, config: TemplateConfig) {
        this.folderPath = folderPath
        this.config = mapTemplateConfigPaths(config, path => resolve(folderPath, path))
    }

    getConfigAbsolute = () => this.config

    getConfig(relativeFromPath = this.folderPath) {
        return mapTemplateConfigPaths(this.config, path => relative(relativeFromPath, path))
    }

    getConfigLocalFile() {
        return mapTemplateConfigPaths(this.config, getLocalFileUrl)
    }

    async getPresentationHtml() {
        const fileContents = (await readFile(this.config.template.presentation)).toString()
        return sanitizeHtml(fileContents)
    }

    async getLayouts() {
        const availableLayouts = this.config.layouts?.map(layout => layout.name) ?? []
        const layoutPaths = this.config.layouts?.map(layout => layout.path) ?? []
        const isDefault = this.config.layouts?.map(layout => layout.default ?? false) ?? []

        const layoutsHtml: Record<string, string> = {}
        let defaultLayoutHtml: string | undefined = undefined

        for (let i = 0; i < availableLayouts.length; i++) {
            const layoutName = availableLayouts[i]
            const fileContents = (await readFile(layoutPaths[i])).toString()
            const sanitized = sanitizeHtml(fileContents)
            layoutsHtml[layoutName] = sanitized
            if (isDefault[i]) defaultLayoutHtml = defaultLayoutHtml ?? sanitized
        }

        return { availableLayouts, layoutsHtml, defaultLayoutHtml }
    }

    async copyTo(newLocation: string): Promise<void> {
        await copy(this.folderPath, newLocation)
    }
}
