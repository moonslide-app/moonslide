import { acceptedFileTypes } from '../../src-shared/constants/fileTypes'

export const htmlFilter: Electron.FileFilter = { name: 'HTML', extensions: acceptedFileTypes.html }
export const markdownFilter: Electron.FileFilter = { name: 'Markdown', extensions: acceptedFileTypes.markdown }
export const pdfFilter: Electron.FileFilter = { name: 'PDF', extensions: acceptedFileTypes.pdf }
export const imageFilter: Electron.FileFilter = {
    name: 'Image',
    extensions: acceptedFileTypes.images,
}
