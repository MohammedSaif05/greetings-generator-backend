import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { TemplatesModule } from './templates/templates.module';
import { GreetingsModule } from './greetings/greetings.module';

@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify the .env file path
    }),
    // Configure MongoDB connection using ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/greetings-generator',
        );

        if (configService.get<string>('MONGODB_URI')) {
          console.log('✅ MongoDB URI loaded from environment variables');
        } else {
          console.warn(
            '⚠️  MONGODB_URI not found in environment variables. Using default: mongodb://localhost:27017/greetings-generator',
          );
        }

        return {
          uri: mongoUri,
        };
      },
      inject: [ConfigService],
    }),
    AssetsModule,
    TemplatesModule,
    GreetingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
