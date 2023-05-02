import { LocalImageResolveMode, ParseRequest } from './ParseRequest'

export type ExportRequest = Omit<ParseRequest, 'imageMode' | 'outputFolderPath'> & {
    /**
     * This should be a file path if `mode` is `export-relative`
     * and a folder path if `mode` is `export-standalone`.
     */
    outputPath: string
    mode: Exclude<LocalImageResolveMode, 'preview'>
}
