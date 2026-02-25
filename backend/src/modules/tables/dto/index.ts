import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsArray,
  IsOptional,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTableDto {
  @ApiProperty({ description: 'Salon ID' })
  @IsUUID()
  hallId: string;

  @ApiProperty({ example: 'A-01', description: 'Masa numarası' })
  @IsString()
  @MaxLength(20)
  tableNumber: string;

  @ApiProperty({ example: 100, description: 'X koordinatı' })
  @IsNumber()
  @Min(0)
  positionX: number;

  @ApiProperty({ example: 150, description: 'Y koordinatı' })
  @IsNumber()
  @Min(0)
  positionY: number;

  @ApiPropertyOptional({ example: 40, description: 'Masa genişliği' })
  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(200)
  width?: number;

  @ApiPropertyOptional({ example: 40, description: 'Masa yüksekliği' })
  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(200)
  height?: number;

  @ApiPropertyOptional({ example: 0, description: 'Döndürme açısı' })
  @IsNumber()
  @IsOptional()
  rotation?: number;

  @ApiPropertyOptional({ description: 'Masa özellikleri ID listesi' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  featureIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export class BulkTableItemDto {
  @ApiProperty({ example: 'A-01' })
  @IsString()
  @MaxLength(20)
  tableNumber: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  positionX: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  positionY: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rotation?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  featureIds?: string[];
}

export class CreateBulkTablesDto {
  @ApiProperty({ description: 'Salon ID' })
  @IsUUID()
  hallId: string;

  @ApiProperty({ type: [BulkTableItemDto], description: 'Masa listesi' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkTableItemDto)
  tables: BulkTableItemDto[];
}

export class TableResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  hallId: string;

  @ApiProperty()
  tableNumber: string;

  @ApiProperty()
  positionX: number;

  @ApiProperty()
  positionY: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  features: object[];

  @ApiProperty()
  createdAt: Date;
}

