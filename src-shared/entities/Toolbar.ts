import { z } from 'zod'
import { addUUID, gracefulStringSchema, nullishToOptional } from './zodUtils'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs-extra'
import {
    TemplatePathReferenceError,
    ToolbarYamlConfigError,
    wrapErrorIfThrows,
} from '../../src-shared/errors/WrappedError'
import { resolve } from 'path'
import { parse as yamlParse } from 'yaml'

const baseSchema = z.object({
    key: z.string(),
    name: z.string().nullish().transform(nullishToOptional),
    hidden: z.boolean().nullish().transform(nullishToOptional),
})

const toolbarItemSchema = baseSchema.transform(addUUID)

const toolbarLayoutItemSchema = baseSchema
    .extend({
        slots: z.number().nullish().transform(nullishToOptional),
    })
    .transform(addUUID)

export const toolbarEntrySchema = z.object({
    name: z.string(),
    items: toolbarItemSchema.array(),
})

export const toolbarLayoutEntrySchema = z.object({
    name: z.string(),
    items: toolbarLayoutItemSchema.array(),
})

export const toolbarFilePathsSchema = z.object({
    layouts: gracefulStringSchema,
    textStyles: gracefulStringSchema,
    slide: gracefulStringSchema,
    slideStyles: gracefulStringSchema,
})

export async function loadToolbarFromPaths(paths: ToolbarFilePaths, templateFolderPath: string): Promise<Toolbar> {
    const folder = templateFolderPath
    const layouts = await loadAndParseFileContents('layouts', paths.layouts, folder, toolbarLayoutEntrySchema)
    const textStyles = await loadAndParseFileContents('textStyles', paths.textStyles, folder, toolbarEntrySchema)
    const slide = await loadAndParseFileContents('slide', paths.slide, folder, toolbarEntrySchema)
    const slideStyles = await loadAndParseFileContents('slideStyles', paths.slideStyles, folder, toolbarEntrySchema)

    return {
        layouts: layouts ?? [],
        textStyles: textStyles ?? [],
        slide: slide ?? [],
        slideStyles: slideStyles ?? [],
    }
}

async function loadAndParseFileContents<T extends typeof toolbarEntrySchema | typeof toolbarLayoutEntrySchema>(
    propertyName: string,
    filePath: string | undefined,
    templateFolderPath: string,
    itemSchema: T
) {
    if (filePath === undefined) return undefined

    const resolvedPath = resolve(templateFolderPath, filePath)
    if (!existsSync(resolvedPath)) throw new TemplatePathReferenceError(resolvedPath)
    const fileContent = (await readFile(resolvedPath)).toString()

    const arraySchema = itemSchema.array().nullish().transform(nullishToOptional)

    return wrapErrorIfThrows(
        () => arraySchema.parse(yamlParse(fileContent)),
        error => new ToolbarYamlConfigError(propertyName, filePath, error)
    )
}

export type Toolbar = {
    layouts: ToolbarLayoutEntry[]
    textStyles: ToolbarEntry[]
    slide: ToolbarEntry[]
    slideStyles: ToolbarEntry[]
}

export type ToolbarFilePaths = z.infer<typeof toolbarFilePathsSchema>
export type ToolbarItem = z.infer<typeof toolbarItemSchema>
export type ToolbarLayoutItem = z.infer<typeof toolbarLayoutItemSchema>
export type ToolbarEntry = z.infer<typeof toolbarEntrySchema>
export type ToolbarLayoutEntry = z.infer<typeof toolbarLayoutEntrySchema>
