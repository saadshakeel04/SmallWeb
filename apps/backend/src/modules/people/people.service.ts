import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schemas/person.schema';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
  ) {}

  findAll() {
    return this.personModel.find().sort({ name: 1 }).lean().exec();
  }
}
