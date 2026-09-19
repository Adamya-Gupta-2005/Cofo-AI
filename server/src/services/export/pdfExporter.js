import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { renderStructuredDataToText } from '../validation/factValidator.js';

export const generatePDF = async (title = 'ContentForge Export', outputType = '', structuredData = {}) => {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const rawText = renderStructuredDataToText(outputType, structuredData);
  const lines = rawText.split('\n');

  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  let pageNumber = 1;

  const drawFooter = (pg, pNum) => {
    pg.drawText(`ContentForge AI — Generated ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: 30,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    pg.drawText(`Page ${pNum}`, {
      x: width - margin - 35,
      y: 30,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
  };

  drawFooter(page, pageNumber);

  // Document Title Header
  page.drawText(title, {
    x: margin,
    y: y - 10,
    size: 20,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16), // Slate-900
  });
  y -= 35;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });
  y -= 25;

  const wrapText = (text, maxWidth, font, size) => {
    const words = text.split(' ');
    const wrapped = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, size);
      if (textWidth > maxWidth && currentLine) {
        wrapped.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) wrapped.push(currentLine);
    return wrapped;
  };

  const maxWidth = width - margin * 2;

  for (const line of lines) {
    if (y < 60) {
      page = pdfDoc.addPage([595.28, 841.89]);
      pageNumber++;
      drawFooter(page, pageNumber);
      y = height - margin;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      y -= 10;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      y -= 10;
      const heading = trimmed.replace(/^#\s+/, '');
      page.drawText(heading, {
        x: margin,
        y,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25),
      });
      y -= 22;
    } else if (trimmed.startsWith('## ')) {
      y -= 8;
      const subHeading = trimmed.replace(/^##\s+/, '');
      page.drawText(subHeading, {
        x: margin,
        y,
        size: 13,
        font: fontBold,
        color: rgb(0.15, 0.23, 0.36),
      });
      y -= 18;
    } else if (trimmed.startsWith('### ')) {
      y -= 5;
      const h3 = trimmed.replace(/^###\s+/, '');
      page.drawText(h3, {
        x: margin,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.2, 0.25, 0.35),
      });
      y -= 16;
    } else {
      const wrapped = wrapText(trimmed, maxWidth, fontRegular, 10);
      for (const wLine of wrapped) {
        if (y < 60) {
          page = pdfDoc.addPage([595.28, 841.89]);
          pageNumber++;
          drawFooter(page, pageNumber);
          y = height - margin;
        }
        page.drawText(wLine, {
          x: margin,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 14;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
