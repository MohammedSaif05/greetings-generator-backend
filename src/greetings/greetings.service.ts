import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Template,
  TemplateDocument,
} from '../templates/schemas/template.schema';
import { Greeting, GreetingDocument } from './schemas/greeting.schema';
import { CsvParserService } from './services/csv-parser.service';
import { ImageGenerationService } from './services/image-generation.service';
import { CsvRowDto } from './dto/csv-row.dto';
import {
  BulkGreetingResponseDto,
  GreetingResult,
} from './dto/bulk-greeting-response.dto';

@Injectable()
export class GreetingsService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    @InjectModel(Greeting.name) private greetingModel: Model<GreetingDocument>,
    private csvParserService: CsvParserService,
    private imageGenerationService: ImageGenerationService,
  ) {}

  async processBulkGreetings(
    file: Express.Multer.File,
  ): Promise<BulkGreetingResponseDto> {
    // Step 1: Parse CSV
    const csvRows = this.csvParserService.parseCsv(file);

    // Step 2: Group by templateId for optimization
    const templateGroups = new Map<string, CsvRowDto[]>();
    for (const row of csvRows) {
      if (!templateGroups.has(row.templateId)) {
        templateGroups.set(row.templateId, []);
      }
      templateGroups.get(row.templateId).push(row);
    }

    // Step 3: Load all unique templates
    const templateIds = Array.from(templateGroups.keys());
    const templates = await this.templateModel.find({
      templateId: { $in: templateIds },
    });

    const templateMap = new Map<string, TemplateDocument>();
    for (const template of templates) {
      templateMap.set(template.templateId, template);
    }

    // Validate all templates exist and are ACTIVE
    for (const templateId of templateIds) {
      const template = templateMap.get(templateId);
      if (!template) {
        throw new NotFoundException(
          `Template with templateId "${templateId}" not found`,
        );
      }
      if (template.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Template "${templateId}" is not ACTIVE (status: ${template.status})`,
        );
      }
    }

    // Step 4: Process each row
    const results: GreetingResult[] = [];
    let generatedCount = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = csvRows[i];
      const rowNumber = i + 1;

      try {
        const template = templateMap.get(csvRow.templateId);
        if (!template) {
          throw new Error(`Template "${csvRow.templateId}" not found`);
        }

        // Generate images
        const images = await this.imageGenerationService.generateGreetingImage(
          template,
          csvRow,
        );

        // Upload images
        const imageUrls =
          await this.imageGenerationService.uploadGeneratedImages(
            images,
            rowNumber,
            csvRow.templateId,
          );

        // Store greeting record
        const greetingData = {
          templateId: csvRow.templateId,
          recipientName: csvRow.recipientName,
          occasion: csvRow.occasion,
          message: csvRow.message,
          senderName: csvRow.senderName,
          imageUrls: imageUrls.map(
            (img: { width: number; height: number; url: string }) => ({
              width: img.width,
              height: img.height,
              url: img.url,
            }),
          ),
          rowNumber,
        };
        const greeting = new this.greetingModel(greetingData);
        await greeting.save();

        results.push({
          row: rowNumber,
          templateId: csvRow.templateId,
          images: imageUrls,
        });

        generatedCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        // Fail fast - stop processing on first error
        throw new BadRequestException(
          `Failed to process row ${rowNumber}: ${errorMessage}`,
        );
      }
    }

    // Step 5: Build response
    // With fail-fast strategy, if we reach here, all rows succeeded
    return {
      status: 'SUCCESS',
      total: csvRows.length,
      generated: generatedCount,
      results,
    };
  }
}
