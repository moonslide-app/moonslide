import { readFile, rm } from 'fs/promises'
import { copy } from 'fs-extra'
import { TemplateConfig, parseTemplateConfig } from './templateConfig'
import { resolve, dirname } from 'path'
import { getTemplateFolder, isTemplate } from './assets'
import sanitizeHtml from './sanitize'

const CONFIG_FILE_NAME = 'config.yml'

export type Template = {
    /**
     * The path of the template folder
     */
    folderPath: string
    /**
     * Returns the loaded config of this template.
     */
    getConfig(): TemplateConfig
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
     * removing unneded files like the config or the template slide file.
     * @param newLocation the new location where the template should be copied to. The folder should be empty.
     */
    copyForPresentation(newLocation: string): Promise<void>
}

export type Layouts = {
    availableLayouts: string[]
    layoutsHtml: Record<string, string>
}

/**
 * Loads the template folder and the config inside it.
 */
export async function loadTemplate(templateFolderPath: string): Promise<Template> {
    const configYaml = (await readFile(resolve(templateFolderPath, CONFIG_FILE_NAME))).toString()
    const config = parseTemplateConfig(configYaml)
    return new TemplateImpl(templateFolderPath, config)
}

/**
 * Tries to find the requested template relative to the markdownfile (or uses standard template if it is a known template).
 */
export function findAndLoadTemplate(template: string, markdownFilePath: string | undefined): Promise<Template> {
    if (isTemplate(template)) return loadTemplate(getTemplateFolder(template))
    else if (!markdownFilePath) return Promise.reject('Could not find template, markdownfilePath was not specified')
    else return loadTemplate(resolve(dirname(markdownFilePath), template))
}

class TemplateImpl implements Template {
    readonly folderPath: string
    private readonly config: TemplateConfig

    constructor(folderPath: string, config: TemplateConfig) {
        this.folderPath = folderPath
        this.config = config
    }

    getConfig = () => this.config

    async getPresentationHtml() {
        const slidePath = resolve(this.folderPath, this.config.presentation)
        const fileContents = (await readFile(slidePath)).toString()
        return sanitizeHtml(fileContents)
    }

    async getLayouts() {
        const availableLayouts = this.config.layouts?.map(layout => layout.name) ?? []
        const layoutPaths = this.config.layouts?.map(layout => layout.path) ?? []
        const layoutsHtml: Record<string, string> = {}

        for (let i = 0; i < availableLayouts.length; i++) {
            const layoutName = availableLayouts[i]
            const layoutPath = resolve(this.folderPath, layoutPaths[i])
            const fileContents = (await readFile(layoutPath)).toString()
            layoutsHtml[layoutName] = sanitizeHtml(fileContents)
        }

        return { availableLayouts, layoutsHtml }
    }

    async copyForPresentation(presentationLocation: string): Promise<void> {
        // Copy all files from template folder
        await copy(this.folderPath, presentationLocation)

        // Remove config and slide file
        await rm(resolve(presentationLocation, CONFIG_FILE_NAME))
        await rm(resolve(presentationLocation, this.config.presentation))
    }
}
