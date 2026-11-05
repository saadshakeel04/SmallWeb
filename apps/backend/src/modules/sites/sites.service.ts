import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizeAddress } from '../../common/address';
import { Site, SiteDocument } from './schemas/site.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async findByAddress(address: string) {
    const site = await this.siteModel
      .findOne({ address: normalizeAddress(address) })
      .lean()
      .exec();

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    return site;
  }
}
