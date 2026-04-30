import { Module } from '@nestjs/common';
import { ScreenCatalogController } from './screen-catalog.controller';
@Module({ controllers: [ScreenCatalogController] })
export class ScreenCatalogModule {}
