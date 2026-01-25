import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowDto } from '../dto/csv-row.dto';

@Injectable()
export class CsvParserService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly REQUIRED_HEADERS = [
    'recipientName',
    'occasion',
    'message',
    'senderName',
  ];
  private readonly MAX_MESSAGE_LENGTH = 300;

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validFile = file as {
      originalname: string;
      size: number;
      buffer: Buffer;
    };

    // Validate file type
    if (!validFile.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV file');
    }

    // Validate file size
    if (validFile.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!validFile.buffer || validFile.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  parseCsv(file: Express.Multer.File): CsvRowDto[] {
    this.validateFile(file);

    const validFile = file as { buffer: Buffer };
    const fileBuffer = validFile.buffer;
    const fileContent = fileBuffer.toString('utf-8');

    let records: Record<string, string>[];
    try {
      const parsed = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
      records = parsed as Record<string, string>[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to parse CSV: ${errorMessage}`);
    }

    // Validate headers
    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty or has no data rows');
    }

    const firstRecord = records[0];
    const headers = Object.keys(firstRecord);
    const missingHeaders = this.REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Missing required headers: ${missingHeaders.join(', ')}`,
      );
    }

    // Validate and parse rows
    const parsedRows: CsvRowDto[] = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because: 1 for header row, 1 for 0-index

      // Validate required fields
      const missingFields: string[] = [];
      this.REQUIRED_HEADERS.forEach((header) => {
        const value = row[header];
        if (!value || typeof value !== 'string' || value.trim() === '') {
          missingFields.push(header);
        }
      });

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`,
        );
      }

      // Validate message length
      const message = row.message || '';
      if (message.length > this.MAX_MESSAGE_LENGTH) {
        throw new BadRequestException(
          `Row ${rowNumber}: Message exceeds maximum length of ${this.MAX_MESSAGE_LENGTH} characters`,
        );
      }

      parsedRows.push({
        recipientName: (row.recipientName || '').trim(),
        occasion: (row.occasion || '').trim(),
        message: message.trim(),
        senderName: (row.senderName || '').trim(),
      });
    }

    if (parsedRows.length === 0) {
      throw new BadRequestException('No valid rows found in CSV');
    }

    return parsedRows;
  }
}
