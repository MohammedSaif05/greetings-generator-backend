import { GreetingsService } from './greetings.service';
import { BulkGreetingResponseDto } from './dto/bulk-greeting-response.dto';
import { SingleGreetingRequestDto } from './dto/single-greeting-request.dto';
export declare class GreetingsController {
    private readonly greetingsService;
    constructor(greetingsService: GreetingsService);
    processBulkGreetings(file: Express.Multer.File, templateId: string): Promise<BulkGreetingResponseDto>;
    processSingleGreeting(requestDto: SingleGreetingRequestDto): Promise<BulkGreetingResponseDto>;
}
