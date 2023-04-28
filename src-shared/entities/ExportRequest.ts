import { LocalImageResolveMode, ParseRequest } from './ParseRequest'

export type ExportRequest = Omit<ParseRequest, 'imageMode' | 'outputPath'> & {
    outputPath: string
    mode: Exclude<LocalImageResolveMode, 'preview'>
}
