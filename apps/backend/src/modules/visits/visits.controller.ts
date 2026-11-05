import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ListVisitsQueryDto } from './dto/list-visits-query.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Get()
  findForPerson(@Query() query: ListVisitsQueryDto) {
    return this.visitsService.findForPerson(query);
  }
}
