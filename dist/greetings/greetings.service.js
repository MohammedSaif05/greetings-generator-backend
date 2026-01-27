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
exports.GreetingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const template_schema_1 = require("../templates/schemas/template.schema");
const greeting_schema_1 = require("./schemas/greeting.schema");
const csv_parser_service_1 = require("./services/csv-parser.service");
const image_generation_service_1 = require("./services/image-generation.service");
let GreetingsService = class GreetingsService {
    templateModel;
    greetingModel;
    csvParserService;
    imageGenerationService;
    constructor(templateModel, greetingModel, csvParserService, imageGenerationService) {
        this.templateModel = templateModel;
        this.greetingModel = greetingModel;
        this.csvParserService = csvParserService;
        this.imageGenerationService = imageGenerationService;
    }
    async processBulkGreetings(file, templateId) {
        const csvRows = this.csvParserService.parseCsv(file);
        const template = await this.templateModel.findOne({
            templateId: templateId,
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with templateId "${templateId}" not found`);
        }
        if (template.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`Template "${templateId}" is not ACTIVE (status: ${template.status})`);
        }
        const results = [];
        let generatedCount = 0;
        for (let i = 0; i < csvRows.length; i++) {
            const csvRow = csvRows[i];
            const rowNumber = i + 1;
            try {
                const image = await this.imageGenerationService.generateGreetingImage(template, csvRow);
                const imageUrl = await this.imageGenerationService.uploadGeneratedImage(image, rowNumber, csvRow.recipientName, csvRow.occasion);
                const greetingData = {
                    templateId: templateId,
                    recipientName: csvRow.recipientName,
                    occasion: csvRow.occasion,
                    message: csvRow.message,
                    senderName: csvRow.senderName,
                    imageUrls: [
                        {
                            width: imageUrl.width,
                            height: imageUrl.height,
                            url: imageUrl.url,
                        },
                    ],
                    rowNumber,
                };
                const greeting = new this.greetingModel(greetingData);
                await greeting.save();
                results.push({
                    row: rowNumber,
                    templateId: templateId,
                    image: imageUrl,
                });
                generatedCount++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new common_1.BadRequestException(`Failed to process row ${rowNumber}: ${errorMessage}`);
            }
        }
        return {
            status: 'SUCCESS',
            total: csvRows.length,
            generated: generatedCount,
            results,
        };
    }
    async processSingleGreeting(requestDto) {
        const template = await this.templateModel.findOne({
            templateId: requestDto.templateId,
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with templateId "${requestDto.templateId}" not found`);
        }
        if (template.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`Template "${requestDto.templateId}" is not ACTIVE (status: ${template.status})`);
        }
        const csvRow = {
            recipientName: requestDto.recipientName,
            occasion: requestDto.occasion,
            message: requestDto.message,
            senderName: requestDto.senderName,
        };
        const image = await this.imageGenerationService.generateGreetingImage(template, csvRow);
        const imageUrl = await this.imageGenerationService.uploadGeneratedImage(image, 1, requestDto.recipientName, requestDto.occasion);
        const greetingData = {
            templateId: requestDto.templateId,
            recipientName: requestDto.recipientName,
            occasion: requestDto.occasion,
            message: requestDto.message,
            senderName: requestDto.senderName,
            imageUrls: [
                {
                    width: imageUrl.width,
                    height: imageUrl.height,
                    url: imageUrl.url,
                },
            ],
            rowNumber: 1,
        };
        const greeting = new this.greetingModel(greetingData);
        await greeting.save();
        const result = {
            row: 1,
            templateId: requestDto.templateId,
            image: imageUrl,
        };
        return {
            status: 'SUCCESS',
            total: 1,
            generated: 1,
            results: [result],
        };
    }
};
exports.GreetingsService = GreetingsService;
exports.GreetingsService = GreetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __param(1, (0, mongoose_1.InjectModel)(greeting_schema_1.Greeting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        csv_parser_service_1.CsvParserService,
        image_generation_service_1.ImageGenerationService])
], GreetingsService);
//# sourceMappingURL=greetings.service.js.map