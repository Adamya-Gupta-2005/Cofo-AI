import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { renderStructuredDataToText } from '../validation/factValidator.js';

export const generateDocx = async (title = 'ContentForge Export', outputType = '', structuredData = {}) => {
  const rawText = renderStructuredDataToText(outputType, structuredData);
  const lines = rawText.split('\n');

  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      continue;
    }

    if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      children.push(
        new Paragraph({
          children: [new TextRun(trimmed.replace(/^[-•]\s+/, ''))],
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun(trimmed)],
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};
