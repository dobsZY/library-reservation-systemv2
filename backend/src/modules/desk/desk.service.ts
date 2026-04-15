import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus, Table } from '../../database/entities';

/** Sunucu yerel takvim günü (rezervasyon tarihi ile aynı mantık) */
function ymdFromJsDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Kullanıcıya özel, tutarlı görsel (profil fotoğrafı alanı olmadığı için) */
export function deskAvatarUrlForUserId(userId: string): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userId)}&size=256`;
}

@Injectable()
export class DeskService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getTableSnapshotByQr(qrCode: string) {
    const raw = qrCode?.trim();
    if (!raw) {
      throw new BadRequestException('QR kodu zorunludur.');
    }

    const table = await this.tableRepository.findOne({
      where: { qrCode: raw, isActive: true },
      relations: ['hall'],
    });

    if (!table) {
      throw new NotFoundException('Bu QR kodu kayıtlı bir masaya ait değil.');
    }

    const ymd = ymdFromJsDate(new Date());
    const rows = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .where('r.tableId = :tableId', { tableId: table.id })
      .andWhere("to_char(r.reservationDate, 'YYYY-MM-DD') = :ymd", { ymd })
      .orderBy('r.startTime', 'ASC')
      .getMany();

    const mapRes = (r: Reservation) => ({
      id: r.id,
      status: r.status,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      user: {
        id: r.user.id,
        studentNumber: r.user.studentNumber,
        fullName: r.user.fullName,
        deskAvatarUrl: deskAvatarUrlForUserId(r.user.id),
      },
    });

    const todayReservations = rows.map(mapRes);
    const now = Date.now();

    let activeReservation: ReturnType<typeof mapRes> | null = null;
    for (const r of rows) {
      const start = r.startTime.getTime();
      const end = r.endTime.getTime();
      if (now < start || now > end) continue;
      if (r.status === ReservationStatus.CHECKED_IN) {
        activeReservation = mapRes(r);
        break;
      }
    }
    if (!activeReservation) {
      for (const r of rows) {
        const start = r.startTime.getTime();
        const end = r.endTime.getTime();
        if (now < start || now > end) continue;
        if (r.status === ReservationStatus.RESERVED) {
          activeReservation = mapRes(r);
          break;
        }
      }
    }

    return {
      calendarDate: ymd,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        hall: {
          id: table.hallId,
          name: table.hall?.name ?? '',
        },
      },
      activeReservation,
      todayReservations,
    };
  }
}
