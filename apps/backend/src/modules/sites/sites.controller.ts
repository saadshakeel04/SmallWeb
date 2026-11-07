import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SearchQueryDto } from '../search/dto/search-query.dto';
import { SearchService } from '../search/search.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { GetSiteParamsDto } from './dto/get-site-params.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q);
  }

  @Post()
  create(@Body() input: CreateSiteDto) {
    return this.sitesService.create(input);
  }

  @Get(':address')
  findByAddress(@Param() params: GetSiteParamsDto) {
    return this.sitesService.findByAddress(params.address);
  }
}
