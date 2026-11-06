import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizeAddress } from '../../common/address';
import { htmlToPlainText, sanitizeHtmlContent } from '../../common/html-sanitizer';
import { Person, PersonDocument } from '../people/schemas/person.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { Site, SiteDocument } from './schemas/site.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
  ) {}

  async create(input: CreateSiteDto) {
    const address = normalizeAddress(input.address);
    const publisher = await this.personModel.findById(input.publisherId).select('_id').lean().exec();
    if (!publisher) {
      throw new NotFoundException('Publisher not found');
    }

    const html = sanitizeHtmlContent(input.html);
    const plainText = htmlToPlainText(html);
    if (!plainText) {
      throw new BadRequestException('HTML must contain safe, visible text content');
    }

    try {
      return await this.siteModel.create({
        address,
        title: input.title,
        html,
        plainText,
        authorId: publisher._id,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(`A website already exists at ${address}. Choose another address.`);
      }
      throw error;
    }
  }

  async findByAddress(address: string) {
    const site = await this.siteModel
      .findOne({ address: normalizeAddress(address) })
      .lean()
      .exec();

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    const html = sanitizeHtmlContent(site.html);

    return {
      ...site,
      html,
      plainText: htmlToPlainText(html),
    };
  }
}
