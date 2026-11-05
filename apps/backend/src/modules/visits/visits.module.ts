import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from '../people/schemas/person.schema';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { Visit, VisitSchema } from './schemas/visit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
