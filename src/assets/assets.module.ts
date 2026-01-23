import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { R2Service } from '../services/r2.service';

@Module({
  controllers: [AssetsController],
  providers: [R2Service],
  exports: [R2Service],
})
export class AssetsModule {}
