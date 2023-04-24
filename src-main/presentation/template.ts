import { readFile, rm, mkdir } from 'fs/promises'
import { copy } from 'fs-extra'
import { existsSync } from 'fs'
import { Config, parseConfig } from './config'
import { resolve } from 'path'

const CONFIG_FILE_NAME = 'config.yml'
const SLIDES_CONTENT_TOKEN = '@@content@@'

export type Template = {
    /**
     * Returns the loaded config of this template.
     */
    getConfig(): Config
    /**
     * Loads the template slides defined in the config.
     */
    loadSlides(): Promise<SlideTemplate>
    /**
     * Copies the whole template folder to a new location,
     * removing unneded files like the config or the template slide file.
     * @param newLocation the new location where the template should,
     * will be deleted before the template is copied.
     */
    copyForPresentation(newLocation: string): Promise<void>
}

export type SlideTemplate = {
    /**
     * Fills the template slide with the content and returns the generated string
     */
    buildSlides(content: string): string
}

/**
 * Loads the template folder and the config inside it.
 */
export async function loadTemplate(templateFolderPath: string): Promise<Template> {
    const configYaml = (await readFile(resolve(templateFolderPath, CONFIG_FILE_NAME))).toString()
    const config = parseConfig(configYaml)
    return new TemplateImpl(templateFolderPath, config)
}

class TemplateImpl implements Template {
    folderPath: string
    config: Config

    constructor(folderPath: string, config: Config) {
        this.folderPath = folderPath
        this.config = config
    }

    getConfig = () => this.config

    async loadSlides() {
        const slidePath = resolve(this.folderPath, this.config.slide)
        const templateString = (await readFile(slidePath)).toString()
        const slidesTemplates: SlideTemplate = {
            buildSlides: content => templateString.replace(SLIDES_CONTENT_TOKEN, content),
        }
        return slidesTemplates
    }

    async copyForPresentation(presentationLocation: string): Promise<void> {
        // Remove directory if it already exists
        if (existsSync(presentationLocation)) await rm(presentationLocation, { recursive: true })
        await mkdir(presentationLocation)

        // Copy all files from template folder
        await copy(this.folderPath, presentationLocation)

        // Remove config and slide file
        await rm(resolve(presentationLocation, CONFIG_FILE_NAME))
        await rm(resolve(presentationLocation, this.config.slide))
    }
}
