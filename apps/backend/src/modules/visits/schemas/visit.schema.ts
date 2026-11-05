import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema';
import { Site } from '../../sites/schemas/site.schema';

export const VISIT_SOURCES = ['typed', 'link', 'history', 'search', 'publish'] as const;
export type VisitSource = (typeof VISIT_SOURCES)[number];
export type VisitDocument = HydratedDocument<Visit>;

@Schema({ collection: 'visits', timestamps: { createdAt: 'visitedAt', updatedAt: false } })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  personId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Site.name, required: true })
  siteId!: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true })
  address!: string;

  @Prop({ required: true, enum: VISIT_SOURCES })
  source!: VisitSource;

  visitedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ personId: 1, visitedAt: -1 });
