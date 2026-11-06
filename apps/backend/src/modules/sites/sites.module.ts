import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from '../search/search.module';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site, SiteSchema } from './schemas/site.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
    SearchModule,
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [MongooseModule, SitesService],
})
export class SitesModule {}
