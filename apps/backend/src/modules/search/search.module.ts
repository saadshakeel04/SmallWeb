import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import { SearchService } from './search.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }])],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
