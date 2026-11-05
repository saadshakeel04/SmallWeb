import { Type } from 'class-transformer';
import { IsInt, IsMongoId, Max, Min } from 'class-validator';

export class ListVisitsQueryDto {
  @IsMongoId()
  personId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
