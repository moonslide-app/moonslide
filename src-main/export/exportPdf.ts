import { BrowserWindow } from 'electron'
import fs from 'fs'

export function exportPdf(outputPath: string) {
    return new Promise<string>((resolve, reject) => {
        const pdfWindow = new BrowserWindow({
            show: false,
        })

        console.log(`Loading export window with output path: ${outputPath}`)
        pdfWindow.loadURL('reveal://export/?print-pdf')

        pdfWindow.webContents.insertCSS(
            'html.print-pdf .reveal .slides .pdf-page:last-child { page-break-after: avoid; }'
        )

        pdfWindow.webContents.on('dom-ready', () => {
            setTimeout(() => {
                // Use default printing options
                pdfWindow.webContents
                    .printToPDF({
                        preferCSSPageSize: true,
                        printBackground: true,
                    })
                    .then(data => {
                        fs.writeFile(outputPath, data, error => {
                            if (error) throw error
                            console.log(`Wrote PDF successfully to ${outputPath}`)
                            resolve(outputPath)
                        })
                    })
                    .catch(error => {
                        console.log(`Failed to write PDF to ${outputPath}. Error: ${error}`)
                        reject(error)
                    })
                    .finally(() => {
                        pdfWindow.destroy()
                    })
            }, 1000)
        })
    })
}
