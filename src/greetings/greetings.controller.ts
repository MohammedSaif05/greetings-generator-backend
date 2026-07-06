import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GreetingsService } from './greetings.service';
import { BulkGreetingResponseDto } from './dto/bulk-greeting-response.dto';
import { SingleGreetingRequestDto } from './dto/single-greeting-request.dto';

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

  @Post('single')
  async processSingleGreeting(
    @Body() requestDto: SingleGreetingRequestDto,
  ): Promise<BulkGreetingResponseDto> {
    // Validate required fields
    if (!requestDto.templateId || requestDto.templateId.trim() === '') {
      throw new BadRequestException('templateId is required');
    }
    if (!requestDto.recipientName || requestDto.recipientName.trim() === '') {
      throw new BadRequestException('recipientName is required');
    }
    if (!requestDto.occasion || requestDto.occasion.trim() === '') {
      throw new BadRequestException('occasion is required');
    }
    if (!requestDto.message || requestDto.message.trim() === '') {
      throw new BadRequestException('message is required');
    }
    if (!requestDto.senderName || requestDto.senderName.trim() === '') {
      throw new BadRequestException('senderName is required');
    }

    // Validate message length
    const MAX_MESSAGE_LENGTH = 300;
    if (requestDto.message.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

    try {
      return await this.greetingsService.processSingleGreeting({
        templateId: requestDto.templateId.trim(),
        recipientName: requestDto.recipientName.trim(),
        occasion: requestDto.occasion.trim(),
        message: requestDto.message.trim(),
        senderName: requestDto.senderName.trim(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to process single greeting: ${errorMessage}`,
      );
    }
  }
}
