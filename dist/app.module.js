"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const assets_module_1 = require("./assets/assets.module");
const templates_module_1 = require("./templates/templates.module");
const greetings_module_1 = require("./greetings/greetings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                ignoreEnvFile: false,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const mongoUri = configService.get('MONGODB_URI', 'mongodb://localhost:27017/greetings-generator');
                    if (configService.get('MONGODB_URI')) {
                        console.log('✅ MongoDB URI loaded from environment variables');
                    }
                    else {
                        console.warn('⚠️  MONGODB_URI not found in environment variables. Using default: mongodb://localhost:27017/greetings-generator');
                    }
                    return {
                        uri: mongoUri,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            assets_module_1.AssetsModule,
            templates_module_1.TemplatesModule,
            greetings_module_1.GreetingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map