import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto, Orientation } from './dto/create-template.dto';
import { TemplateListDto } from './dto/template-list.dto';
import { R2Service } from '../services/r2.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    private r2Service: R2Service,
  ) {}

  async createTemplate(
    createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    // Validate templateId uniqueness
    const existingTemplate = await this.templateModel.findOne({
      templateId: createTemplateDto.templateId,
    });
    if (existingTemplate) {
      throw new ConflictException(
        `Template with templateId "${createTemplateDto.templateId}" already exists`,
      );
    }

    // Validate orientation
    const validOrientations = ['square', 'portrait', 'landscape'];
    if (!validOrientations.includes(createTemplateDto.orientation)) {
      throw new BadRequestException(
        `Invalid orientation. Must be one of: ${validOrientations.join(', ')}`,
      );
    }

    // Validate canvas dimensions match orientation
    const { width, height } = createTemplateDto.canvas;
    const aspectRatio = width / height;
    const tolerance = 0.1;

    switch (createTemplateDto.orientation) {
      case Orientation.SQUARE:
        if (Math.abs(aspectRatio - 1) > tolerance) {
          throw new BadRequestException(
            'Canvas dimensions do not match square orientation (width ≈ height)',
          );
        }
        break;
      case Orientation.PORTRAIT:
        if (aspectRatio >= 1 - tolerance) {
          throw new BadRequestException(
            'Canvas dimensions do not match portrait orientation (height > width)',
          );
        }
        break;
      case Orientation.LANDSCAPE:
        if (aspectRatio <= 1 + tolerance) {
          throw new BadRequestException(
            'Canvas dimensions do not match landscape orientation (width > height)',
          );
        }
        break;
    }

    // Validate backgroundImage.assetId exists
    // Note: In a real scenario, you might want to check R2 or maintain an asset registry
    // For now, we'll assume the assetId is valid if it's provided
    if (!createTemplateDto.backgroundImage.assetId) {
      throw new BadRequestException('backgroundImage.assetId is required');
    }

    // Validate textAreas.length > 0 (already handled by DTO, but double-check)
    if (
      !createTemplateDto.textAreas ||
      createTemplateDto.textAreas.length === 0
    ) {
      throw new BadRequestException('At least one textArea is required');
    }

    // Validate each textArea.id is unique (already handled by DTO, but double-check)
    const textAreaIds = createTemplateDto.textAreas.map((ta) => ta.id);
    const uniqueIds = new Set(textAreaIds);
    if (uniqueIds.size !== textAreaIds.length) {
      throw new BadRequestException('Each textArea.id must be unique');
    }

    // Validate minFontSize ≤ maxFontSize for each textArea
    for (const textArea of createTemplateDto.textAreas) {
      if (textArea.minFontSize > textArea.maxFontSize) {
        throw new BadRequestException(
          `TextArea ${textArea.id}: minFontSize (${textArea.minFontSize}) must be ≤ maxFontSize (${textArea.maxFontSize})`,
        );
      }
    }

    // Validate text areas fit inside canvas
    for (const textArea of createTemplateDto.textAreas) {
      if (textArea.x + textArea.width > width) {
        throw new BadRequestException(
          `TextArea ${textArea.id}: x + width (${textArea.x + textArea.width}) exceeds canvas width (${width})`,
        );
      }
      if (textArea.y + textArea.height > height) {
        throw new BadRequestException(
          `TextArea ${textArea.id}: y + height (${textArea.y + textArea.height}) exceeds canvas height (${height})`,
        );
      }
      if (textArea.x < 0 || textArea.y < 0) {
        throw new BadRequestException(
          `TextArea ${textArea.id}: x and y must be non-negative`,
        );
      }
    }

    // Normalize background image URL to public URL format
    const normalizedBackgroundImage = {
      ...createTemplateDto.backgroundImage,
      url: this.r2Service.normalizeToPublicUrl(
        createTemplateDto.backgroundImage.url,
      ),
    };

    // Create and save template
    const template = new this.templateModel({
      ...createTemplateDto,
      backgroundImage: normalizedBackgroundImage,
      status: 'ACTIVE',
    });

    return template.save();
  }

  async findAllTemplates(): Promise<TemplateListDto[]> {
    const templates = await this.templateModel.find().exec();

    return templates.map((template) => ({
      templateId: template.templateId,
      orientation: template.orientation,
      canvas: {
        width: template.canvas.width,
        height: template.canvas.height,
      },
      thumbnailUrl:
        template.thumbnailUrl ||
        (template.backgroundImage?.url ? template.backgroundImage.url : ''),
      status: template.status,
    }));
  }
}
