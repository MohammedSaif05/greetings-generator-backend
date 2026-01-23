import * as path from 'path';
import * as fs from 'fs';

/**
 * Font configuration mapping font family names to local font file paths.
 * Font weight mapping:
 * - 100: Thin
 * - 200: ExtraLight
 * - 300: Light
 * - 400: Regular
 * - 500: Medium
 * - 600: SemiBold
 * - 700: Bold
 * - 800: ExtraBold
 * - 900: Black
 */
export interface FontConfig {
  fontFamily: string;
  fontPath: string;
  fontWeight: number;
}

/**
 * Maps font family names and weights to local font file paths.
 * Add your fonts to the assets/fonts directory and update this mapping.
 */
export function getFontPath(
  fontFamily: string,
  fontWeight: number = 400,
): string | null {
  // Normalize font family name (remove spaces, handle special cases)
  const normalizedFamily = fontFamily.replace(/\s+/g, '_').replace(/-/g, '_');

  // Base path to assets/fonts directory
  const fontsBasePath = path.join(process.cwd(), 'assets', 'fonts');

  // Font weight to file name suffix mapping
  const weightMap: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };

  const weightSuffix = weightMap[fontWeight] || 'Regular';

  // Try different font file naming patterns
  const possiblePaths = [
    // Pattern 1: FontFamily-Regular.ttf (e.g., Lato-Regular.ttf)
    path.join(
      fontsBasePath,
      normalizedFamily,
      `${normalizedFamily}-${weightSuffix}.ttf`,
    ),
    // Pattern 2: FontFamily/static/FontFamily-Regular.ttf (e.g., Roboto/static/Roboto-Regular.ttf)
    path.join(
      fontsBasePath,
      normalizedFamily,
      'static',
      `${normalizedFamily}-${weightSuffix}.ttf`,
    ),
    // Pattern 3: FontFamily-Regular.ttf (direct in folder, e.g., Lato-Regular.ttf)
    path.join(
      fontsBasePath,
      normalizedFamily,
      `${normalizedFamily}-${weightSuffix}.ttf`,
    ),
    // Pattern 4: Try with spaces in name (e.g., Playfair Display -> Playfair_Display)
    path.join(
      fontsBasePath,
      normalizedFamily.replace(/_/g, ' '),
      'static',
      `${normalizedFamily.replace(/_/g, '')}-${weightSuffix}.ttf`,
    ),
    // Pattern 5: Try variable font as fallback
    path.join(
      fontsBasePath,
      normalizedFamily,
      `${normalizedFamily}-VariableFont*.ttf`,
    ),
  ];

  // Check each possible path
  for (const fontPath of possiblePaths) {
    // Handle glob patterns (for variable fonts)
    if (fontPath.includes('*')) {
      const dir = path.dirname(fontPath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const match = files.find((f) => f.includes('VariableFont'));
        if (match) {
          return path.join(dir, match);
        }
      }
    } else if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  }

  // If exact weight not found, try Regular as fallback
  if (fontWeight !== 400) {
    return getFontPath(fontFamily, 400);
  }

  return null;
}

/**
 * Get all available font families from the assets/fonts directory
 */
export function getAvailableFontFamilies(): string[] {
  const fontsBasePath = path.join(process.cwd(), 'assets', 'fonts');

  if (!fs.existsSync(fontsBasePath)) {
    return [];
  }

  const fontDirs = fs
    .readdirSync(fontsBasePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name.replace(/_/g, ' '));

  return fontDirs;
}
