import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { TemplateDocument } from '../../templates/schemas/template.schema';
import { CsvRowDto } from '../dto/csv-row.dto';
import { R2Service } from '../../services/r2.service';
import * as fs from 'fs';
import * as path from 'path';

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
  constructor(private readonly r2Service: R2Service) {}

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
   * Maps font family names to actual font file paths
   */
  private getFontFilePath(
    fontFamily: string,
    fontWeight: number = 400,
  ): string | null {
    // Clean font family name
    const cleanName = fontFamily
      .replace('.ttf', '')
      .replace(/\s+/g, ' ')
      .trim();

    // Font mapping - maps common font names to actual font files in assets
    const fontMap: Record<
      string,
      { folder: string; getFileName: (weight: number) => string }
    > = {
      Poppins: {
        folder: 'Poppins',
        getFileName: (weight) => {
          if (weight <= 300) return 'Poppins-Light.ttf';
          if (weight <= 400) return 'Poppins-Regular.ttf';
          if (weight <= 500) return 'Poppins-Medium.ttf';
          if (weight <= 600) return 'Poppins-SemiBold.ttf';
          if (weight <= 700) return 'Poppins-Bold.ttf';
          return 'Poppins-ExtraBold.ttf';
        },
      },
      Jost: {
        folder: 'Jost',
        getFileName: (weight) => {
          if (weight <= 300) return 'Jost-Light.ttf';
          if (weight <= 400) return 'Jost-Regular.ttf';
          if (weight <= 500) return 'Jost-Medium.ttf';
          if (weight <= 600) return 'Jost-SemiBold.ttf';
          if (weight <= 700) return 'Jost-Bold.ttf';
          return 'Jost-ExtraBold.ttf';
        },
      },
      Montserrat: {
        folder: 'Montserrat',
        getFileName: (weight) => {
          if (weight <= 300) return 'Montserrat-Light.ttf';
          if (weight <= 400) return 'Montserrat-Regular.ttf';
          if (weight <= 500) return 'Montserrat-Medium.ttf';
          if (weight <= 600) return 'Montserrat-SemiBold.ttf';
          if (weight <= 700) return 'Montserrat-Bold.ttf';
          return 'Montserrat-ExtraBold.ttf';
        },
      },
      'IBM Plex Sans': {
        folder: 'IBM_Plex_Sans',
        getFileName: (weight) => {
          if (weight <= 300) return 'IBMPlexSans-Light.ttf';
          if (weight <= 400) return 'IBMPlexSans-Regular.ttf';
          if (weight <= 500) return 'IBMPlexSans-Medium.ttf';
          if (weight <= 600) return 'IBMPlexSans-SemiBold.ttf';
          if (weight <= 700) return 'IBMPlexSans-Bold.ttf';
          return 'IBMPlexSans-ExtraBold.ttf';
        },
      },
      Inter: {
        folder: 'Inter',
        getFileName: (weight) => {
          // Use variable font or static based on weight
          if (weight === 400) return 'Inter-VariableFont_opsz,wght.ttf';
          return 'Inter-VariableFont_opsz,wght.ttf';
        },
      },
      Roboto: {
        folder: 'Roboto',
        getFileName: (weight) => {
          if (weight === 400) return 'Roboto-VariableFont_wdth,wght.ttf';
          return 'Roboto-VariableFont_wdth,wght.ttf';
        },
      },
      Lato: {
        folder: 'Lato',
        getFileName: (weight) => {
          if (weight <= 300) return 'Lato-Light.ttf';
          if (weight <= 400) return 'Lato-Regular.ttf';
          if (weight <= 700) return 'Lato-Bold.ttf';
          return 'Lato-Black.ttf';
        },
      },
      'Playfair Display': {
        folder: 'Playfair_Display',
        getFileName: (weight) => {
          if (weight === 400) return 'PlayfairDisplay-VariableFont_wght.ttf';
          return 'PlayfairDisplay-VariableFont_wght.ttf';
        },
      },
    };

    const fontConfig = fontMap[cleanName];
    if (!fontConfig) {
      return null;
    }

    const fontFileName = fontConfig.getFileName(fontWeight);
    const fontPath = path.join(
      process.cwd(),
      'assets',
      'fonts',
      fontConfig.folder,
      fontFileName,
    );

    // Check if file exists, if not try static folder
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }

    // Try static folder
    const staticPath = path.join(
      process.cwd(),
      'assets',
      'fonts',
      fontConfig.folder,
      'static',
      fontFileName,
    );

    if (fs.existsSync(staticPath)) {
      return staticPath;
    }

    return null;
  }

  /**
   * Loads font file and converts to base64 for embedding in SVG
   */
  private loadFontAsBase64(fontPath: string): string {
    try {
      const fontBuffer = fs.readFileSync(fontPath);
      return fontBuffer.toString('base64');
    } catch (error) {
      console.warn(`Failed to load font from ${fontPath}:`, error);
      return '';
    }
  }

  /**
   * Wraps text into lines that fit within the specified width
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    // Simple word wrapping - split by spaces and combine words until width is exceeded
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    // Approximate character width (this is a rough estimate)
    // For more accurate measurement, you'd need a font metrics library
    const avgCharWidth = fontSize * 0.6; // Rough estimate: 60% of font size

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const estimatedWidth = testLine.length * avgCharWidth;

      if (estimatedWidth <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  }

  /**
   * Calculates optimal font size that fits text within the text area
   */
  private calculateOptimalFontSize(
    text: string,
    textArea: TextArea,
    initialFontSize: number,
  ): { fontSize: number; lines: string[] } {
    let fontSize = Math.min(initialFontSize, textArea.maxFontSize);
    fontSize = Math.max(fontSize, textArea.minFontSize);

    const lineHeight = textArea.lineHeight || 1.2;
    const maxLines = Math.floor(textArea.height / (fontSize * lineHeight));

    // Try to fit text with current font size
    let lines = this.wrapText(text, textArea.width, fontSize);

    // If text doesn't fit, reduce font size
    while (lines.length > maxLines && fontSize > textArea.minFontSize) {
      fontSize = Math.max(fontSize - 2, textArea.minFontSize);
      lines = this.wrapText(text, textArea.width, fontSize);
    }

    // If still too many lines, truncate
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      // Truncate last line if needed
      const lastLine = lines[lines.length - 1];
      const maxChars = Math.floor(textArea.width / (fontSize * 0.6));
      if (lastLine.length > maxChars) {
        lines[lines.length - 1] = lastLine.substring(0, maxChars - 3) + '...';
      }
    }

    return { fontSize, lines };
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
          // Get font weight
          const fontWeight =
            typedTextArea.fontWeight !== undefined
              ? typedTextArea.fontWeight
              : 400;

          // Calculate optimal font size and wrap text
          const initialFontSize = Math.min(
            typedTextArea.maxFontSize,
            typedTextArea.height * 0.8,
          );
          const { fontSize, lines } = this.calculateOptimalFontSize(
            text,
            typedTextArea,
            initialFontSize,
          );

          // Get font file path and load font
          const fontFamily = typedTextArea.fontFamily
            .replace('.ttf', '')
            .replace(/\s+/g, ' ')
            .trim();

          const fontPath = this.getFontFilePath(fontFamily, fontWeight);
          let fontEmbed = '';
          let fontFamilyName = fontFamily;

          if (fontPath) {
            const fontBase64 = this.loadFontAsBase64(fontPath);
            if (fontBase64) {
              fontFamilyName = `font-${typedTextArea.id}`;
              fontEmbed = `
      <defs>
        <style>
          @font-face {
            font-family: "${fontFamilyName}";
            src: url("data:font/truetype;charset=utf-8;base64,${fontBase64}") format("truetype");
            font-weight: ${fontWeight};
            font-style: normal;
          }
        </style>
      </defs>`;
            }
          }

          // Calculate text position based on alignment
          const lineHeight = typedTextArea.lineHeight || 1.2;
          const lineSpacing = fontSize * lineHeight;
          const totalTextHeight = lines.length * lineSpacing;
          const startY =
            typedTextArea.y +
            (typedTextArea.height - totalTextHeight) / 2 +
            fontSize;

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

          // Build text elements for each line
          const textAnchor =
            typedTextArea.textAlign === 'center'
              ? 'middle'
              : typedTextArea.textAlign === 'right'
                ? 'end'
                : 'start';

          let textX: number;
          if (typedTextArea.textAlign === 'center') {
            textX = typedTextArea.x + typedTextArea.width / 2;
          } else if (typedTextArea.textAlign === 'right') {
            textX = typedTextArea.x + typedTextArea.width;
          } else {
            textX = typedTextArea.x;
          }

          const textElements = lines
            .map((line, index) => {
              const y = startY + index * lineSpacing;
              return `
        <text
          x="${textX}"
          y="${y}"
          font-family="${fontFamilyName}, ${fontFamily}, Arial, sans-serif"
          font-size="${fontSize}px"
          font-weight="${fontWeight}"
          fill="${typedTextArea.fontColor}"
          text-anchor="${textAnchor}"
          dominant-baseline="baseline"
          ${filterId ? `filter="url(#${filterId})"` : ''}
        >${this.escapeXml(line)}</text>`;
            })
            .join('');

          // Create SVG with font, background, text shadow, and text
          const svgText = `<svg width="${template.canvas.width}" height="${template.canvas.height}" xmlns="http://www.w3.org/2000/svg">${fontEmbed}${textShadowFilter}${backgroundRect}${textElements}
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
