import { TemplateDocument } from '../../templates/schemas/template.schema';
import { CsvRowDto } from '../dto/csv-row.dto';
import { R2Service } from '../../services/r2.service';
export declare class ImageGenerationService {
    private readonly r2Service;
    constructor(r2Service: R2Service);
    downloadImage(url: string): Promise<Buffer>;
    private mapTextAreaToField;
    private escapeXml;
    private getFontFilePath;
    private loadFontAsBase64;
    private wrapText;
    private calculateOptimalFontSize;
    generateGreetingImage(template: TemplateDocument, csvRow: CsvRowDto): Promise<{
        width: number;
        height: number;
        buffer: Buffer;
    }>;
    private slugify;
    uploadGeneratedImage(image: {
        width: number;
        height: number;
        buffer: Buffer;
    }, rowNumber: number, recipientName?: string, occasion?: string): Promise<{
        width: number;
        height: number;
        url: string;
    }>;
    private uploadImage;
}
