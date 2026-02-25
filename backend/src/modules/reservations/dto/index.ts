import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Masa ID' })
  @IsUUID()
  tableId: string;

  @ApiProperty({ description: 'Başlangıç zamanı (ISO 8601)', example: '2025-12-28T14:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Süre (saat)', example: 2, minimum: 1, maximum: 3 })
  @IsNumber()
  @Min(1)
  @Max(3)
  durationHours: number;
}

export class ExtendReservationDto {
  @ApiProperty({ description: 'Ek süre (saat)', example: 1, minimum: 1, maximum: 2 })
  @IsNumber()
  @Min(1)
  @Max(2)
  additionalHours: number;
}

export class CancelReservationDto {
  @ApiPropertyOptional({ description: 'İptal nedeni' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CheckInDto {
  @ApiProperty({ description: 'Masa QR kodu' })
  @IsString()
  qrCode: string;

  @ApiPropertyOptional({ description: 'Kullanıcı enlemi' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kullanıcı boylamı' })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class ReservationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  tableId: string;

  @ApiProperty()
  hallId: string;

  @ApiProperty()
  reservationDate: Date;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  lockEndTime: Date;

  @ApiProperty()
  durationHours: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isChain: boolean;

  @ApiProperty()
  checkedInAt: Date;

  @ApiProperty()
  qrDeadline: Date;

  @ApiProperty()
  table: object;

  @ApiProperty()
  hall: object;

  @ApiProperty()
  createdAt: Date;
}

