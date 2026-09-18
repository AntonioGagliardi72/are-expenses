import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

// Renders a DOM element into one or more A4 PDF pages (image-based) and
// returns the resulting PDF as an ArrayBuffer.
async function renderElementToPdfBytes(element) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  return pdf.output('arraybuffer')
}

function base64ToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Builds one merged PDF: the rendered report pages, followed by one page per
// image receipt (fitted to the page) and the original pages of any PDF receipts.
// `rows` is the list of expenses currently shown in the report.
export async function buildReportWithReceipts(reportElement, rows) {
  const reportBytes = await renderElementToPdfBytes(reportElement)
  const merged = await PDFDocument.load(reportBytes)

  const skipped = []

  for (const r of rows) {
    if (!r.receipt?.dataUrl) continue
    const { dataUrl, mediaType, name } = r.receipt

    try {
      if (mediaType === 'application/pdf') {
        const bytes = base64ToBytes(dataUrl)
        const srcDoc = await PDFDocument.load(bytes)
        const copiedPages = await merged.copyPages(srcDoc, srcDoc.getPageIndices())
        copiedPages.forEach(p => merged.addPage(p))
      } else {
        const bytes = base64ToBytes(dataUrl)
        let image
        try {
          image = mediaType === 'image/png'
            ? await merged.embedPng(bytes)
            : await merged.embedJpg(bytes)
        } catch {
          // Fallback for formats pdf-lib can't embed directly (e.g. some HEIC edge cases)
          image = await merged.embedJpg(bytes)
        }

        const page = merged.addPage()
        const { width: pw, height: ph } = page.getSize()
        const margin = 30
        const scale = Math.min((pw - margin * 2) / image.width, (ph - margin * 2) / image.height)
        const w = image.width * scale
        const h = image.height * scale
        page.drawImage(image, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
      }
    } catch (err) {
      skipped.push(name || r.note || r.date)
    }
  }

  const mergedBytes = await merged.save()
  return { blob: new Blob([mergedBytes], { type: 'application/pdf' }), skipped }
}
