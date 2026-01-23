export class GeneratedImage {
  width: number;
  height: number;
  url: string;
}

export class GreetingResult {
  row: number;
  templateId: string;
  images: GeneratedImage[];
}

export class BulkGreetingResponseDto {
  status: 'SUCCESS' | 'FAILED';
  total: number;
  generated: number;
  results: GreetingResult[];
}
