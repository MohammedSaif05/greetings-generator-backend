"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const r2_config_1 = require("../config/r2.config");
const crypto_1 = require("crypto");
let R2Service = class R2Service {
    s3Client;
    config;
    constructor() {
        this.config = (0, r2_config_1.getR2Config)();
        this.s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
        });
    }
    normalizeToPublicUrl(url) {
        if (!this.config.publicUrl) {
            return url;
        }
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === new URL(this.config.publicUrl).hostname) {
                return url;
            }
            let key;
            if (urlObj.hostname.includes('.r2.cloudflarestorage.com')) {
                let pathname = urlObj.pathname;
                if (pathname.startsWith(`/${this.config.bucketName}/`)) {
                    pathname = pathname.substring(`/${this.config.bucketName}/`.length);
                }
                else if (pathname.startsWith('/')) {
                    pathname = pathname.substring(1);
                }
                key = pathname;
            }
            else {
                let pathname = urlObj.pathname;
                if (pathname.startsWith(`/${this.config.bucketName}/`)) {
                    pathname = pathname.substring(`/${this.config.bucketName}/`.length);
                }
                else if (pathname.startsWith('/')) {
                    pathname = pathname.substring(1);
                }
                key = pathname;
            }
            if (!key) {
                return url;
            }
            return `${this.config.publicUrl}/${key}`;
        }
        catch {
            return url;
        }
    }
    async uploadFile(file, folder = 'templates') {
        if (!file) {
            throw new Error('Invalid file object');
        }
        const validFile = file;
        if (!validFile.buffer || !validFile.originalname || !validFile.mimetype) {
            throw new Error('Invalid file object');
        }
        const assetId = `asset_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
        const fileExtension = validFile.originalname.split('.').pop() || 'png';
        const fileName = `${folder}/${assetId}.${fileExtension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: fileName,
            Body: validFile.buffer,
            ContentType: validFile.mimetype,
        });
        await this.s3Client.send(command);
        let imageUrl;
        if (this.config.publicUrl) {
            imageUrl = `${this.config.publicUrl}/${fileName}`;
        }
        else {
            const signedUrlCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucketName,
                Key: fileName,
            });
            imageUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, signedUrlCommand, {
                expiresIn: 31536000,
            });
        }
        return {
            assetId,
            imageUrl: this.normalizeToPublicUrl(imageUrl),
        };
    }
    async uploadBuffer(buffer, fileName, contentType = 'image/png') {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        });
        await this.s3Client.send(command);
        let imageUrl;
        if (this.config.publicUrl) {
            imageUrl = `${this.config.publicUrl}/${fileName}`;
        }
        else {
            const signedUrlCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucketName,
                Key: fileName,
            });
            imageUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, signedUrlCommand, {
                expiresIn: 31536000,
            });
        }
        return this.normalizeToPublicUrl(imageUrl);
    }
    async getImageBuffer(urlOrKey) {
        let key;
        if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
            try {
                const url = new URL(urlOrKey);
                let pathname = url.pathname;
                if (pathname.startsWith(`/${this.config.bucketName}/`)) {
                    pathname = pathname.substring(`/${this.config.bucketName}/`.length);
                }
                else if (pathname.startsWith('/')) {
                    pathname = pathname.substring(1);
                }
                key = pathname;
            }
            catch {
                throw new Error(`Invalid URL format: ${urlOrKey}. Provide either a valid URL or R2 key directly.`);
            }
        }
        else {
            key = urlOrKey;
        }
        if (!key) {
            throw new Error('Could not extract key from URL or key is empty');
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.config.bucketName,
            Key: key,
        });
        try {
            const response = await this.s3Client.send(command);
            if (!response.Body) {
                throw new Error(`No body returned for key: ${key}`);
            }
            const stream = response.Body;
            const chunks = [];
            for await (const chunk of stream) {
                if (Buffer.isBuffer(chunk)) {
                    chunks.push(chunk);
                }
                else if (chunk instanceof Uint8Array) {
                    chunks.push(Buffer.from(chunk));
                }
                else {
                    chunks.push(Buffer.from(chunk));
                }
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch image from R2 (key: ${key}): ${errorMessage}`);
        }
    }
    async getImageUrl(key, expiresIn = 31536000) {
        let imageUrl;
        if (this.config.publicUrl) {
            imageUrl = `${this.config.publicUrl}/${key}`;
        }
        else {
            const signedUrlCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucketName,
                Key: key,
            });
            imageUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, signedUrlCommand, {
                expiresIn,
            });
        }
        return this.normalizeToPublicUrl(imageUrl);
    }
    async assetExists(_assetId) {
        return Promise.resolve(true);
    }
};
exports.R2Service = R2Service;
exports.R2Service = R2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], R2Service);
//# sourceMappingURL=r2.service.js.map