const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un ticket PDF de 80mm de ancho para una venta.
 * @param {object} sale  - { id, total, payment_method, created_at, user_name }
 * @param {Array}  items - [{ quantity, product_name, price }]
 * @param {string} outputPath - ruta absoluta donde guardar el PDF
 * @returns {Promise<string>} - resuelve con outputPath
 */
function generateTicket(sale, items, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // 80 mm ≈ 226.77 pt (1 pt = 1/72 in; 80mm / 25.4 * 72 ≈ 226.77)
      const doc = new PDFDocument({ size: [226.77, 841.89], margin: 10 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Header
      doc.fontSize(14).font('Helvetica-Bold').text('MCN Digital Studio', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Sistema de Caja', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).text('─'.repeat(36), { align: 'center' });
      doc.moveDown(0.5);

      // Info de venta
      const ticketNum = String(sale.id).padStart(5, '0');
      const fecha = sale.created_at
        ? new Date(sale.created_at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
        : new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

      doc.fontSize(9);
      doc.text(`TICKET #${ticketNum}`);
      doc.text(`Fecha: ${fecha}`);
      if (sale.user_name) doc.text(`Vendedor: ${sale.user_name}`);
      doc.moveDown(0.5);
      doc.fontSize(8).text('─'.repeat(36), { align: 'center' });
      doc.moveDown(0.5);

      // Items
      doc.fontSize(9);
      items.forEach(item => {
        const left = `${item.quantity}x ${item.product_name || 'Producto'}`;
        const right = `$${Number(item.price).toFixed(2)}`;
        const lineWidth = doc.page.width - 20; // margin 10 each side
        doc.text(left, 10, doc.y, { continued: true, width: lineWidth - 60 });
        doc.text(right, { align: 'right', width: lineWidth });
      });

      doc.moveDown(0.5);
      doc.fontSize(8).text('─'.repeat(36), { align: 'center' });
      doc.moveDown(0.5);

      // Total
      doc.fontSize(13).font('Helvetica-Bold');
      const lineWidth = doc.page.width - 20;
      doc.text('TOTAL:', 10, doc.y, { continued: true, width: lineWidth - 80 });
      doc.text(`$${Number(sale.total).toFixed(2)}`, { align: 'right', width: lineWidth });

      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      const methodLabels = { cash: 'Efectivo', card: 'Tarjeta', mp: 'Mercado Pago', transfer: 'Transferencia' };
      const method = methodLabels[sale.payment_method] || (sale.payment_method || 'N/A').toUpperCase();
      doc.text(`Método: ${method}`, { align: 'center' });

      doc.moveDown(1.5);
      doc.fontSize(8).text('¡Gracias por su compra!', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(6).text('MCN Digital Studio', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateTicket };
