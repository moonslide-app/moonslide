import { BrowserWindow } from 'electron'
import fs from 'fs/promises'

export async function exportPdf(outputPath: string): Promise<string> {
    const pdfWindow = new BrowserWindow({ show: false })

    console.log(`Loading export window with output path: ${outputPath}`)
    pdfWindow.loadURL('reveal://preview/?print-pdf')
    pdfWindow.webContents.insertCSS('html.print-pdf .reveal .slides .pdf-page:last-child { page-break-after: avoid; }')

    try {
        await pdfWindow.webContents.executeJavaScript('new Promise(resolve => { Reveal.on("pdf-ready", resolve) })')
        // Use default printing options
        const data = await pdfWindow.webContents.printToPDF({
            preferCSSPageSize: true,
            printBackground: true,
        })

        await fs.writeFile(outputPath, data)
        console.log(`Wrote PDF successfully to ${outputPath}`)

        return outputPath
    } catch (error) {
        console.error(`Failed to write PDF to ${outputPath}. Error: ${error}`)
        throw error
    } finally {
        pdfWindow.destroy()
    }
}
