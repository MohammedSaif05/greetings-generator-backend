import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { TemplateDocument } from '../../templates/schemas/template.schema';
import { CsvRowDto } from '../dto/csv-row.dto';
import { R2Service } from '../../services/r2.service';
import { GoogleFontsService } from '../../services/google-fonts.service';

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
    private readonly googleFontsService: GoogleFontsService,
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
    // Download background image
    const backgroundImageBuffer = await this.downloadImage(
      template.backgroundImage.url,
    );

    // Load image with sharp and resize to template canvas size first
    let image = sharp(backgroundImageBuffer);

    // Get image metadata
    const metadata = await image.metadata();
    const originalWidth = metadata.width || template.canvas.width;
    const originalHeight = metadata.height || template.canvas.height;

    // Resize to template canvas size if needed (do this BEFORE rendering text)
    if (
      originalWidth !== template.canvas.width ||
      originalHeight !== template.canvas.height
    ) {
      image = image.resize(template.canvas.width, template.canvas.height, {
        fit: 'cover',
      });
    }

    // Collect all SVG overlays for text areas
    const svgOverlays: Array<{ input: Buffer; top: number; left: number }> = [];

    // Build SVG overlays for each text area
    for (const textArea of template.textAreas) {
      const typedTextArea = textArea as TextArea;
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

          // Load Google Font definition (if configured) so the SVG uses the
          // correct typeface when rendered by Sharp.
          const fontWeight =
            typedTextArea.fontWeight !== undefined
              ? typedTextArea.fontWeight
              : 400;

          const fontDefinition =
            await this.googleFontsService.getFontDefinition(
              requestedFontFamily,
              fontWeight,
            );

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
          let textShadowFilter = '';
          let filterId = '';
          if (typedTextArea.textShadow) {
            filterId = `shadow-${typedTextArea.id}`;
            const shadow = typedTextArea.textShadow;
            textShadowFilter = `
      <defs>
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" stdDeviation="${shadow.blur}" flood-color="${shadow.color}"/>
        </filter>
      </defs>`;
          }

          // Build background rectangle if enabled
          let backgroundRect = '';
          if (
            typedTextArea.background?.enabled &&
            typedTextArea.background.color
          ) {
            const bg = typedTextArea.background;
            const bgX = typedTextArea.x - bg.padding;
            const bgY = typedTextArea.y - bg.padding;
            const bgWidth = typedTextArea.width + bg.padding * 2;
            const bgHeight = typedTextArea.height + bg.padding * 2;
            backgroundRect = `
      <rect
        x="${bgX}"
        y="${bgY}"
        width="${bgWidth}"
        height="${bgHeight}"
        fill="${bg.color}"
        rx="${bg.borderRadius}"
        ry="${bg.borderRadius}"
      />`;
          }

          const tspanElements = lines
            .map((line, index) => {
              const dy = index === 0 ? 0 : fontSize * typedTextArea.lineHeight;
              return `<tspan x="${textX}" dy="${dy}">${this.escapeXml(
                line,
              )}</tspan>`;
            })
            .join('');

          const fontFaceStyle =
            fontDefinition.styleBlock !== null
              ? `<style type="text/css">
${fontDefinition.styleBlock}
</style>`
              : '';

          // Create SVG with background, optional @font-face, text shadow, and wrapped text
          const svgText = `<svg width="${template.canvas.width}" height="${template.canvas.height}" xmlns="http://www.w3.org/2000/svg">
  ${fontFaceStyle}
  ${textShadowFilter}
  ${backgroundRect}
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
  >
    ${tspanElements}
  </text>
</svg>`;

          svgOverlays.push({
            input: Buffer.from(svgText),
            top: 0,
            left: 0,
          });
        }
      }
    }

    // Apply all text overlays at once using composite
    // This ensures text is baked into the image before any resizing
    if (svgOverlays.length > 0) {
      image = image.composite(svgOverlays);
    }

    // CRITICAL: Generate base image with text baked in BEFORE resizing
    // This ensures all text is rendered and saved to the buffer
    const baseImageBuffer = await image.png().toBuffer();

    // Generate multiple resolutions of the SAME orientation
    // A template can only generate images in its own orientation
    const images: Array<{ width: number; height: number; buffer: Buffer }> = [];

    const baseWidth = template.canvas.width;
    const baseHeight = template.canvas.height;
    const aspectRatio = baseWidth / baseHeight;

    // Define standard resolutions for each orientation
    // All resolutions maintain the template's aspect ratio
    const resolutions = [
      { width: baseWidth, height: baseHeight }, // Original size
      { width: 1600, height: Math.round(1600 / aspectRatio) }, // High res
      { width: 1920, height: Math.round(1920 / aspectRatio) }, // Full HD
    ];

    // Generate each resolution FROM the baseImageBuffer (which has text baked in)
    for (const resolution of resolutions) {
      const resizedBuffer = await sharp(baseImageBuffer)
        .resize(resolution.width, resolution.height, {
          fit: 'cover',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();

      images.push({
        width: resolution.width,
        height: resolution.height,
        buffer: resizedBuffer,
      });
    }

    return images;
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
