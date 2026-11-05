import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { Person } from '../modules/people/schemas/person.schema';
import { Site } from '../modules/sites/schemas/site.schema';
import { Visit } from '../modules/visits/schemas/visit.schema';
import { SEED_PEOPLE, SEED_SITES, SEED_VISITS } from './seed-data';

async function seedDatabase(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const people = app.get<Model<Person>>(getModelToken(Person.name));
    const sites = app.get<Model<Site>>(getModelToken(Site.name));
    const visits = app.get<Model<Visit>>(getModelToken(Visit.name));

    for (const person of SEED_PEOPLE) {
      await people.updateOne(
        { _id: new Types.ObjectId(person.id) },
        {
          $set: {
            name: person.name,
            createdAt: new Date(person.createdAt),
          },
        },
        { upsert: true, timestamps: false },
      );
    }

    for (const site of SEED_SITES) {
      await sites.updateOne(
        { _id: new Types.ObjectId(site.id) },
        {
          $set: {
            address: site.address,
            title: site.title,
            html: site.html,
            plainText: site.plainText,
            authorId: new Types.ObjectId(site.authorId),
            createdAt: new Date(site.createdAt),
            updatedAt: new Date(site.updatedAt),
          },
        },
        { upsert: true, timestamps: false },
      );
    }

    for (const visit of SEED_VISITS) {
      await visits.updateOne(
        { _id: new Types.ObjectId(visit.id) },
        {
          $set: {
            personId: new Types.ObjectId(visit.personId),
            siteId: new Types.ObjectId(visit.siteId),
            address: visit.address,
            source: visit.source,
            visitedAt: new Date(visit.visitedAt),
          },
        },
        { upsert: true, timestamps: false },
      );
    }

    console.info(
      `Seed complete: ${SEED_PEOPLE.length} people, ${SEED_SITES.length} sites, ${SEED_VISITS.length} visits.`,
    );
  } finally {
    await app.close();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
