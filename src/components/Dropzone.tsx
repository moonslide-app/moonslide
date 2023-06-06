import { ReactNode, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export type DropzoneProps = {
    className?: string
    children?: ReactNode
    onFileDropped?: (filePath: string) => void
}

export function Dropzone(props?: DropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const firstFile = acceptedFiles.at(0)
        if (firstFile) props?.onFileDropped?.(firstFile.path)
    }, [])

    const { getRootProps, isDragAccept } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: { 'image/*': [], 'video/*': [] },
        multiple: false,
    })

    return (
        <div {...getRootProps()} className={`relative ${props?.className ?? ''}`}>
            {props?.children}
            {isDragAccept && (
                <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center">
                    <p className="text-gray-700 font-light text-lg px-4 text-center">
                        Drop images and videos to include them into the presentation.
                    </p>
                </div>
            )}
        </div>
    )
}
