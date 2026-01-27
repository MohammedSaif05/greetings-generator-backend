import { CsvRowDto } from '../dto/csv-row.dto';
export declare class CsvParserService {
    private readonly MAX_FILE_SIZE;
    private readonly REQUIRED_HEADERS;
    private readonly MAX_MESSAGE_LENGTH;
    validateFile(file: Express.Multer.File): void;
    parseCsv(file: Express.Multer.File): CsvRowDto[];
}
