import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TableSnapshotDto {
  @ApiProperty({ description: 'Masaya yapıştırılmış QR içeriği' })
  @IsString()
  @IsNotEmpty({ message: 'QR kodu zorunludur.' })
  qrCode: string;
}
