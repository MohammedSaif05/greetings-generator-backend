import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { getFontPath } from '../config/fonts.config';

interface FontDefinition {
  cssFontFamily: string;
  styleBlock: string | null;
}

@Injectable()
export class LocalFontsService {
  private readonly logger = new Logger(LocalFontsService.name);
  private readonly fontCache = new Map<string, FontDefinition>();

  /**
   * Gets a font definition with embedded @font-face for local font files.
   * Returns null styleBlock if font file is not found.
   */
  getFontDefinition(
    fontFamily: string,
    fontWeight: number = 400,
  ): FontDefinition {
    const cacheKey = `${fontFamily}-${fontWeight}`;
    const cached = this.fontCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const fontPath = getFontPath(fontFamily, fontWeight);

    if (!fontPath || !fs.existsSync(fontPath)) {
      this.logger.warn(
        `Font file not found for "${fontFamily}" (weight: ${fontWeight}). Falling back to system font.`,
      );
      const fallback: FontDefinition = {
        cssFontFamily: fontFamily,
        styleBlock: null,
      };
      this.fontCache.set(cacheKey, fallback);
      return fallback;
    }

    try {
      // Read font file as buffer
      const fontBuffer = fs.readFileSync(fontPath);
      const base64Font = fontBuffer.toString('base64');

      // Determine font format from file extension
      const ext = path.extname(fontPath).toLowerCase();
      let format = 'truetype';
      if (ext === '.woff') {
        format = 'woff';
      } else if (ext === '.woff2') {
        format = 'woff2';
      } else if (ext === '.otf') {
        format = 'opentype';
      }

      // Create a safe internal family name
      const internalFamily = `${fontFamily.replace(/\s+/g, '-')}-${fontWeight}`;

      // Build @font-face style block
      const styleBlock = `
@font-face {
  font-family: '${internalFamily}';
  src: url('data:font/${format};base64,${base64Font}') format('${format}');
  font-weight: ${fontWeight};
  font-style: normal;
}`;

      const result: FontDefinition = {
        cssFontFamily: internalFamily,
        styleBlock,
      };

      this.fontCache.set(cacheKey, result);
      this.logger.log(
        `Loaded local font: ${fontFamily} (${fontWeight}) from ${path.basename(fontPath)}`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to load font file "${fontPath}" for "${fontFamily}": ${message}`,
      );

      const fallback: FontDefinition = {
        cssFontFamily: fontFamily,
        styleBlock: null,
      };
      this.fontCache.set(cacheKey, fallback);
      return fallback;
    }
  }
}
