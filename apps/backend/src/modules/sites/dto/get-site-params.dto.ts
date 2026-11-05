import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength } from 'class-validator';

export class GetSiteParamsDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(253)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/)
  address!: string;
}
