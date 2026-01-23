import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface FontDefinition {
  cssFontFamily: string;
  styleBlock: string | null;
}

@Injectable()
export class GoogleFontsService {
  private readonly logger = new Logger(GoogleFontsService.name);
  private readonly apiKey: string | undefined;

  // Cache per "family-weight" so we only download each font once per process
  private readonly fontCache = new Map<string, FontDefinition>();

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('GOOGLE_FONTS_API_KEY') ||
      process.env.GOOGLE_FONTS_API_KEY;

    if (!this.apiKey) {
      this.logger.log(
        'GOOGLE_FONTS_API_KEY is not set. Falling back to public Google Fonts CSS endpoint without API key.',
      );
    }
  }

  /**
   * Returns a font-family name and an optional @font-face style block
   * that can be injected into an SVG so that Sharp renders with the
   * correct Google Font.
   */
  async getFontDefinition(
    fontFamily: string,
    fontWeight: number,
  ): Promise<FontDefinition> {
    const cacheKey = `${fontFamily}-${fontWeight}`;
    const cached = this.fontCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // NOTE: The Web Fonts Developer API is primarily for listing fonts.
      // To actually get the font file, we still need to call the standard
      // CSS endpoint, which returns URLs to font binaries (woff2/ttf).
      //
      // We use the family + weight the template asked for.
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        fontFamily,
      )}:wght@${fontWeight}&display=swap`;

      const cssResponse = await fetch(cssUrl, {
        headers: {
          // Make sure we get woff2 (supported and small)
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        },
      });

      if (!cssResponse.ok) {
        this.logger.warn(
          `Failed to fetch CSS for Google Font "${fontFamily}" (${fontWeight}). Status: ${cssResponse.status}`,
        );
        const fallback: FontDefinition = {
          cssFontFamily: fontFamily,
          styleBlock: null,
        };
        this.fontCache.set(cacheKey, fallback);
        return fallback;
      }

      const cssText = await cssResponse.text();
      const urlMatch = cssText.match(/src:\s*url\(([^)]+)\)/);

      if (!urlMatch) {
        this.logger.warn(
          `Could not find font URL in CSS for Google Font "${fontFamily}" (${fontWeight}).`,
        );
        const fallback: FontDefinition = {
          cssFontFamily: fontFamily,
          styleBlock: null,
        };
        this.fontCache.set(cacheKey, fallback);
        return fallback;
      }

      const fontUrl = urlMatch[1].replace(/['"]/g, '');

      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
        this.logger.warn(
          `Failed to download font binary from "${fontUrl}" for "${fontFamily}" (${fontWeight}). Status: ${fontResponse.status}`,
        );
        const fallback: FontDefinition = {
          cssFontFamily: fontFamily,
          styleBlock: null,
        };
        this.fontCache.set(cacheKey, fallback);
        return fallback;
      }

      const arrayBuffer = await fontResponse.arrayBuffer();
      const base64Font = Buffer.from(arrayBuffer).toString('base64');

      // Use a safe internal family name to avoid collisions
      const internalFamily = `${fontFamily.replace(/\s+/g, '-')}-${fontWeight}`;

      const styleBlock = `
@font-face {
  font-family: '${internalFamily}';
  src: url('data:font/woff2;base64,${base64Font}') format('woff2');
  font-weight: ${fontWeight};
  font-style: normal;
}
`;

      const result: FontDefinition = {
        cssFontFamily: internalFamily,
        styleBlock,
      };

      this.fontCache.set(cacheKey, result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Error while resolving Google Font "${fontFamily}" (${fontWeight}): ${message}`,
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
