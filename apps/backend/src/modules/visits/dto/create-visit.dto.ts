import { Transform } from 'class-transformer';
import { IsIn, IsMongoId, IsString, Matches, MaxLength } from 'class-validator';
import { VISIT_SOURCES } from '../schemas/visit.schema';
import type { VisitSource } from '../schemas/visit.schema';

export class CreateVisitDto {
  @IsMongoId()
  personId!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(253)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/)
  address!: string;

  @IsIn(VISIT_SOURCES)
  source!: VisitSource;
}
