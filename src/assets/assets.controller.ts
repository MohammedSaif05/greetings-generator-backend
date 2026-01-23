import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from '../services/r2.service';

@Controller('templates/assets')
export class AssetsController {
  constructor(private readonly r2Service: R2Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validFile = file as { mimetype: string };
    if (!validFile.mimetype) {
      throw new BadRequestException('File mimetype is missing');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(validFile.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.',
      );
    }

    try {
      const result = await this.r2Service.uploadFile(file);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Failed to upload file: ${errorMessage}`);
    }
  }
}
