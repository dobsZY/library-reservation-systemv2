import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSpecialPeriodDto {
  @ApiProperty({ example: 'Final Haftasi 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true, description: 'Varsayilan: true (7/24)' })
  @IsOptional()
  @IsBoolean()
  is24h?: boolean;

  @ApiPropertyOptional({ example: '00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Gecerli saat formati: HH:MM',
  })
  openingTime?: string;

  @ApiPropertyOptional({ example: '23:59' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Gecerli saat formati: HH:MM',
  })
  closingTime?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    example: { allowAdvanceBooking: true, maxAdvanceDays: 1 },
  })
  @IsOptional()
  @IsObject()
  rules?: {
    allowAdvanceBooking?: boolean;
    maxAdvanceDays?: number;
  };
}

export class UpdateSpecialPeriodDto extends PartialType(CreateSpecialPeriodDto) {}

export class ToggleSpecialPeriodDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}

