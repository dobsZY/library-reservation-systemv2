import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { DeskService } from './desk.service';
import { TableSnapshotDto } from './dto/table-snapshot.dto';

@ApiTags('desk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('desk')
export class DeskController {
  constructor(private readonly deskService: DeskService) {}

  @Post('table-snapshot')
  @ApiOperation({
    summary: 'Masa QR ile bugünkü rezervasyon özeti (yönetici / personel)',
    description:
      'QR içeriği ile masayı bulur; bugünün tüm rezervasyonlarını ve şu anki slot için aktif kaydı döner. ' +
      'Kullanıcı görseli sistemde fotoğraf alanı olmadığı için kullanıcı kimliğine bağlı tutarlı bir avatar URL üretir.',
  })
  async tableSnapshot(@Body() dto: TableSnapshotDto) {
    return this.deskService.getTableSnapshotByQr(dto.qrCode);
  }
}
