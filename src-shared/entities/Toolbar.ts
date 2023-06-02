import { z } from 'zod'
import { addUUID, gracefulStringSchema, nullishToOptional, stringOrNumberSchema } from './zodUtils'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs-extra'
import {
    TemplatePathReferenceError,
    ToolbarYamlConfigError,
    wrapErrorIfThrows,
} from '../../src-shared/errors/WrappedError'
import { resolve } from 'path'
import { parse as yamlParse } from 'yaml'

/*
 * ---------- Types ----------
 */

export type Toolbar = {
    layouts: ToolbarLayoutEntry[]
    textStyles: ToolbarEntry[]
    slide: ToolbarEntry[]
    slideStyles: ToolbarEntry[]
}

export type ToolbarFilePaths = z.infer<typeof toolbarFilePathsSchema>

export type ToolbarItem = {
    id: string
    key: string
    name?: string
    hidden?: boolean
}

export type ToolbarLayoutItem = ToolbarItem & {
    slots?: number
}

export type ToolbarEntry = z.infer<typeof toolbarEntrySchema>
export type ToolbarLayoutEntry = z.infer<typeof toolbarLayoutEntrySchema>

/*
 * ---------- Schemas for ToolbarItem and ToolbarLayoutItem ----------
 */

const baseSchema = z.object({
    name: z.string().nullish().transform(nullishToOptional),
    key: z.string(),
    hidden: z.boolean().nullish().transform(nullishToOptional),
})

const templateSchema = z.object({
    values: stringOrNumberSchema.array(),
    shownValues: stringOrNumberSchema.array().nullish().transform(nullishToOptional),
    hiddenValues: stringOrNumberSchema.array().nullish().transform(nullishToOptional),
})

const VALUE_PLACEHODER = '${{value}}'
const toolbarItemsSchema = baseSchema
    .and(templateSchema)
    .or(baseSchema)
    .array()
    .transform(arr => {
        const output: ToolbarItem[] = arr
            .flatMap(template => {
                if (!('values' in template)) return template

                return template.values.map(value => ({
                    name: template.name?.replace(VALUE_PLACEHODER, value),
                    key: template.key.replace(VALUE_PLACEHODER, value),
                    hidden: template.shownValues?.includes(value)
                        ? false
                        : template.hiddenValues?.includes(value)
                        ? true
                        : template.hidden,
                }))
            })
            .map(addUUID)
        return output
    })

const toolbarLayoutsItemsSchema = baseSchema
    .extend({
        slots: z.number().nullish().transform(nullishToOptional),
    })
    .transform(addUUID)
    .array()

/*
 * ---------- Other Schemas ----------
 */

export const toolbarEntrySchema = z.object({
    name: z.string(),
    items: toolbarItemsSchema,
})

export const toolbarLayoutEntrySchema = z.object({
    name: z.string(),
    items: toolbarLayoutsItemsSchema,
})

export const toolbarFilePathsSchema = z.object({
    layouts: gracefulStringSchema,
    textStyles: gracefulStringSchema,
    slide: gracefulStringSchema,
    slideStyles: gracefulStringSchema,
})

/*
 * ---------- Load and Parse Toolbar ----------
 */

export async function loadToolbarFromPaths(paths: ToolbarFilePaths, templateFolderPath: string): Promise<Toolbar> {
    const entriesParse = toolbarEntrySchema.array().nullish().transform(nullishToOptional).parse
    const layoutsParse = toolbarLayoutEntrySchema.array().nullish().transform(nullishToOptional).parse

    const folder = templateFolderPath
    const layouts = await loadAndParseFileContents('layouts', paths.layouts, folder, layoutsParse)
    const textStyles = await loadAndParseFileContents('textStyles', paths.textStyles, folder, entriesParse)
    const slide = await loadAndParseFileContents('slide', paths.slide, folder, entriesParse)
    const slideStyles = await loadAndParseFileContents('slideStyles', paths.slideStyles, folder, entriesParse)

    return {
        layouts: layouts ?? [],
        textStyles: textStyles ?? [],
        slide: slide ?? [],
        slideStyles: slideStyles ?? [],
    }
}

async function loadAndParseFileContents<T>(
    propertyName: string,
    filePath: string | undefined,
    templateFolderPath: string,
    parseFunction: (input: unknown) => T
) {
    if (filePath === undefined) return undefined

    const resolvedPath = resolve(templateFolderPath, filePath)
    if (!existsSync(resolvedPath)) throw new TemplatePathReferenceError(resolvedPath)
    const fileContent = (await readFile(resolvedPath)).toString()

    return wrapErrorIfThrows(
        () => parseFunction(yamlParse(fileContent)),
        error => new ToolbarYamlConfigError(propertyName, filePath, error)
    )
}
