import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Users ──────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'Tüm kullanıcılar (admin)' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users/:id/force-logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı oturumlarını zorla sonlandır' })
  async forceLogout(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.forceLogout(id);
    return { message: 'Kullanıcı oturumları sonlandırıldı.' };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Kullanıcı rolünü güncelle (admin)' })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.adminService.updateUserRole(id, dto.role, actor.id);
  }

  // ── Reservations ───────────────────────────────────────────

  @Get('reservations')
  @ApiOperation({ summary: 'Tüm rezervasyonlar (admin)' })
  @ApiQuery({ name: 'status', required: false, description: 'active|cancelled|completed|no_show|expired' })
  async getReservations(@Query('status') status?: string) {
    return this.adminService.getReservations(status);
  }

  @Delete('reservations/:id')
  @ApiOperation({ summary: 'Rezervasyonu admin olarak iptal et' })
  async adminCancelReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.adminCancelReservation(id);
  }

  // ── Halls / Tables ─────────────────────────────────────────

  @Get('halls')
  @ApiOperation({ summary: 'Salon listesi (admin)' })
  async getHalls() {
    return this.adminService.getHalls();
  }

  @Get('halls/:id/tables')
  @ApiOperation({ summary: 'Salon masaları (admin)' })
  async getHallTables(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getHallTables(id);
  }

  @Patch('tables/:id')
  @ApiOperation({ summary: 'Masa bilgilerini güncelle (admin)' })
  async updateTable(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { positionX?: number; positionY?: number; width?: number; height?: number; featureIds?: string[] },
  ) {
    return this.adminService.updateTable(id, body);
  }

  // ── Statistics ─────────────────────────────────────────────

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Genel istatistik özeti (admin)' })
  async getOverview() {
    return this.adminService.getOverview();
  }
}
