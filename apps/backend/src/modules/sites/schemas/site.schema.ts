import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/,
  })
  address!: string;

  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ required: true })
  html!: string;

  @Prop({ required: true })
  plainText!: string;

  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  authorId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ address: 1 }, { unique: true });
SiteSchema.index({ title: 'text', plainText: 'text' });
