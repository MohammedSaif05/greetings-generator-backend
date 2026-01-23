import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.createTemplate(createTemplateDto);
  }

  @Get()
  async getAllTemplates() {
    return this.templatesService.findAllTemplates();
  }
}
