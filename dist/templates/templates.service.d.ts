import { Model } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplateListDto } from './dto/template-list.dto';
import { R2Service } from '../services/r2.service';
export declare class TemplatesService {
    private templateModel;
    private r2Service;
    constructor(templateModel: Model<TemplateDocument>, r2Service: R2Service);
    createTemplate(createTemplateDto: CreateTemplateDto): Promise<Template>;
    findAllTemplates(): Promise<TemplateListDto[]>;
}
