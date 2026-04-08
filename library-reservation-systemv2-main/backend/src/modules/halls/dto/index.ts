import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateHallDto {
  @ApiProperty({ example: 'Ana Okuma Salonu' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 1, description: 'Kat numarası' })
  @IsNumber()
  floor: number;

  @ApiPropertyOptional({ example: 'Merkez kütüphane ana okuma salonu' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 800, description: 'Kroki genişliği (piksel)' })
  @IsNumber()
  @Min(100)
  @Max(2000)
  layoutWidth: number;

  @ApiProperty({ example: 600, description: 'Kroki yüksekliği (piksel)' })
  @IsNumber()
  @Min(100)
  @Max(2000)
  layoutHeight: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  layoutBackgroundUrl?: string;

  @ApiPropertyOptional({
    description: 'Kroki konfigürasyonu (duvarlar, kapılar, pencereler)',
  })
  @IsObject()
  @IsOptional()
  layoutConfig?: object;

  @ApiPropertyOptional({ example: 38.0225, description: 'Enlem' })
  @IsNumber()
  @IsOptional()
  centerLatitude?: number;

  @ApiPropertyOptional({ example: 32.5105, description: 'Boylam' })
  @IsNumber()
  @IsOptional()
  centerLongitude?: number;

  @ApiPropertyOptional({ example: 50, description: 'İzin verilen yarıçap (metre)' })
  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(500)
  allowedRadiusMeters?: number;

  @ApiProperty({ example: 50, description: 'Toplam masa kapasitesi' })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateHallDto extends PartialType(CreateHallDto) {}

export class HallResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  floor: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  layoutWidth: number;

  @ApiProperty()
  layoutHeight: number;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class HallAvailabilityDto {
  @ApiProperty()
  hall: HallResponseDto;

  @ApiProperty()
  tables: Array<{
    table: object;
    isAvailable: boolean;
    currentLock?: object;
    availableFrom?: Date;
  }>;

  @ApiProperty()
  statistics: {
    total: number;
    available: number;
    occupied: number;
    occupancyRate: number;
  };
}

