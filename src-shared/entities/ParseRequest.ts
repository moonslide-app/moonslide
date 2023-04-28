export type LocalImageResolveMode = 'preview' | 'export-standalone' | 'export-relative'

export type ParseRequest = {
    markdownFilePath: string
    markdownContent: string
    imageMode: LocalImageResolveMode
    outputFolderPath?: string
}
