import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  Matches,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ScheduleType } from '../../../database/entities';

export class CreateScheduleDto {
  @ApiProperty({ example: 'Final Haftası 2025' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.EXAM_FINAL })
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @ApiProperty({ example: '2025-01-13', description: 'Başlangıç tarihi' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-26', description: 'Bitiş tarihi' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true, description: '7/24 açık mı?' })
  @IsBoolean()
  @IsOptional()
  is24h?: boolean;

  @ApiPropertyOptional({ example: '08:00', description: 'Açılış saati' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Geçerli saat formatı: HH:MM',
  })
  openingTime?: string;

  @ApiPropertyOptional({ example: '23:00', description: 'Kapanış saati' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Geçerli saat formatı: HH:MM',
  })
  closingTime?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(6)
  maxDurationHours?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(60)
  chainQrTimeoutMinutes?: number;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

