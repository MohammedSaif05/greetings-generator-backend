"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerationService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
const r2_service_1 = require("../../services/r2.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ImageGenerationService = class ImageGenerationService {
    r2Service;
    constructor(r2Service) {
        this.r2Service = r2Service;
    }
    async downloadImage(url) {
        try {
            return await this.r2Service.getImageBuffer(url);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to download background image from R2: ${errorMessage}`);
        }
    }
    mapTextAreaToField(textAreaId) {
        const exactMatches = {
            recipientName: 'recipientName',
            occasion: 'occasion',
            message: 'message',
            senderName: 'senderName',
        };
        return exactMatches[textAreaId] || null;
    }
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    getFontFilePath(fontFamily, fontWeight = 400) {
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
        const cleanName = fontFamily
            .replace('.ttf', '')
            .replace(/\s+/g, ' ')
            .trim();
        const collapsedName = cleanName.replace(/\s+/g, '');
        const derivedCandidates = [
            `${collapsedName}-Regular.ttf`,
            `${collapsedName}-regular.ttf`,
            `${collapsedName}Regular.ttf`,
            `${collapsedName}regular.ttf`,
        ];
        for (const candidate of derivedCandidates) {
            const derivedPath = path.join(process.cwd(), 'assets', 'fonts', candidate);
            if (fs.existsSync(derivedPath)) {
                return derivedPath;
            }
        }
        const fontMap = {
            Poppins: {
                folder: 'Poppins',
                getFileName: (weight) => {
                    if (weight <= 300)
                        return 'Poppins-Light.ttf';
                    if (weight <= 400)
                        return 'Poppins-Regular.ttf';
                    if (weight <= 500)
                        return 'Poppins-Medium.ttf';
                    if (weight <= 600)
                        return 'Poppins-SemiBold.ttf';
                    if (weight <= 700)
                        return 'Poppins-Bold.ttf';
                    return 'Poppins-ExtraBold.ttf';
                },
            },
            Jost: {
                folder: 'Jost',
                getFileName: (weight) => {
                    if (weight <= 300)
                        return 'Jost-Light.ttf';
                    if (weight <= 400)
                        return 'Jost-Regular.ttf';
                    if (weight <= 500)
                        return 'Jost-Medium.ttf';
                    if (weight <= 600)
                        return 'Jost-SemiBold.ttf';
                    if (weight <= 700)
                        return 'Jost-Bold.ttf';
                    return 'Jost-ExtraBold.ttf';
                },
            },
            Montserrat: {
                folder: 'Montserrat',
                getFileName: (weight) => {
                    if (weight <= 300)
                        return 'Montserrat-Light.ttf';
                    if (weight <= 400)
                        return 'Montserrat-Regular.ttf';
                    if (weight <= 500)
                        return 'Montserrat-Medium.ttf';
                    if (weight <= 600)
                        return 'Montserrat-SemiBold.ttf';
                    if (weight <= 700)
                        return 'Montserrat-Bold.ttf';
                    return 'Montserrat-ExtraBold.ttf';
                },
            },
            'IBM Plex Sans': {
                folder: 'IBM_Plex_Sans',
                getFileName: (weight) => {
                    if (weight <= 300)
                        return 'IBMPlexSans-Light.ttf';
                    if (weight <= 400)
                        return 'IBMPlexSans-Regular.ttf';
                    if (weight <= 500)
                        return 'IBMPlexSans-Medium.ttf';
                    if (weight <= 600)
                        return 'IBMPlexSans-SemiBold.ttf';
                    if (weight <= 700)
                        return 'IBMPlexSans-Bold.ttf';
                    return 'IBMPlexSans-ExtraBold.ttf';
                },
            },
            Inter: {
                folder: 'Inter',
                getFileName: (weight) => {
                    if (weight === 400)
                        return 'Inter-VariableFont_opsz,wght.ttf';
                    return 'Inter-VariableFont_opsz,wght.ttf';
                },
            },
            Roboto: {
                folder: 'Roboto',
                getFileName: (weight) => {
                    if (weight === 400)
                        return 'Roboto-VariableFont_wdth,wght.ttf';
                    return 'Roboto-VariableFont_wdth,wght.ttf';
                },
            },
            Lato: {
                folder: 'Lato',
                getFileName: (weight) => {
                    if (weight <= 300)
                        return 'Lato-Light.ttf';
                    if (weight <= 400)
                        return 'Lato-Regular.ttf';
                    if (weight <= 700)
                        return 'Lato-Bold.ttf';
                    return 'Lato-Black.ttf';
                },
            },
            'Playfair Display': {
                folder: 'Playfair_Display',
                getFileName: (weight) => {
                    if (weight === 400)
                        return 'PlayfairDisplay-VariableFont_wght.ttf';
                    return 'PlayfairDisplay-VariableFont_wght.ttf';
                },
            },
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
        const fontPath = path.join(process.cwd(), 'assets', 'fonts', fontConfig.folder, fontFileName);
        if (fs.existsSync(fontPath)) {
            return fontPath;
        }
        const staticPath = path.join(process.cwd(), 'assets', 'fonts', fontConfig.folder, 'static', fontFileName);
        if (fs.existsSync(staticPath)) {
            return staticPath;
        }
        return null;
    }
    loadFontAsBase64(fontPath) {
        try {
            const fontBuffer = fs.readFileSync(fontPath);
            return fontBuffer.toString('base64');
        }
        catch (error) {
            console.warn(`Failed to load font from ${fontPath}:`, error);
            return '';
        }
    }
    wrapText(text, maxWidth, fontSize) {
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';
        const avgCharWidth = fontSize * 0.6;
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const estimatedWidth = testLine.length * avgCharWidth;
            if (estimatedWidth <= maxWidth || !currentLine) {
                currentLine = testLine;
            }
            else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines.length > 0 ? lines : [text];
    }
    calculateOptimalFontSize(text, textArea, initialFontSize) {
        let fontSize = Math.min(initialFontSize, textArea.maxFontSize);
        fontSize = Math.max(fontSize, textArea.minFontSize);
        const lineHeight = textArea.lineHeight || 1.2;
        const maxLines = Math.floor(textArea.height / (fontSize * lineHeight));
        let lines = this.wrapText(text, textArea.width, fontSize);
        while (lines.length > maxLines && fontSize > textArea.minFontSize) {
            fontSize = Math.max(fontSize - 2, textArea.minFontSize);
            lines = this.wrapText(text, textArea.width, fontSize);
        }
        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            const lastLine = lines[lines.length - 1];
            const maxChars = Math.floor(textArea.width / (fontSize * 0.6));
            if (lastLine.length > maxChars) {
                lines[lines.length - 1] = lastLine.substring(0, maxChars - 3) + '...';
            }
        }
        return { fontSize, lines };
    }
    async generateGreetingImage(template, csvRow) {
        const backgroundImageBuffer = await this.downloadImage(template.backgroundImage.url);
        let image = (0, sharp_1.default)(backgroundImageBuffer);
        const metadata = await image.metadata();
        const originalWidth = metadata.width || template.canvas.width;
        const originalHeight = metadata.height || template.canvas.height;
        if (originalWidth !== template.canvas.width ||
            originalHeight !== template.canvas.height) {
            image = image.resize(template.canvas.width, template.canvas.height, {
                fit: 'cover',
            });
        }
        const svgOverlays = [];
        for (const textArea of template.textAreas) {
            const typedTextArea = textArea;
            const fieldName = this.mapTextAreaToField(typedTextArea.id);
            if (fieldName) {
                const text = csvRow[fieldName];
                if (text && text.trim() !== '') {
                    const baseWeight = typedTextArea.fontWeight !== undefined
                        ? typedTextArea.fontWeight
                        : 400;
                    const fontWeight = typedTextArea.bold
                        ? Math.max(baseWeight, 700)
                        : baseWeight;
                    const initialFontSize = Math.min(typedTextArea.maxFontSize, typedTextArea.height * 0.8);
                    const { fontSize, lines } = this.calculateOptimalFontSize(text, typedTextArea, initialFontSize);
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
                    const lineHeight = typedTextArea.lineHeight || 1.2;
                    const lineSpacing = fontSize * lineHeight;
                    const totalTextHeight = lines.length * lineSpacing;
                    const startY = typedTextArea.y +
                        (typedTextArea.height - totalTextHeight) / 2 +
                        fontSize;
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
                    let backgroundRect = '';
                    if (typedTextArea.background?.enabled &&
                        typedTextArea.background.color) {
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
                    const textAnchor = typedTextArea.textAlign === 'center'
                        ? 'middle'
                        : typedTextArea.textAlign === 'right'
                            ? 'end'
                            : 'start';
                    let textX;
                    if (typedTextArea.textAlign === 'center') {
                        textX = typedTextArea.x + typedTextArea.width / 2;
                    }
                    else if (typedTextArea.textAlign === 'right') {
                        textX = typedTextArea.x + typedTextArea.width;
                    }
                    else {
                        textX = typedTextArea.x;
                    }
                    const textDecoration = typedTextArea.underline ? 'underline' : 'none';
                    const fontStyle = typedTextArea.italic ? 'italic' : 'normal';
                    const outlineWidth = typedTextArea.outlineWidth || 0;
                    const outlineColor = typedTextArea.outlineColor || '#000000';
                    const strokeAttr = outlineWidth > 0
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
                    const rotation = typedTextArea.rotation || 0;
                    const rotateCx = typedTextArea.x + typedTextArea.width / 2;
                    const rotateCy = typedTextArea.y + typedTextArea.height / 2;
                    const rotatedGroupStart = rotation !== 0
                        ? `<g transform="rotate(${rotation} ${rotateCx} ${rotateCy})">`
                        : '';
                    const rotatedGroupEnd = rotation !== 0 ? `</g>` : '';
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
        if (svgOverlays.length > 0) {
            image = image.composite(svgOverlays);
        }
        const baseImageBuffer = await image.png().toBuffer();
        let targetWidth;
        let targetHeight;
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
                targetWidth = template.canvas.width;
                targetHeight = template.canvas.height;
        }
        const resizedBuffer = await (0, sharp_1.default)(baseImageBuffer)
            .resize(targetWidth, targetHeight, {
            fit: 'cover',
            withoutEnlargement: false,
        })
            .png()
            .toBuffer();
        return {
            width: targetWidth,
            height: targetHeight,
            buffer: resizedBuffer,
        };
    }
    slugify(value) {
        return (value
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60) || 'greeting');
    }
    async uploadGeneratedImage(image, rowNumber, recipientName, occasion) {
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
    async uploadImage(buffer, fileName) {
        return this.r2Service.uploadBuffer(buffer, fileName, 'image/png');
    }
};
exports.ImageGenerationService = ImageGenerationService;
exports.ImageGenerationService = ImageGenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [r2_service_1.R2Service])
], ImageGenerationService);
//# sourceMappingURL=image-generation.service.js.map