import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from '../sites/schemas/site.schema';

const MAX_RESULTS = 25;
const EXCERPT_LENGTH = 220;

function getSearchTerms(query: string): string[] {
  return query.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? [];
}

function makeExcerpt(plainText: string, terms: string[]): string {
  if (plainText.length <= EXCERPT_LENGTH) return plainText;

  const lowerText = plainText.toLocaleLowerCase();
  const firstMatch = terms
    .map((term) => lowerText.indexOf(term.toLocaleLowerCase()))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];
  const matchIndex = firstMatch ?? 0;
  let start = Math.max(0, matchIndex - 72);
  if (start > 0) {
    const nextSpace = plainText.indexOf(' ', start);
    if (nextSpace >= 0 && nextSpace < matchIndex) start = nextSpace + 1;
  }

  let end = Math.min(plainText.length, start + EXCERPT_LENGTH);
  if (end < plainText.length) {
    const previousSpace = plainText.lastIndexOf(' ', end);
    if (previousSpace > matchIndex) end = previousSpace;
  }

  return `${start > 0 ? '…' : ''}${plainText.slice(start, end).trim()}${end < plainText.length ? '…' : ''}`;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async search(query: string) {
    const terms = getSearchTerms(query);
    if (terms.length === 0) {
      return { query, total: 0, limit: MAX_RESULTS, results: [] };
    }

    // Mongo text search otherwise matches any word in a multiword query. Treat
    // the user's input as a phrase so generic words don't produce broad hits.
    const searchTerm = `"${terms.join(' ')}"`;
    const filter = { $text: { $search: searchTerm } };
    const [sites, total] = await Promise.all([
      this.siteModel
        .find(filter, {
          address: 1,
          title: 1,
          plainText: 1,
          score: { $meta: 'textScore' },
        })
        .sort({ score: { $meta: 'textScore' }, address: 1 })
        .limit(MAX_RESULTS)
        .lean()
        .exec(),
      this.siteModel.countDocuments(filter).exec(),
    ]);

    return {
      query,
      total,
      limit: MAX_RESULTS,
      results: sites.map((site) => ({
        address: site.address,
        title: site.title,
        excerpt: makeExcerpt(site.plainText, terms),
      })),
    };
  }
}
