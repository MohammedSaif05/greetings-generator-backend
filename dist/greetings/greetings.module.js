"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const greetings_controller_1 = require("./greetings.controller");
const greetings_service_1 = require("./greetings.service");
const greeting_schema_1 = require("./schemas/greeting.schema");
const template_schema_1 = require("../templates/schemas/template.schema");
const csv_parser_service_1 = require("./services/csv-parser.service");
const image_generation_service_1 = require("./services/image-generation.service");
const r2_service_1 = require("../services/r2.service");
let GreetingsModule = class GreetingsModule {
};
exports.GreetingsModule = GreetingsModule;
exports.GreetingsModule = GreetingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: greeting_schema_1.Greeting.name, schema: greeting_schema_1.GreetingSchema },
                { name: template_schema_1.Template.name, schema: template_schema_1.TemplateSchema },
            ]),
        ],
        controllers: [greetings_controller_1.GreetingsController],
        providers: [
            greetings_service_1.GreetingsService,
            csv_parser_service_1.CsvParserService,
            image_generation_service_1.ImageGenerationService,
            r2_service_1.R2Service,
        ],
    })
], GreetingsModule);
//# sourceMappingURL=greetings.module.js.map