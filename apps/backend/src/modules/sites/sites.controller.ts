import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchQueryDto } from '../search/dto/search-query.dto';
import { SearchService } from '../search/search.service';
import { GetSiteParamsDto } from './dto/get-site-params.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly searchService: SearchService,
  ) {}

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q);
  }

  @Get(':address')
  findByAddress(@Param() params: GetSiteParamsDto) {
    return this.sitesService.findByAddress(params.address);
  }
}
