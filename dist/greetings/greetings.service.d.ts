import { Model } from 'mongoose';
import { TemplateDocument } from '../templates/schemas/template.schema';
import { GreetingDocument } from './schemas/greeting.schema';
import { CsvParserService } from './services/csv-parser.service';
import { ImageGenerationService } from './services/image-generation.service';
import { BulkGreetingResponseDto } from './dto/bulk-greeting-response.dto';
import { SingleGreetingRequestDto } from './dto/single-greeting-request.dto';
export declare class GreetingsService {
    private templateModel;
    private greetingModel;
    private csvParserService;
    private imageGenerationService;
    constructor(templateModel: Model<TemplateDocument>, greetingModel: Model<GreetingDocument>, csvParserService: CsvParserService, imageGenerationService: ImageGenerationService);
    processBulkGreetings(file: Express.Multer.File, templateId: string): Promise<BulkGreetingResponseDto>;
    processSingleGreeting(requestDto: SingleGreetingRequestDto): Promise<BulkGreetingResponseDto>;
}
