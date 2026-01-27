export declare class R2Service {
    private s3Client;
    private config;
    constructor();
    normalizeToPublicUrl(url: string): string;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        assetId: string;
        imageUrl: string;
    }>;
    uploadBuffer(buffer: Buffer, fileName: string, contentType?: string): Promise<string>;
    getImageBuffer(urlOrKey: string): Promise<Buffer>;
    getImageUrl(key: string, expiresIn?: number): Promise<string>;
    assetExists(_assetId: string): Promise<boolean>;
}
