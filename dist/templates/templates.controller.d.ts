import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    createTemplate(createTemplateDto: CreateTemplateDto): Promise<import("./schemas/template.schema").Template>;
    getAllTemplates(): Promise<import("./dto/template-list.dto").TemplateListDto[]>;
}
