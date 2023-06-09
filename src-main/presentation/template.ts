import { readFile } from 'fs/promises'
import { copy, existsSync } from 'fs-extra'
import { TemplateConfig, mapTemplateConfigPaths, parseTemplateConfig } from '../../src-shared/entities/TemplateConfig'
import { resolve, dirname, relative } from 'path'
import { getTemplateFolder, isTemplate } from '../helpers/assets'
import { getLocalFileUrl } from '../helpers/protocol'
import { TemplateNotFoundError, TemplatePathReferenceError } from '../../src-shared/errors/WrappedError'
import { normalizeWithForwardSlash, relativeWithForwardSlash } from '../helpers/pathNormalizer'
import { replaceBackwardSlash } from '../../src-shared/helpers/pathNormalizer'

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
     * Returns the content of the slide html file,
     * which is used to wrap every slide.
     */
    getSlideHtml(): Promise<string | undefined>
    /**
     * Loads all layouts of the template.
     */
    getLayouts(): Promise<Layouts>
    /**
     * Validates that all paths in this template point to an existing file.
     * Throws if any file is not found.
     */
    validate(): Promise<void>
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
    const config = await parseTemplateConfig(configYaml, templateFolderPath)

    const template = new TemplateImpl(templateFolderPath, config)
    await template.validate()
    return template
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

    getConfigAbsolute = () => {
        return mapTemplateConfigPaths(this.config, replaceBackwardSlash)
    }

    getConfig(relativeFromPath = this.folderPath) {
        return mapTemplateConfigPaths(this.config, path => relativeWithForwardSlash(relativeFromPath, path))
    }

    getConfigLocalFile() {
        return mapTemplateConfigPaths(this.config, path => getLocalFileUrl(normalizeWithForwardSlash(path)))
    }

    async getSlideHtml() {
        if (this.config.slide === undefined) return undefined
        else {
            return (await readFile(this.config.slide)).toString()
        }
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
            layoutsHtml[layoutName] = fileContents
            if (isDefault[i]) defaultLayoutHtml = defaultLayoutHtml ?? fileContents
        }

        return { availableLayouts, layoutsHtml, defaultLayoutHtml }
    }

    async validate() {
        // goes through all paths and throws if file does not exist.
        mapTemplateConfigPaths(this.getConfigAbsolute(), path => {
            if (!existsSync(path)) throw new TemplatePathReferenceError(path)
            else return path
        })
    }

    async copyTo(newLocation: string): Promise<void> {
        await copy(this.folderPath, newLocation)
    }
}
