import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ReservationStatus } from '../../../database/entities';

// --- Request DTOs ---

export class CreateReservationDto {
  @ApiProperty({ description: 'Masa ID' })
  @IsUUID()
  tableId: string;

  @ApiProperty({
    description: 'Baslangic zamani (ISO 8601) - yalnizca bugun icin',
    example: '2026-03-12T14:00:00.000Z',
  })
  @IsDateString()
  startTime: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional({ description: 'Iptal nedeni' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CheckInDto {
  @ApiProperty({
    description: 'Masa QR kodu (zorunlu). Rezervasyon yapilan masanin QR kodu olmalidir.',
    example: 'SELCUK_LIB_ABC123_TABLE_01_xyz789',
  })
  @IsString()
  @IsNotEmpty({ message: 'QR kodu zorunludur.' })
  qrCode: string;

  @ApiProperty({
    description: 'Kullanici enlemi (zorunlu). Konum dogrulamasi icin gereklidir.',
    example: 37.8716,
  })
  @IsNumber({}, { message: 'Enlem gecerli bir sayi olmalidir.' })
  latitude: number;

  @ApiProperty({
    description: 'Kullanici boylami (zorunlu). Konum dogrulamasi icin gereklidir.',
    example: 32.4938,
  })
  @IsNumber({}, { message: 'Boylam gecerli bir sayi olmalidir.' })
  longitude: number;

  @ApiPropertyOptional({
    description:
      'Konum olcumunun tahmini hata payi (metre). Mobil cihaz GPS dogrulugundan gelir.',
    example: 12.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Konum dogrulugu gecerli bir sayi olmalidir.' })
  @Min(0, { message: 'Konum dogrulugu negatif olamaz.' })
  accuracyMeters?: number;
}

// --- Response DTOs ---

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
  durationHours: number;

  @ApiProperty()
  extensionCount: number;

  @ApiProperty({ enum: ReservationStatus })
  status: ReservationStatus;

  @ApiProperty({ nullable: true })
  checkedInAt: Date;

  @ApiProperty({ nullable: true, description: 'QR okutma son tarihi' })
  qrDeadline: Date;

  @ApiProperty({ description: 'Check-in yapilmis mi' })
  isCheckedIn: boolean;

  @ApiProperty()
  table: object;

  @ApiProperty()
  hall: object;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ nullable: true, description: 'Rezervasyon iptal edilme zamani' })
  cancelledAt?: Date;

  @ApiPropertyOptional({ nullable: true, description: 'Rezervasyon iptal nedeni (örn. admin iptali)' })
  cancelledReason?: string;
}

export class CheckInResponseDto {
  @ApiProperty({ description: 'Basari mesaji', example: 'Check-in basarili.' })
  message: string;

  @ApiProperty({ enum: ReservationStatus, description: 'Guncel rezervasyon durumu' })
  status: ReservationStatus;

  @ApiProperty({ description: 'Check-in zamani' })
  checkedInAt: Date;

  @ApiProperty({ description: 'Masa ID' })
  tableId: string;

  @ApiProperty({ description: 'Salon ID' })
  hallId: string;

  @ApiProperty({ description: 'Rezervasyon ID' })
  reservationId: string;

  @ApiPropertyOptional({ description: 'Hesaplanan mesafe (metre)' })
  distanceMeters?: number;
}

export class UserReservationStatusDto {
  @ApiProperty()
  canReserve: boolean;

  @ApiPropertyOptional()
  reason?: string;

  @ApiProperty()
  hasActiveReservation: boolean;

  @ApiPropertyOptional()
  activeReservation?: ReservationResponseDto;

  @ApiProperty()
  canExtend: boolean;

  @ApiProperty()
  extensionsRemaining: number;

  @ApiProperty()
  todayReservationCount: number;

  @ApiProperty()
  operatingHours: {
    opening: string;
    closing: string;
    is24h: boolean;
  };
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
