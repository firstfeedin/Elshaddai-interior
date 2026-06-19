/**
 * Export utilities — PNG, PDF, SVG
 * Uses jsPDF + html2canvas
 */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/** Export any DOM element to PNG blob URL */
export async function exportElementPNG(el) {
  const canvas = await html2canvas(el, { backgroundColor: '#08070a', scale: 2, useCORS: true, logging: false })
  return canvas.toDataURL('image/png')
}

/** Export floor plan canvas element to PNG download */
export function downloadPNG(dataUrl, filename = 'floorplan.png') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

/** Export walls + furniture data as a PDF with floor plan image */
export async function exportDesignPDF({ projectName, walls, furniture, materials, canvasEl, threeEl }) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()

  // ── Background
  pdf.setFillColor(8, 7, 10)
  pdf.rect(0, 0, W, H, 'F')

  // ── Gold header bar
  pdf.setFillColor(201, 162, 39)
  pdf.rect(0, 0, W, 18, 'F')

  // ── Title
  pdf.setTextColor(8, 7, 10)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('EL SHADDAI INTERIORS', 14, 11)

  pdf.setTextColor(201, 162, 39)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(projectName || 'Interior Design', W - 14, 11, { align: 'right' })

  // ── Date
  pdf.setTextColor(100, 100, 100)
  pdf.setFontSize(8)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 14, H - 8)

  // ── Floor plan image (left panel)
  if (canvasEl) {
    try {
      const floorCanvas = await html2canvas(canvasEl, { backgroundColor:'#08070a', scale:1.5, useCORS:true, logging:false })
      const floorImg = floorCanvas.toDataURL('image/png')
      pdf.addImage(floorImg, 'PNG', 14, 22, 120, 80)
      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('FLOOR PLAN — 2D', 14, 107)
    } catch {}
  }

  // ── 3D render image (right panel)
  if (threeEl) {
    try {
      const threeCanvas = await html2canvas(threeEl, { backgroundColor:'#08070a', scale:1.5, useCORS:true, logging:false })
      const threeImg = threeCanvas.toDataURL('image/png')
      pdf.addImage(threeImg, 'PNG', 142, 22, 140, 80)
      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('3D LIVE VIEW', 142, 107)
    } catch {}
  }

  // ── Stats section
  pdf.setFillColor(22, 20, 29)
  pdf.rect(14, 112, 268, 48, 'F')
  pdf.setDrawColor(201, 162, 39)
  pdf.setLineWidth(0.3)
  pdf.rect(14, 112, 268, 48)

  const stats = [
    ['Walls', walls.length],
    ['Doors', walls.filter(w=>w.type==='door').length],
    ['Windows', walls.filter(w=>w.type==='window').length],
    ['Furniture', furniture.length],
    ['Floor', materials?.floors?.replace(/-/g,' ')||'Oak'],
    ['Wall Finish', materials?.walls?.replace(/-/g,' ')||'White Paint'],
  ]

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(201, 162, 39)
  pdf.text('DESIGN SPECIFICATIONS', 20, 120)

  stats.forEach(([l, v], i) => {
    const x = 20 + (i % 3) * 90
    const y = 128 + Math.floor(i / 3) * 14
    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text(l.toUpperCase(), x, y)
    pdf.setTextColor(237, 233, 227)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(String(v), x, y + 6)
  })

  // ── Furniture list
  if (furniture.length > 0) {
    pdf.addPage()
    pdf.setFillColor(8, 7, 10)
    pdf.rect(0, 0, W, H, 'F')
    pdf.setFillColor(201, 162, 39)
    pdf.rect(0, 0, W, 18, 'F')
    pdf.setTextColor(8, 7, 10)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FURNITURE SCHEDULE', 14, 11)

    pdf.setFillColor(22, 20, 29)
    pdf.rect(14, 22, 268, 8, 'F')
    ;['#', 'Item Name', 'Brand', 'Material', 'W×H×D (m)', 'Price (₹)'].forEach((h, i) => {
      const xs = [14, 28, 100, 148, 188, 240]
      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'bold')
      pdf.text(h, xs[i] + 2, 27)
    })

    furniture.slice(0, 25).forEach((f, i) => {
      const y = 36 + i * 7
      const item = f.catalogItem
      if (i % 2 === 0) {
        pdf.setFillColor(15, 14, 20)
        pdf.rect(14, y - 4, 268, 7, 'F')
      }
      const row = [
        String(i + 1),
        item.name?.slice(0, 28) || '',
        item.brand || '',
        item.material || '',
        `${item.dims?.w||'?'}×${item.dims?.h||'?'}×${item.dims?.d||'?'}`,
        `₹${(item.price||0).toLocaleString('en-IN')}`,
      ]
      const xs = [14, 28, 100, 148, 188, 240]
      row.forEach((v, j) => {
        pdf.setTextColor(200, 200, 200)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        pdf.text(v, xs[j] + 2, y)
      })
    })

    const total = furniture.reduce((s,f)=>s+(f.catalogItem?.price||0),0)
    pdf.setTextColor(201, 162, 39)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`TOTAL ESTIMATED VALUE: ₹${total.toLocaleString('en-IN')}`, 14, H - 14)
  }

  // ── Footer watermark
  pdf.setPage(1)
  pdf.setTextColor(40, 40, 40)
  pdf.setFontSize(7)
  pdf.text('elshaddaiinterior.vercel.app  ·  Confidential Design Document', W / 2, H - 5, { align: 'center' })

  pdf.save(`${(projectName || 'design').replace(/\s+/g,'_')}_${Date.now()}.pdf`)
}
