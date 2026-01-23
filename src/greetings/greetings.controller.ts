import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GreetingsService } from './greetings.service';
import { BulkGreetingResponseDto } from './dto/bulk-greeting-response.dto';

@Controller('greetings')
export class GreetingsController {
  constructor(private readonly greetingsService: GreetingsService) {}

  @Post('bulk')
  @UseInterceptors(FileInterceptor('file'))
  async processBulkGreetings(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BulkGreetingResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.greetingsService.processBulkGreetings(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to process bulk greetings: ${errorMessage}`,
      );
    }
  }
}
