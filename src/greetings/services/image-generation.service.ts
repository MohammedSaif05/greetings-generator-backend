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
  underline?: boolean;
  italic?: boolean;
  bold?: boolean;
  rotation?: number;
  outlineWidth?: number;
  outlineColor?: string;
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
    // First: allow direct file names under assets/fonts
    // Examples that will work:
    // - "AlexBrush-Regular.ttf"
    // - "AlexBrush-Regular"
    // - "assets/fonts/AlexBrush-Regular.ttf" (we'll extract basename)
    const fontFamilyBase = path.basename(fontFamily);
    const directCandidates = [
      fontFamilyBase,
      fontFamilyBase.endsWith('.ttf')
        ? fontFamilyBase
        : `${fontFamilyBase}.ttf`,
    ];
    for (const candidate of directCandidates) {
      const directPath = path.join(process.cwd(), 'assets', 'fonts', candidate);
      if (fs.existsSync(directPath)) {
        return directPath;
      }
    }

    // Clean font family name
    const cleanName = fontFamily
      .replace('.ttf', '')
      .replace(/\s+/g, ' ')
      .trim();

    // Font mapping - maps common font names to actual font files in assets/fonts
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

      // Handwritten / script fonts (single-regular weights)
      'Alex Brush': {
        folder: '',
        getFileName: () => 'AlexBrush-Regular.ttf',
      },
      Allura: {
        folder: '',
        getFileName: () => 'Allura-Regular.ttf',
      },
      Caveat: {
        folder: '',
        getFileName: () => 'Caveat-Regular.ttf',
      },
      'Cedarville Cursive': {
        folder: '',
        getFileName: () => 'CedarvilleCursive-Regular.ttf',
      },
      'Dancing Script': {
        folder: '',
        getFileName: () => 'DancingScript-Regular.ttf',
      },
      'Euphoria Script': {
        folder: '',
        getFileName: () => 'EuphoriaScript-Regular.ttf',
      },
      Festive: {
        folder: '',
        getFileName: () => 'Festive-Regular.ttf',
      },
      'Grand Hotel': {
        folder: '',
        getFileName: () => 'GrandHotel-Regular.ttf',
      },
      'Great Vibes': {
        folder: '',
        getFileName: () => 'GreatVibes-Regular.ttf',
      },
      'Indie Flower': {
        folder: '',
        getFileName: () => 'IndieFlower-Regular.ttf',
      },
      'Ingrid Darling': {
        folder: '',
        getFileName: () => 'IngridDarling-Regular.ttf',
      },
      Italianno: {
        folder: '',
        getFileName: () => 'Italianno-Regular.ttf',
      },
      'Just Another Hand': {
        folder: '',
        getFileName: () => 'JustAnotherHand-Regular.ttf',
      },
      'Kaushan Script': {
        folder: '',
        getFileName: () => 'KaushanScript-Regular.ttf',
      },
      Lobster: {
        folder: '',
        getFileName: () => 'Lobster-Regular.ttf',
      },
      'Lovers Quarrel': {
        folder: '',
        getFileName: () => 'LoversQuarrel-Regular.ttf',
      },
      'Marck Script': {
        folder: '',
        getFileName: () => 'MarckScript-Regular.ttf',
      },
      'Mea Culpa': {
        folder: '',
        getFileName: () => 'MeaCulpa-Regular.ttf',
      },
      Merriweather: {
        folder: '',
        getFileName: () => 'Merriweather-VariableFont_opsz,wdth,wght.ttf',
      },
      'Oleo Script': {
        folder: '',
        getFileName: () => 'OleoScript-Regular.ttf',
      },
      Pacifico: {
        folder: '',
        getFileName: () => 'Pacifico-Regular.ttf',
      },
      Parisienne: {
        folder: '',
        getFileName: () => 'Parisienne-Regular.ttf',
      },
      'Permanent Marker': {
        folder: '',
        getFileName: () => 'PermanentMarker-Regular.ttf',
      },
      'Pinyon Script': {
        folder: '',
        getFileName: () => 'PinyonScript-Regular.ttf',
      },
      Raleway: {
        folder: '',
        getFileName: () => 'Raleway-VariableFont_wght.ttf',
      },
      'Rouge Script': {
        folder: '',
        getFileName: () => 'RougeScript-Regular.ttf',
      },
      Sacramento: {
        folder: '',
        getFileName: () => 'Sacramento-Regular.ttf',
      },
      Satisfy: {
        folder: '',
        getFileName: () => 'Satisfy-Regular.ttf',
      },
      Tangerine: {
        folder: '',
        getFileName: () => 'Tangerine-Regular.ttf',
      },
      Yellowtail: {
        folder: '',
        getFileName: () => 'Yellowtail-Regular.ttf',
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
  ): Promise<{ width: number; height: number; buffer: Buffer }> {
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
          // Get font weight (allow bold flag to influence)
          const baseWeight =
            typedTextArea.fontWeight !== undefined
              ? typedTextArea.fontWeight
              : 400;
          const fontWeight = typedTextArea.bold
            ? Math.max(baseWeight, 700)
            : baseWeight;

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
            /* Use a widely-supported data URL for Sharp/librsvg */
            src: url("data:font/ttf;base64,${fontBase64}") format("truetype");
            font-weight: ${fontWeight};
            font-style: ${typedTextArea.italic ? 'italic' : 'normal'};
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

          const textDecoration = typedTextArea.underline ? 'underline' : 'none';
          const fontStyle = typedTextArea.italic ? 'italic' : 'normal';
          const outlineWidth = typedTextArea.outlineWidth || 0;
          const outlineColor = typedTextArea.outlineColor || '#000000';
          const strokeAttr =
            outlineWidth > 0
              ? `stroke="${outlineColor}" stroke-width="${outlineWidth}" paint-order="stroke" stroke-linejoin="round"`
              : '';

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
          font-style="${fontStyle}"
          fill="${typedTextArea.fontColor}"
          text-anchor="${textAnchor}"
          text-decoration="${textDecoration}"
          dominant-baseline="baseline"
          ${filterId ? `filter="url(#${filterId})"` : ''}
          ${strokeAttr}
        >${this.escapeXml(line)}</text>`;
            })
            .join('');

          // Apply rotation (around text area's center) if provided
          const rotation = typedTextArea.rotation || 0;
          const rotateCx = typedTextArea.x + typedTextArea.width / 2;
          const rotateCy = typedTextArea.y + typedTextArea.height / 2;
          const rotatedGroupStart =
            rotation !== 0
              ? `<g transform="rotate(${rotation} ${rotateCx} ${rotateCy})">`
              : '';
          const rotatedGroupEnd = rotation !== 0 ? `</g>` : '';

          // Create SVG with font, background, text shadow, and text
          const svgText = `<svg width="${template.canvas.width}" height="${template.canvas.height}" xmlns="http://www.w3.org/2000/svg">${fontEmbed}${textShadowFilter}${backgroundRect}${rotatedGroupStart}${textElements}${rotatedGroupEnd}
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

    // Determine target resolution based on template orientation
    let targetWidth: number;
    let targetHeight: number;

    switch (template.orientation) {
      case 'landscape':
        targetWidth = 1200;
        targetHeight = 675;
        break;
      case 'portrait':
        targetWidth = 1080;
        targetHeight = 1350;
        break;
      case 'square':
        targetWidth = 1080;
        targetHeight = 1080;
        break;
      default:
        // Fallback to template canvas size if orientation is unknown
        targetWidth = template.canvas.width;
        targetHeight = template.canvas.height;
    }

    // Resize to target resolution
    const resizedBuffer = await sharp(baseImageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();

    // Return single image based on orientation
    return {
      width: targetWidth,
      height: targetHeight,
      buffer: resizedBuffer,
    };
  }

  private slugify(value: string): string {
    return (
      value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60) || 'greeting'
    );
  }

  async uploadGeneratedImage(
    image: { width: number; height: number; buffer: Buffer },
    rowNumber: number,
    recipientName?: string,
    occasion?: string,
  ): Promise<{ width: number; height: number; url: string }> {
    const occasionSlug = occasion ? this.slugify(occasion) : 'greeting';
    const recipientSlug = recipientName
      ? this.slugify(recipientName)
      : 'recipient';
    const fileName = `greetings/${recipientSlug}_${occasionSlug}_${rowNumber}_${image.width}x${image.height}.png`;
    const url = await this.uploadImage(image.buffer, fileName);
    return {
      width: image.width,
      height: image.height,
      url,
    };
  }

  private async uploadImage(buffer: Buffer, fileName: string): Promise<string> {
    return this.r2Service.uploadBuffer(buffer, fileName, 'image/png');
  }
}
