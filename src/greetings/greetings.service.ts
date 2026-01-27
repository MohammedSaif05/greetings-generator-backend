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
import { SingleGreetingRequestDto } from './dto/single-greeting-request.dto';

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
    templateId: string,
  ): Promise<BulkGreetingResponseDto> {
    // Step 1: Parse CSV
    const csvRows = this.csvParserService.parseCsv(file);

    // Step 2: Load and validate template
    const template = await this.templateModel.findOne({
      templateId: templateId,
    });

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

    // Step 4: Process each row
    const results: GreetingResult[] = [];
    let generatedCount = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = csvRows[i];
      const rowNumber = i + 1;

      try {
        // Generate image
        const image = await this.imageGenerationService.generateGreetingImage(
          template,
          csvRow,
        );

        // Upload image with meaningful file name including recipient and occasion
        const imageUrl = await this.imageGenerationService.uploadGeneratedImage(
          image,
          rowNumber,
          csvRow.recipientName,
          csvRow.occasion,
        );

        // Store greeting record
        const greetingData = {
          templateId: templateId,
          recipientName: csvRow.recipientName,
          occasion: csvRow.occasion,
          message: csvRow.message,
          senderName: csvRow.senderName,
          imageUrls: [
            {
              width: imageUrl.width,
              height: imageUrl.height,
              url: imageUrl.url,
            },
          ],
          rowNumber,
        };
        const greeting = new this.greetingModel(greetingData);
        await greeting.save();

        results.push({
          row: rowNumber,
          templateId: templateId,
          image: imageUrl,
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

  async processSingleGreeting(
    requestDto: SingleGreetingRequestDto,
  ): Promise<BulkGreetingResponseDto> {
    // Step 1: Load and validate template
    const template = await this.templateModel.findOne({
      templateId: requestDto.templateId,
    });

    if (!template) {
      throw new NotFoundException(
        `Template with templateId "${requestDto.templateId}" not found`,
      );
    }

    if (template.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Template "${requestDto.templateId}" is not ACTIVE (status: ${template.status})`,
      );
    }

    // Step 2: Convert request to CsvRowDto format for image generation
    const csvRow: CsvRowDto = {
      recipientName: requestDto.recipientName,
      occasion: requestDto.occasion,
      message: requestDto.message,
      senderName: requestDto.senderName,
    };

    // Step 3: Generate image
    const image = await this.imageGenerationService.generateGreetingImage(
      template,
      csvRow,
    );

    // Step 4: Upload image with meaningful file name including recipient and occasion
    const imageUrl = await this.imageGenerationService.uploadGeneratedImage(
      image,
      1, // rowNumber is 1 for single greeting
      requestDto.recipientName,
      requestDto.occasion,
    );

    // Step 5: Store greeting record
    const greetingData = {
      templateId: requestDto.templateId,
      recipientName: requestDto.recipientName,
      occasion: requestDto.occasion,
      message: requestDto.message,
      senderName: requestDto.senderName,
      imageUrls: [
        {
          width: imageUrl.width,
          height: imageUrl.height,
          url: imageUrl.url,
        },
      ],
      rowNumber: 1,
    };
    const greeting = new this.greetingModel(greetingData);
    await greeting.save();

    // Step 6: Build response
    const result: GreetingResult = {
      row: 1,
      templateId: requestDto.templateId,
      image: imageUrl,
    };

    return {
      status: 'SUCCESS',
      total: 1,
      generated: 1,
      results: [result],
    };
  }
}
