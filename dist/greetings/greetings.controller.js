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
exports.GreetingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const greetings_service_1 = require("./greetings.service");
const single_greeting_request_dto_1 = require("./dto/single-greeting-request.dto");
let GreetingsController = class GreetingsController {
    greetingsService;
    constructor(greetingsService) {
        this.greetingsService = greetingsService;
    }
    async processBulkGreetings(file, templateId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!templateId || templateId.trim() === '') {
            throw new common_1.BadRequestException('templateId is required');
        }
        try {
            return await this.greetingsService.processBulkGreetings(file, templateId.trim());
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new common_1.BadRequestException(`Failed to process bulk greetings: ${errorMessage}`);
        }
    }
    async processSingleGreeting(requestDto) {
        if (!requestDto.templateId || requestDto.templateId.trim() === '') {
            throw new common_1.BadRequestException('templateId is required');
        }
        if (!requestDto.recipientName || requestDto.recipientName.trim() === '') {
            throw new common_1.BadRequestException('recipientName is required');
        }
        if (!requestDto.occasion || requestDto.occasion.trim() === '') {
            throw new common_1.BadRequestException('occasion is required');
        }
        if (!requestDto.message || requestDto.message.trim() === '') {
            throw new common_1.BadRequestException('message is required');
        }
        if (!requestDto.senderName || requestDto.senderName.trim() === '') {
            throw new common_1.BadRequestException('senderName is required');
        }
        const MAX_MESSAGE_LENGTH = 300;
        if (requestDto.message.length > MAX_MESSAGE_LENGTH) {
            throw new common_1.BadRequestException(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
        }
        try {
            return await this.greetingsService.processSingleGreeting({
                templateId: requestDto.templateId.trim(),
                recipientName: requestDto.recipientName.trim(),
                occasion: requestDto.occasion.trim(),
                message: requestDto.message.trim(),
                senderName: requestDto.senderName.trim(),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new common_1.BadRequestException(`Failed to process single greeting: ${errorMessage}`);
        }
    }
};
exports.GreetingsController = GreetingsController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GreetingsController.prototype, "processBulkGreetings", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [single_greeting_request_dto_1.SingleGreetingRequestDto]),
    __metadata("design:returntype", Promise)
], GreetingsController.prototype, "processSingleGreeting", null);
exports.GreetingsController = GreetingsController = __decorate([
    (0, common_1.Controller)('greetings'),
    __metadata("design:paramtypes", [greetings_service_1.GreetingsService])
], GreetingsController);
//# sourceMappingURL=greetings.controller.js.map