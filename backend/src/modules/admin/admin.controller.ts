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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Users (yalnızca admin) ───────────────────────────────────

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Tüm kullanıcılar (admin)' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users/:id/force-logout')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı oturumlarını zorla sonlandır' })
  async forceLogout(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.forceLogout(id);
    return { message: 'Kullanıcı oturumları sonlandırıldı.' };
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Tüm rezervasyonlar (yönetici / personel, salt okuma listesi)' })
  @ApiQuery({ name: 'status', required: false, description: 'active|cancelled|completed|no_show|expired' })
  async getReservations(@Query('status') status?: string) {
    return this.adminService.getReservations(status);
  }

  @Delete('reservations/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Rezervasyonu admin olarak iptal et' })
  async adminCancelReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.adminCancelReservation(id);
  }

  // ── Halls / Tables ─────────────────────────────────────────

  @Get('halls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Salon listesi (yönetici / personel)' })
  async getHalls() {
    return this.adminService.getHalls();
  }

  @Get('halls/:id/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Salon masaları (yönetici / personel)' })
  async getHallTables(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getHallTables(id);
  }

  @Patch('tables/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Masa bilgilerini güncelle (admin)' })
  async updateTable(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { positionX?: number; positionY?: number; width?: number; height?: number; featureIds?: string[] },
  ) {
    return this.adminService.updateTable(id, body);
  }

  // ── Statistics ─────────────────────────────────────────────

  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Genel istatistik özeti (yönetici / personel)' })
  async getOverview() {
    return this.adminService.getOverview();
  }
}
