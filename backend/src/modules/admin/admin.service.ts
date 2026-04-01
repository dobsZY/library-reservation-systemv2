import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  User,
  UserSession,
  Reservation,
  ReservationStatus,
  Hall,
  Table,
  TableFeature,
  TableLock,
  LockStatus,
} from '../../database/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(TableFeature)
    private readonly featureRepository: Repository<TableFeature>,
    @InjectRepository(TableLock)
    private readonly tableLockRepository: Repository<TableLock>,
  ) {}

  // ── Users ──────────────────────────────────────────────────

  async getUsers(): Promise<any[]> {
    const users = await this.userRepository.find({ order: { createdAt: 'DESC' } });
    const activeSessions = await this.sessionRepository
      .createQueryBuilder('s')
      .select('s.user_id', 'userId')
      .where('s.expires_at > :now', { now: new Date() })
      .getRawMany();
    const activeUserIds = new Set(activeSessions.map((s) => s.userId));

    return users.map((u) => ({
      id: u.id,
      studentNumber: u.studentNumber,
      fullName: u.fullName,
      role: u.role,
      isActive: u.isActive,
      hasActiveSession: activeUserIds.has(u.id),
      createdAt: u.createdAt,
    }));
  }

  async forceLogout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    await this.sessionRepository.delete({ userId });
  }

  // ── Reservations ───────────────────────────────────────────

  async getReservations(statusFilter?: string): Promise<Reservation[]> {
    const where: any = {};
    if (statusFilter) {
      const mapped: Record<string, ReservationStatus[]> = {
        active: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN],
        cancelled: [ReservationStatus.CANCELLED],
        completed: [ReservationStatus.COMPLETED],
        no_show: [ReservationStatus.NO_SHOW, ReservationStatus.EXPIRED],
        expired: [ReservationStatus.NO_SHOW, ReservationStatus.EXPIRED],
      };
      const statuses = mapped[statusFilter];
      if (statuses) where.status = In(statuses);
    }
    return this.reservationRepository.find({
      where,
      relations: ['table', 'hall', 'user'],
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async adminCancelReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['table', 'hall'],
    });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı.');

    const isActive =
      reservation.status === ReservationStatus.RESERVED ||
      reservation.status === ReservationStatus.CHECKED_IN;

    if (!isActive) {
      throw new BadRequestException('Bu rezervasyon iptal edilemez.');
    }

    const now = new Date();
    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = now;
    reservation.cancelledReason = 'Yönetici tarafından iptal edildi';
    await this.reservationRepository.save(reservation);

    await this.tableLockRepository.update(
      { reservationId, status: LockStatus.ACTIVE },
      { status: LockStatus.RELEASED, releasedAt: now },
    );

    return reservation;
  }

  // ── Halls / Tables ─────────────────────────────────────────

  async getHalls(): Promise<Hall[]> {
    return this.hallRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getHallTables(hallId: string): Promise<Table[]> {
    return this.tableRepository.find({
      where: { hallId, isActive: true },
      relations: ['features'],
      order: { tableNumber: 'ASC' },
    });
  }

  async updateTable(
    tableId: string,
    dto: {
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      featureIds?: string[];
    },
  ): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['features'],
    });
    if (!table) throw new NotFoundException('Masa bulunamadı.');

    if (dto.positionX !== undefined) table.positionX = dto.positionX;
    if (dto.positionY !== undefined) table.positionY = dto.positionY;
    if (dto.width !== undefined) table.width = dto.width;
    if (dto.height !== undefined) table.height = dto.height;

    if (dto.featureIds) {
      const features = await this.featureRepository.findBy({ id: In(dto.featureIds) });
      table.features = features;
    }

    return this.tableRepository.save(table);
  }

  // ── Statistics Overview ────────────────────────────────────

  async getOverview(): Promise<{
    totalUsers: number;
    totalReservations: number;
    activeReservations: number;
    noShowCount: number;
    occupancyRate: number;
  }> {
    const now = new Date();

    const [totalUsers, totalReservations, activeReservations, noShowCount] = await Promise.all([
      this.userRepository.count(),
      this.reservationRepository.count(),
      this.reservationRepository.count({
        where: { status: In([ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN]) },
      }),
      this.reservationRepository.count({
        where: { status: In([ReservationStatus.NO_SHOW, ReservationStatus.EXPIRED]) },
      }),
    ]);

    const totalTables = await this.tableRepository.count({ where: { isActive: true } });
    const occupiedCount = await this.tableLockRepository
      .createQueryBuilder('l')
      .where('l.status = :s', { s: LockStatus.ACTIVE })
      .andWhere('l.lock_start <= :now', { now })
      .andWhere('l.lock_end > :now', { now })
      .getCount();

    const occupancyRate = totalTables > 0 ? (occupiedCount / totalTables) * 100 : 0;

    return { totalUsers, totalReservations, activeReservations, noShowCount, occupancyRate };
  }
}
