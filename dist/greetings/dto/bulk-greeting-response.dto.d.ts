export declare class GeneratedImage {
    width: number;
    height: number;
    url: string;
}
export declare class GreetingResult {
    row: number;
    templateId: string;
    image: GeneratedImage;
}
export declare class BulkGreetingResponseDto {
    status: 'SUCCESS' | 'FAILED';
    total: number;
    generated: number;
    results: GreetingResult[];
}
