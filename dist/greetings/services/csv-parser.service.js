"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvParserService = void 0;
const common_1 = require("@nestjs/common");
const sync_1 = require("csv-parse/sync");
let CsvParserService = class CsvParserService {
    MAX_FILE_SIZE = 50 * 1024 * 1024;
    REQUIRED_HEADERS = [
        'recipientName',
        'occasion',
        'message',
        'senderName',
    ];
    MAX_MESSAGE_LENGTH = 300;
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const validFile = file;
        if (!validFile.originalname.endsWith('.csv')) {
            throw new common_1.BadRequestException('File must be a CSV file');
        }
        if (validFile.size > this.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        if (!validFile.buffer || validFile.buffer.length === 0) {
            throw new common_1.BadRequestException('File is empty');
        }
    }
    parseCsv(file) {
        this.validateFile(file);
        const validFile = file;
        const fileBuffer = validFile.buffer;
        const fileContent = fileBuffer.toString('utf-8');
        let records;
        try {
            const parsed = (0, sync_1.parse)(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true,
            });
            records = parsed;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to parse CSV: ${errorMessage}`);
        }
        if (records.length === 0) {
            throw new common_1.BadRequestException('CSV file is empty or has no data rows');
        }
        const firstRecord = records[0];
        const headers = Object.keys(firstRecord);
        const missingHeaders = this.REQUIRED_HEADERS.filter((header) => !headers.includes(header));
        if (missingHeaders.length > 0) {
            throw new common_1.BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
        const parsedRows = [];
        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNumber = i + 2;
            const missingFields = [];
            this.REQUIRED_HEADERS.forEach((header) => {
                const value = row[header];
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    missingFields.push(header);
                }
            });
            if (missingFields.length > 0) {
                throw new common_1.BadRequestException(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
            }
            const message = row.message || '';
            if (message.length > this.MAX_MESSAGE_LENGTH) {
                throw new common_1.BadRequestException(`Row ${rowNumber}: Message exceeds maximum length of ${this.MAX_MESSAGE_LENGTH} characters`);
            }
            parsedRows.push({
                recipientName: (row.recipientName || '').trim(),
                occasion: (row.occasion || '').trim(),
                message: message.trim(),
                senderName: (row.senderName || '').trim(),
            });
        }
        if (parsedRows.length === 0) {
            throw new common_1.BadRequestException('No valid rows found in CSV');
        }
        return parsedRows;
    }
};
exports.CsvParserService = CsvParserService;
exports.CsvParserService = CsvParserService = __decorate([
    (0, common_1.Injectable)()
], CsvParserService);
//# sourceMappingURL=csv-parser.service.js.map