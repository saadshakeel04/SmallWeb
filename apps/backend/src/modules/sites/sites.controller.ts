import { Controller, Get, Param } from '@nestjs/common';
import { GetSiteParamsDto } from './dto/get-site-params.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get(':address')
  findByAddress(@Param() params: GetSiteParamsDto) {
    return this.sitesService.findByAddress(params.address);
  }
}
