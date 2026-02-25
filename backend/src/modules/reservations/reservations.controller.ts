import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CheckInService } from './check-in.service';
import {
  CreateReservationDto,
  ExtendReservationDto,
  CancelReservationDto,
  CheckInDto,
  ReservationResponseDto,
} from './dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly checkInService: CheckInService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni rezervasyon oluştur' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID (öğrenci no)' })
  @ApiResponse({ status: 201, description: 'Rezervasyon oluşturuldu', type: ReservationResponseDto })
  async create(
    @Headers('x-user-id') userId: string,
    @Body() createDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, createDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Kullanıcının rezervasyonlarını getir' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async findMyReservations(@Headers('x-user-id') userId: string) {
    return this.reservationsService.findByUser(userId);
  }

  @Get('my/active')
  @ApiOperation({ summary: 'Kullanıcının aktif rezervasyonunu getir' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async findMyActiveReservation(@Headers('x-user-id') userId: string) {
    return this.reservationsService.findActiveReservation(userId);
  }

  @Get('my/stats')
  @ApiOperation({ summary: 'Kullanıcının bugünkü istatistiklerini getir' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async getMyStats(@Headers('x-user-id') userId: string) {
    return this.reservationsService.getUserTodayStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Rezervasyon detayını getir' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'QR kod ile check-in yap' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Body() checkInDto: CheckInDto,
  ) {
    return this.checkInService.checkIn(id, userId, checkInDto);
  }

  @Post('validate-qr')
  @ApiOperation({ summary: 'QR kod doğrula' })
  async validateQr(@Body('qrCode') qrCode: string) {
    return this.checkInService.validateQrCode(qrCode);
  }

  @Put(':id/extend')
  @ApiOperation({ summary: 'Rezervasyonu uzat' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async extend(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Body() extendDto: ExtendReservationDto,
  ) {
    return this.reservationsService.extend(id, userId, extendDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Rezervasyonu iptal et' })
  @ApiHeader({ name: 'x-user-id', description: 'Kullanıcı ID' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Body() cancelDto: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(id, userId, cancelDto?.reason);
  }
}

