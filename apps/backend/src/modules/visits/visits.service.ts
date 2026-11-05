import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizeAddress } from '../../common/address';
import { Person, PersonDocument } from '../people/schemas/person.schema';
import { Site, SiteDocument } from '../sites/schemas/site.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ListVisitsQueryDto } from './dto/list-visits-query.dto';
import { Visit, VisitDocument } from './schemas/visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>,
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async create(dto: CreateVisitDto) {
    const personId = new Types.ObjectId(dto.personId);
    const person = await this.personModel.exists({ _id: personId });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const address = normalizeAddress(dto.address);
    const site = await this.siteModel.findOne({ address }).select('_id address').lean().exec();
    if (!site) {
      throw new NotFoundException('Website not found');
    }

    return this.visitModel.create({
      personId,
      siteId: site._id,
      address: site.address,
      source: dto.source,
    });
  }

  async findForPerson(query: ListVisitsQueryDto) {
    const personExists = await this.personModel.exists({ _id: query.personId });
    if (!personExists) {
      throw new NotFoundException('Person not found');
    }

    const filter = { personId: new Types.ObjectId(query.personId) };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.visitModel
        .find(filter)
        .sort({ visitedAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      this.visitModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
