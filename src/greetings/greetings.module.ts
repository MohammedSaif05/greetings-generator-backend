import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GreetingsController } from './greetings.controller';
import { GreetingsService } from './greetings.service';
import { Greeting, GreetingSchema } from './schemas/greeting.schema';
import { Template, TemplateSchema } from '../templates/schemas/template.schema';
import { CsvParserService } from './services/csv-parser.service';
import { ImageGenerationService } from './services/image-generation.service';
import { R2Service } from '../services/r2.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Greeting.name, schema: GreetingSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  controllers: [GreetingsController],
  providers: [
    GreetingsService,
    CsvParserService,
    ImageGenerationService,
    R2Service,
  ],
})
export class GreetingsModule {}
