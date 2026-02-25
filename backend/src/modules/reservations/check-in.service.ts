import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as geolib from 'geolib';
import {
  Reservation,
  ReservationStatus,
  Table,
  Hall,
} from '../../database/entities';
import { CheckInDto } from './dto';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
    private readonly configService: ConfigService,
  ) {}

  async checkIn(
    reservationId: string,
    userId: string,
    checkInDto: CheckInDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['table', 'table.hall'],
    });

    if (!reservation) {
      throw new NotFoundException('Rezervasyon bulunamadı');
    }

    if (reservation.userId !== userId) {
      throw new BadRequestException('Bu rezervasyon size ait değil');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Bu rezervasyon için check-in yapılamaz');
    }

    // QR kod kontrolü
    const table = await this.tableRepository.findOne({
      where: { id: reservation.tableId },
      relations: ['hall'],
    });

    if (!table) {
      throw new NotFoundException('Masa bulunamadı');
    }

    if (table.qrCode !== checkInDto.qrCode) {
      throw new BadRequestException('Geçersiz QR kod. Lütfen doğru masanın QR kodunu okutun.');
    }

    // QR deadline kontrolü
    const now = new Date();
    if (now > reservation.qrDeadline) {
      throw new BadRequestException('QR okutma süresi doldu. Rezervasyonunuz iptal edilmiştir.');
    }

    // Konum kontrolü
    if (checkInDto.latitude && checkInDto.longitude) {
      const hall = table.hall;
      
      if (hall.centerLatitude && hall.centerLongitude) {
        const distance = geolib.getDistance(
          { latitude: checkInDto.latitude, longitude: checkInDto.longitude },
          { latitude: hall.centerLatitude, longitude: hall.centerLongitude },
        );

        const maxDistance = this.configService.get<number>('app.locationMaxDistanceMeters', 50);

        if (distance > maxDistance) {
          throw new BadRequestException(
            `Konumunuz kütüphaneden çok uzak (${distance}m). Lütfen kütüphaneye gidin.`,
          );
        }

        reservation.checkInDistanceMeters = distance;
      }

      reservation.checkInLatitude = checkInDto.latitude;
      reservation.checkInLongitude = checkInDto.longitude;
    }

    // Check-in başarılı
    reservation.status = ReservationStatus.ACTIVE;
    reservation.checkedInAt = now;

    return this.reservationRepository.save(reservation);
  }

  async validateQrCode(qrCode: string): Promise<{
    isValid: boolean;
    table?: Table;
    message?: string;
  }> {
    const table = await this.tableRepository.findOne({
      where: { qrCode, isActive: true },
      relations: ['hall', 'features'],
    });

    if (!table) {
      return {
        isValid: false,
        message: 'Geçersiz QR kod',
      };
    }

    return {
      isValid: true,
      table,
    };
  }
}

