import { BrowserWindow } from 'electron'
import fs from 'fs'

export function exportPdf(outputPath: string) {
    // Create the browser window.
    const pdfWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        show: false,
    })

    console.log(`Loading export window with output path: ${outputPath}`)
    pdfWindow.loadURL('reveal-export://export/?print-pdf')

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
                    })
                })
                .catch(error => {
                    console.log(`Failed to write PDF to ${outputPath}: `, error)
                })
                .finally(() => {
                    pdfWindow.destroy()
                })
        }, 1000)
    })
}
