import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import {
  User,
  UserRole,
  UserSession,
  Reservation,
  ReservationStatus,
  Hall,
  Table,
  TableFeature,
  TableLock,
  LockStatus,
  OperatingSchedule,
  ScheduleType,
  SchedulePeriodKind,
} from '../../database/entities';
import {
  CreateSpecialPeriodDto,
  ToggleSpecialPeriodDto,
  UpdateSpecialPeriodDto,
} from './dto/manage-special-period.dto';

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
    @InjectRepository(OperatingSchedule)
    private readonly scheduleRepository: Repository<OperatingSchedule>,
  ) {}

  // ── Users ──────────────────────────────────────────────────

  /**
   * Geçiş dönemi uyumluluğu:
   * - Kalıcı model: isSuperAdmin alanı
   * - Varsayılan süper admin hesabı: admin001
   */
  private isSuperAdminUser(user: User): boolean {
    return !!user.isSuperAdmin || user.studentNumber === 'admin001';
  }

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
      isSuperAdmin: this.isSuperAdminUser(u),
      isActive: u.isActive,
      hasActiveSession: activeUserIds.has(u.id),
      createdAt: u.createdAt,
    }));
  }

  async forceLogout(userId: string, actorUserId: string): Promise<void> {
    const [actor, targetUser] = await Promise.all([
      this.userRepository.findOne({ where: { id: actorUserId } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);
    if (!actor) throw new NotFoundException('İşlemi yapan yönetici bulunamadı.');
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı.');

    const targetIsAdmin = targetUser.role === UserRole.ADMIN;
    if (targetIsAdmin && !this.isSuperAdminUser(actor)) {
      throw new ForbiddenException(
        'Yönetici oturumlarını yalnızca süper admin sonlandırabilir.',
      );
    }

    await this.sessionRepository.delete({ userId });
  }

  async updateUserRole(targetUserId: string, newRole: UserRole, actorUserId: string): Promise<any> {
    const [actor, target] = await Promise.all([
      this.userRepository.findOne({ where: { id: actorUserId } }),
      this.userRepository.findOne({ where: { id: targetUserId } }),
    ]);

    if (!actor) throw new NotFoundException('İşlemi yapan yönetici bulunamadı.');
    if (!target) throw new NotFoundException('Kullanıcı bulunamadı.');

    if (targetUserId === actorUserId) {
      throw new BadRequestException('Kendi rolünüzü değiştiremezsiniz.');
    }

    const touchesAdminPermission =
      target.role === UserRole.ADMIN || newRole === UserRole.ADMIN;

    if (touchesAdminPermission && !this.isSuperAdminUser(actor)) {
      throw new ForbiddenException(
        'Admin yetkilerini yalnızca süper admin değiştirebilir.',
      );
    }

    if (this.isSuperAdminUser(target)) {
      throw new ForbiddenException(
        'Süper admin rol/yetki değişikliği yapılamaz.',
      );
    }

    if (target.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException('Sistemde en az bir yönetici kalmalıdır.');
      }
    }

    if (target.role === newRole) {
      throw new BadRequestException('Kullanıcı zaten bu role sahip.');
    }

    target.role = newRole;
    if (newRole !== UserRole.ADMIN) {
      target.isSuperAdmin = false;
    }
    await this.userRepository.save(target);
    await this.sessionRepository.delete({ userId: targetUserId });

    const hasActiveSession = false;
    return {
      id: target.id,
      studentNumber: target.studentNumber,
      fullName: target.fullName,
      role: target.role,
      isSuperAdmin: this.isSuperAdminUser(target),
      isActive: target.isActive,
      hasActiveSession,
      createdAt: target.createdAt,
    };
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

  async getHalls(): Promise<
    Array<
      Hall & {
        totalTables: number;
        occupiedTables: number;
        availableTables: number;
        occupancyRate: number;
      }
    >
  > {
    const halls = await this.hallRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    if (halls.length === 0) {
      return [];
    }

    const hallIds = halls.map((h) => h.id);
    const tables = await this.tableRepository.find({
      where: { hallId: In(hallIds), isActive: true },
      select: ['id', 'hallId'],
    });

    const totalByHall = new Map<string, number>();
    for (const t of tables) {
      totalByHall.set(t.hallId, (totalByHall.get(t.hallId) ?? 0) + 1);
    }

    const now = new Date();
    const occupiedRaw = await this.tableLockRepository
      .createQueryBuilder('l')
      .innerJoin('tables', 't', 't.id = l.table_id')
      .select('t.hall_id', 'hallId')
      .addSelect('COUNT(DISTINCT l.table_id)', 'occupiedCount')
      .where('l.status = :status', { status: LockStatus.ACTIVE })
      .andWhere('l.lock_start <= :now', { now })
      .andWhere('l.lock_end > :now', { now })
      .andWhere('t.is_active = true')
      .andWhere('t.hall_id IN (:...hallIds)', { hallIds })
      .groupBy('t.hall_id')
      .getRawMany<{ hallId: string; occupiedCount: string }>();

    const occupiedByHall = new Map<string, number>();
    for (const row of occupiedRaw) {
      occupiedByHall.set(row.hallId, Number(row.occupiedCount) || 0);
    }

    return halls.map((hall) => {
      const totalTables = totalByHall.get(hall.id) ?? 0;
      const occupiedTables = occupiedByHall.get(hall.id) ?? 0;
      const availableTables = Math.max(0, totalTables - occupiedTables);
      const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
      return {
        ...hall,
        totalTables,
        occupiedTables,
        availableTables,
        occupancyRate,
      };
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
    cancelledReservations: number;
    occupancyRate: number;
  }> {
    const now = new Date();

    const [totalUsers, totalReservations, activeReservations, noShowCount, cancelledReservations] =
      await Promise.all([
        this.userRepository.count(),
        this.reservationRepository.count(),
        this.reservationRepository.count({
          where: { status: In([ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN]) },
        }),
        this.reservationRepository.count({
          where: { status: In([ReservationStatus.NO_SHOW, ReservationStatus.EXPIRED]) },
        }),
        this.reservationRepository.count({
          where: { status: ReservationStatus.CANCELLED },
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

    return {
      totalUsers,
      totalReservations,
      activeReservations,
      noShowCount,
      cancelledReservations,
      occupancyRate,
    };
  }

  // ── Special Periods (Admin Managed) ────────────────────────

  async getSpecialPeriods(): Promise<OperatingSchedule[]> {
    return this.scheduleRepository.find({
      where: { periodKind: SchedulePeriodKind.SPECIAL },
      order: {
        isActive: 'DESC',
        startDate: 'DESC',
        priority: 'DESC',
      },
    });
  }

  async createSpecialPeriod(dto: CreateSpecialPeriodDto): Promise<OperatingSchedule> {
    this.validateDateRange(dto.startDate, dto.endDate);
    await this.ensureNoActivePeriodOverlap(dto.startDate, dto.endDate);

    const schedule = this.scheduleRepository.create({
      name: dto.name,
      scheduleType: ScheduleType.EXAM_FINAL,
      periodKind: SchedulePeriodKind.SPECIAL,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      is24h: dto.is24h ?? true,
      openingTime: dto.openingTime ?? '00:00',
      closingTime: dto.closingTime ?? '23:59',
      maxDurationHours: 3,
      chainQrTimeoutMinutes: 15,
      priority: dto.priority ?? 100,
      rules: {
        allowAdvanceBooking: dto.rules?.allowAdvanceBooking ?? true,
        maxAdvanceDays: dto.rules?.maxAdvanceDays ?? 1,
      },
      isActive: true,
    });

    return this.scheduleRepository.save(schedule);
  }

  async updateSpecialPeriod(id: string, dto: UpdateSpecialPeriodDto): Promise<OperatingSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, periodKind: SchedulePeriodKind.SPECIAL },
    });
    if (!schedule) {
      throw new NotFoundException('Ozel donem bulunamadi.');
    }

    const nextStartDate = dto.startDate ?? schedule.startDate.toISOString().slice(0, 10);
    const nextEndDate = dto.endDate ?? schedule.endDate.toISOString().slice(0, 10);
    this.validateDateRange(nextStartDate, nextEndDate);
    await this.ensureNoActivePeriodOverlap(nextStartDate, nextEndDate, id);

    Object.assign(schedule, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
      ...(dto.is24h !== undefined ? { is24h: dto.is24h } : {}),
      ...(dto.openingTime !== undefined ? { openingTime: dto.openingTime } : {}),
      ...(dto.closingTime !== undefined ? { closingTime: dto.closingTime } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.rules !== undefined
        ? {
            rules: {
              ...schedule.rules,
              ...dto.rules,
            },
          }
        : {}),
    });

    return this.scheduleRepository.save(schedule);
  }

  async toggleSpecialPeriod(id: string, dto: ToggleSpecialPeriodDto): Promise<OperatingSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, periodKind: SchedulePeriodKind.SPECIAL },
    });
    if (!schedule) {
      throw new NotFoundException('Ozel donem bulunamadi.');
    }

    schedule.isActive = dto.isActive;
    return this.scheduleRepository.save(schedule);
  }

  async deleteSpecialPeriod(id: string): Promise<{ message: string }> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, periodKind: SchedulePeriodKind.SPECIAL },
    });
    if (!schedule) {
      throw new NotFoundException('Ozel donem bulunamadi.');
    }

    await this.scheduleRepository.remove(schedule);
    return { message: 'Ozel donem silindi.' };
  }

  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Gecersiz tarih degeri.');
    }
    if (start > end) {
      throw new BadRequestException('Baslangic tarihi bitis tarihinden buyuk olamaz.');
    }
  }

  private async ensureNoActivePeriodOverlap(
    startDate: string,
    endDate: string,
    excludeId?: string,
  ): Promise<void> {
    const where: any = {
      isActive: true,
      periodKind: SchedulePeriodKind.SPECIAL,
      startDate: LessThanOrEqual(new Date(endDate)),
      endDate: MoreThanOrEqual(new Date(startDate)),
    };
    if (excludeId) {
      where.id = Not(excludeId);
    }

    const overlaps = await this.scheduleRepository.find({
      where,
      select: ['id'],
    });

    const hasOverlap = overlaps.some((item) => item.id !== excludeId);
    if (hasOverlap) {
      throw new BadRequestException(
        'Bu tarih araliginda aktif baska bir ozel donem bulunuyor. Once mevcut donemi pasife alin.',
      );
    }
  }
}
