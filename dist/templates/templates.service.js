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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const template_schema_1 = require("./schemas/template.schema");
const create_template_dto_1 = require("./dto/create-template.dto");
const r2_service_1 = require("../services/r2.service");
let TemplatesService = class TemplatesService {
    templateModel;
    r2Service;
    constructor(templateModel, r2Service) {
        this.templateModel = templateModel;
        this.r2Service = r2Service;
    }
    async createTemplate(createTemplateDto) {
        const existingTemplate = await this.templateModel.findOne({
            templateId: createTemplateDto.templateId,
        });
        if (existingTemplate) {
            throw new common_1.ConflictException(`Template with templateId "${createTemplateDto.templateId}" already exists`);
        }
        const validOrientations = ['square', 'portrait', 'landscape'];
        if (!validOrientations.includes(createTemplateDto.orientation)) {
            throw new common_1.BadRequestException(`Invalid orientation. Must be one of: ${validOrientations.join(', ')}`);
        }
        const { width, height } = createTemplateDto.canvas;
        const aspectRatio = width / height;
        const tolerance = 0.1;
        switch (createTemplateDto.orientation) {
            case create_template_dto_1.Orientation.SQUARE:
                if (Math.abs(aspectRatio - 1) > tolerance) {
                    throw new common_1.BadRequestException('Canvas dimensions do not match square orientation (width ≈ height)');
                }
                break;
            case create_template_dto_1.Orientation.PORTRAIT:
                if (aspectRatio >= 1 - tolerance) {
                    throw new common_1.BadRequestException('Canvas dimensions do not match portrait orientation (height > width)');
                }
                break;
            case create_template_dto_1.Orientation.LANDSCAPE:
                if (aspectRatio <= 1 + tolerance) {
                    throw new common_1.BadRequestException('Canvas dimensions do not match landscape orientation (width > height)');
                }
                break;
        }
        if (!createTemplateDto.backgroundImage.assetId) {
            throw new common_1.BadRequestException('backgroundImage.assetId is required');
        }
        if (!createTemplateDto.textAreas ||
            createTemplateDto.textAreas.length === 0) {
            throw new common_1.BadRequestException('At least one textArea is required');
        }
        const textAreaIds = createTemplateDto.textAreas.map((ta) => ta.id);
        const uniqueIds = new Set(textAreaIds);
        if (uniqueIds.size !== textAreaIds.length) {
            throw new common_1.BadRequestException('Each textArea.id must be unique');
        }
        for (const textArea of createTemplateDto.textAreas) {
            if (textArea.minFontSize > textArea.maxFontSize) {
                throw new common_1.BadRequestException(`TextArea ${textArea.id}: minFontSize (${textArea.minFontSize}) must be ≤ maxFontSize (${textArea.maxFontSize})`);
            }
        }
        for (const textArea of createTemplateDto.textAreas) {
            if (textArea.x + textArea.width > width) {
                throw new common_1.BadRequestException(`TextArea ${textArea.id}: x + width (${textArea.x + textArea.width}) exceeds canvas width (${width})`);
            }
            if (textArea.y + textArea.height > height) {
                throw new common_1.BadRequestException(`TextArea ${textArea.id}: y + height (${textArea.y + textArea.height}) exceeds canvas height (${height})`);
            }
            if (textArea.x < 0 || textArea.y < 0) {
                throw new common_1.BadRequestException(`TextArea ${textArea.id}: x and y must be non-negative`);
            }
        }
        const normalizedBackgroundImage = {
            ...createTemplateDto.backgroundImage,
            url: this.r2Service.normalizeToPublicUrl(createTemplateDto.backgroundImage.url),
        };
        const template = new this.templateModel({
            ...createTemplateDto,
            backgroundImage: normalizedBackgroundImage,
            status: 'ACTIVE',
        });
        return template.save();
    }
    async findAllTemplates() {
        const templates = await this.templateModel.find().exec();
        return templates.map((template) => ({
            templateId: template.templateId,
            orientation: template.orientation,
            canvas: {
                width: template.canvas.width,
                height: template.canvas.height,
            },
            thumbnailUrl: template.thumbnailUrl ||
                (template.backgroundImage?.url ? template.backgroundImage.url : ''),
            status: template.status,
        }));
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        r2_service_1.R2Service])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map