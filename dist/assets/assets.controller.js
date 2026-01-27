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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const r2_service_1 = require("../services/r2.service");
let AssetsController = class AssetsController {
    r2Service;
    constructor(r2Service) {
        this.r2Service = r2Service;
    }
    async uploadAsset(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const validFile = file;
        if (!validFile.mimetype) {
            throw new common_1.BadRequestException('File mimetype is missing');
        }
        const allowedMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
        ];
        if (!allowedMimeTypes.includes(validFile.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.');
        }
        try {
            const result = await this.r2Service.uploadFile(file);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new common_1.BadRequestException(`Failed to upload file: ${errorMessage}`);
        }
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "uploadAsset", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('templates/assets'),
    __metadata("design:paramtypes", [r2_service_1.R2Service])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map