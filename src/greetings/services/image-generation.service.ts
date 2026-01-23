import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { TemplateDocument } from '../../templates/schemas/template.schema';
import { CsvRowDto } from '../dto/csv-row.dto';
import { R2Service } from '../../services/r2.service';
import { LocalFontsService } from '../../services/local-fonts.service';

interface TextAreaMapping {
  recipientName?: string;
  occasion?: string;
  message?: string;
  senderName?: string;
}

interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontWeight?: number;
  fontColor: string;
  maxFontSize: number;
  minFontSize: number;
  textAlign: string;
  lineHeight: number;
  textShadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  background?: {
    enabled: boolean;
    color: string;
    padding: number;
    borderRadius: number;
  };
}

@Injectable()
export class ImageGenerationService {
  constructor(
    private readonly r2Service: R2Service,
    private readonly localFontsService: LocalFontsService,
  ) {}

  /**
   * Downloads an image from R2 using the SDK (for internal backend processing).
   * This method uses the R2 SDK instead of public URLs for backend operations.
   *
   * @param url - The R2 URL or key of the image to download
   * @returns Buffer containing the image data
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      // Use R2 SDK to fetch image internally (not public URL)
      return await this.r2Service.getImageBuffer(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to download background image from R2: ${errorMessage}`,
      );
    }
  }

  private mapTextAreaToField(textAreaId: string): keyof TextAreaMapping | null {
    // Exact match only - textArea.id must match CSV column name exactly
    // This ensures deterministic mapping and prevents silent mismatches
    const exactMatches: Record<string, keyof TextAreaMapping> = {
      recipientName: 'recipientName',
      occasion: 'occasion',
      message: 'message',
      senderName: 'senderName',
    };

    return exactMatches[textAreaId] || null;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Simple word-wrapping helper that breaks text into lines with at most
   * maxChars characters per line (tries to break on spaces first).
   */
  private wrapText(text: string, maxChars: number): string[] {
    if (maxChars <= 0) {
      return [text];
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        // If the word itself is longer than maxChars, hard-split it
        if (word.length > maxChars) {
          const chunks = word.match(new RegExp(`.{1,${maxChars}}`, 'g')) || [
            word,
          ];
          lines.push(...chunks.slice(0, -1));
          currentLine = chunks[chunks.length - 1];
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  async generateGreetingImage(
    template: TemplateDocument,
    csvRow: CsvRowDto,
  ): Promise<Array<{ width: number; height: number; buffer: Buffer }>> {
    // Decide final output size based on template orientation.
    // The design coordinates in the template are assumed to be in the
    // original canvas space (template.canvas.width/height). We scale
    // everything to the fixed output size per orientation.
    let targetWidth = template.canvas.width;
    let targetHeight = template.canvas.height;

    if (template.orientation === 'landscape') {
      targetWidth = 1200;
      targetHeight = 675;
    } else if (template.orientation === 'portrait') {
      targetWidth = 1080;
      targetHeight = 1350;
    } else if (template.orientation === 'square') {
      targetWidth = 1080;
      targetHeight = 1080;
    }

    const scaleX = targetWidth / template.canvas.width;
    const scaleY = targetHeight / template.canvas.height;

    // Download background image and resize to the target output size
    const backgroundImageBuffer = await this.downloadImage(
      template.backgroundImage.url,
    );

    let image = sharp(backgroundImageBuffer).resize(targetWidth, targetHeight, {
      fit: 'cover',
    });

    // Collect all font definitions, text elements, filters, and backgrounds
    // We'll build a single SVG overlay with all text areas combined
    const fontFaceStyles = new Set<string>();
    const textShadowFilters: string[] = [];
    const backgroundRects: string[] = [];
    const textElements: string[] = [];

    // Process each text area and collect all components
    for (const textArea of template.textAreas) {
      const baseArea = textArea as TextArea;

      // Scale the text area to the target output size so that templates
      // defined at the original canvas resolution still look correct when
      // rendered at the fixed resolution for their orientation.
      const typedTextArea: TextArea = {
        ...baseArea,
        x: baseArea.x * scaleX,
        y: baseArea.y * scaleY,
        width: baseArea.width * scaleX,
        height: baseArea.height * scaleY,
        maxFontSize: baseArea.maxFontSize * ((scaleX + scaleY) / 2),
        minFontSize: baseArea.minFontSize * ((scaleX + scaleY) / 2),
      };
      const fieldName = this.mapTextAreaToField(typedTextArea.id);
      if (fieldName) {
        const text = csvRow[fieldName];
        if (text && text.trim() !== '') {
          // Calculate font size that fits within the text area (both width & height)
          // We approximate average character width as 0.55 * fontSize and adjust
          // down until the wrapped text fits vertically inside the box.
          let fontSize = typedTextArea.maxFontSize;
          let lines: string[] = [];
          const minFontSize = typedTextArea.minFontSize;

          while (fontSize >= minFontSize) {
            const avgCharWidth = fontSize * 0.55;
            const maxCharsPerLine = Math.max(
              1,
              Math.floor(typedTextArea.width / avgCharWidth),
            );

            lines = this.wrapText(text, maxCharsPerLine);
            const totalHeight =
              lines.length * fontSize * typedTextArea.lineHeight;

            if (totalHeight <= typedTextArea.height) {
              break;
            }

            fontSize -= 2; // decrement and retry
          }

          if (fontSize < minFontSize) {
            fontSize = minFontSize;
          }

          const requestedFontFamily = typedTextArea.fontFamily
            .replace('.ttf', '')
            .replace(/\s+/g, ' ');

          // Load local font definition (embeds font file into SVG)
          const fontWeight =
            typedTextArea.fontWeight !== undefined
              ? typedTextArea.fontWeight
              : 400;

          const fontDefinition = this.localFontsService.getFontDefinition(
            requestedFontFamily,
            fontWeight,
          );

          // Collect font face style if available
          if (fontDefinition.styleBlock) {
            fontFaceStyles.add(fontDefinition.styleBlock);
          }

          const svgFontFamily = fontDefinition.cssFontFamily;

          // Calculate text position based on alignment. We vertically center the
          // whole block of lines within the text area.
          let textX = typedTextArea.x;
          if (typedTextArea.textAlign === 'center') {
            textX = typedTextArea.x + typedTextArea.width / 2;
          } else if (typedTextArea.textAlign === 'right') {
            textX = typedTextArea.x + typedTextArea.width;
          }

          const totalTextHeight =
            lines.length * fontSize * typedTextArea.lineHeight;
          const firstLineY =
            typedTextArea.y +
            (typedTextArea.height - totalTextHeight) / 2 +
            fontSize; // baseline of first line

          // Build text shadow filter if provided
          let filterId = '';
          if (typedTextArea.textShadow) {
            filterId = `shadow-${typedTextArea.id}`;
            const shadow = typedTextArea.textShadow;
            textShadowFilters.push(`
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" stdDeviation="${shadow.blur}" flood-color="${shadow.color}"/>
        </filter>`);
          }

          // Build background rectangle if enabled
          if (
            typedTextArea.background?.enabled &&
            typedTextArea.background.color
          ) {
            const bg = typedTextArea.background;
            const bgX = typedTextArea.x - bg.padding;
            const bgY = typedTextArea.y - bg.padding;
            const bgWidth = typedTextArea.width + bg.padding * 2;
            const bgHeight = typedTextArea.height + bg.padding * 2;
            backgroundRects.push(`
        <rect
          x="${bgX}"
          y="${bgY}"
          width="${bgWidth}"
          height="${bgHeight}"
          fill="${bg.color}"
          rx="${bg.borderRadius}"
          ry="${bg.borderRadius}"
        />`);
          }

          const tspanElements = lines
            .map((line, index) => {
              const dy = index === 0 ? 0 : fontSize * typedTextArea.lineHeight;
              return `<tspan x="${textX}" dy="${dy}">${this.escapeXml(
                line,
              )}</tspan>`;
            })
            .join('');

          // Build the text element
          textElements.push(`
        <text
          x="${textX}"
          y="${firstLineY}"
          font-family="${svgFontFamily}, Arial, sans-serif"
          font-size="${fontSize}px"
          font-weight="${fontWeight}"
          fill="${typedTextArea.fontColor}"
          text-anchor="${
            typedTextArea.textAlign === 'center'
              ? 'middle'
              : typedTextArea.textAlign === 'right'
                ? 'end'
                : 'start'
          }"
          ${filterId ? `filter="url(#${filterId})"` : ''}
        >
          ${tspanElements}
        </text>`);
        }
      }
    }

    // Build a single SVG overlay with all text areas combined
    if (textElements.length > 0) {
      const defsBlock =
        textShadowFilters.length > 0
          ? `<defs>
${textShadowFilters.join('\n')}
      </defs>`
          : '';

      const svgText = `<svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${defsBlock}
  ${backgroundRects.join('\n')}
  ${textElements.join('\n')}
</svg>`;

      // Apply the single SVG overlay
      image = image.composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        },
      ]);
    }

    // CRITICAL: Generate base image with text baked in BEFORE returning
    // This ensures all text is rendered and saved to the buffer
    const baseImageBuffer = await image.png().toBuffer();

    // Return a single image that matches the fixed output size based on
    // the template orientation.
    return [
      {
        width: targetWidth,
        height: targetHeight,
        buffer: baseImageBuffer,
      },
    ];
  }

  async uploadGeneratedImages(
    images: Array<{ width: number; height: number; buffer: Buffer }>,
    rowNumber: number,
    templateId: string,
  ): Promise<Array<{ width: number; height: number; url: string }>> {
    const uploadPromises = images.map(async (image) => {
      const fileName = `greetings/${templateId}_${rowNumber}_${image.width}x${image.height}.png`;
      const url = await this.uploadImage(image.buffer, fileName);
      return {
        width: image.width,
        height: image.height,
        url,
      };
    });

    return Promise.all(uploadPromises);
  }

  private async uploadImage(buffer: Buffer, fileName: string): Promise<string> {
    return this.r2Service.uploadBuffer(buffer, fileName, 'image/png');
  }
}
