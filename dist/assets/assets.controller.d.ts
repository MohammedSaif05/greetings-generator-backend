import { R2Service } from '../services/r2.service';
export declare class AssetsController {
    private readonly r2Service;
    constructor(r2Service: R2Service);
    uploadAsset(file: Express.Multer.File): Promise<{
        assetId: string;
        imageUrl: string;
    }>;
}
