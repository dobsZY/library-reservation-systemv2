import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  Reservation,
  ReservationStatus,
  Table,
  TableLock,
  LockStatus,
  Hall,
  OperatingSchedule,
} from '../../database/entities';
import { CreateReservationDto, ExtendReservationDto } from './dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(TableLock)
    private readonly tableLockRepository: Repository<TableLock>,
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
    @InjectRepository(OperatingSchedule)
    private readonly scheduleRepository: Repository<OperatingSchedule>,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, createDto: CreateReservationDto): Promise<Reservation> {
    const { tableId, startTime, durationHours } = createDto;

    // 1. Masa kontrolü
    const table = await this.tableRepository.findOne({
      where: { id: tableId, isActive: true },
      relations: ['hall'],
    });

    if (!table) {
      throw new NotFoundException('Masa bulunamadı');
    }

    // 2. Süre kontrolü (1-3 saat)
    const maxHours = this.configService.get<number>('app.reservationMaxHours', 3);
    const minHours = this.configService.get<number>('app.reservationMinHours', 1);

    if (durationHours < minHours || durationHours > maxHours) {
      throw new BadRequestException(`Rezervasyon süresi ${minHours}-${maxHours} saat arasında olmalıdır`);
    }

    // 3. Çalışma saatleri kontrolü
    const reservationDate = new Date(startTime);
    reservationDate.setHours(0, 0, 0, 0);

    const isValidTime = await this.checkOperatingHours(new Date(startTime), durationHours);
    if (!isValidTime) {
      throw new BadRequestException('Seçilen saat çalışma saatleri dışında');
    }

    // 4. Kullanıcının aktif rezervasyonu var mı?
    const existingActiveReservation = await this.findActiveReservation(userId);
    
    if (existingActiveReservation) {
      // Zincir rezervasyon kontrolü - son 30 dakikada mı?
      const now = new Date();
      const minutesRemaining = (existingActiveReservation.endTime.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesRemaining > 30) {
        throw new ConflictException('Zaten aktif bir rezervasyonunuz var. Yeni rezervasyon için son 30 dakikayı bekleyin.');
      }
    }

    // 5. Masa müsait mi? (3 saatlik kilit kontrolü)
    const startDate = new Date(startTime);
    const lockEndTime = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // +3 saat kilit

    const conflictingLock = await this.tableLockRepository.findOne({
      where: {
        tableId,
        status: LockStatus.ACTIVE,
        lockStart: LessThanOrEqual(lockEndTime),
        lockEnd: MoreThanOrEqual(startDate),
      },
    });

    if (conflictingLock) {
      throw new ConflictException('Bu masa seçilen saatlerde müsait değil');
    }

    // 6. Rezervasyon oluştur
    const endTime = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    const qrTimeoutMinutes = existingActiveReservation 
      ? this.configService.get<number>('app.chainQrTimeoutMinutes', 15)
      : this.configService.get<number>('app.qrTimeoutMinutes', 30);

    const qrDeadline = new Date(startDate.getTime() + qrTimeoutMinutes * 60 * 1000);

    const reservation = this.reservationRepository.create({
      userId,
      tableId,
      hallId: table.hallId,
      reservationDate,
      startTime: startDate,
      endTime,
      lockEndTime,
      durationHours,
      qrDeadline,
      isChain: !!existingActiveReservation,
      chainId: existingActiveReservation?.chainId || uuidv4(),
      chainSequence: existingActiveReservation ? existingActiveReservation.chainSequence + 1 : 1,
      previousReservationId: existingActiveReservation?.id,
      status: ReservationStatus.PENDING,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // 7. Masa kilidi oluştur
    const tableLock = this.tableLockRepository.create({
      tableId,
      reservationId: savedReservation.id,
      lockDate: reservationDate,
      lockStart: startDate,
      lockEnd: lockEndTime,
      status: LockStatus.ACTIVE,
    });

    await this.tableLockRepository.save(tableLock);

    // 8. Önceki rezervasyonu "extended" olarak işaretle
    if (existingActiveReservation) {
      existingActiveReservation.status = ReservationStatus.EXTENDED;
      await this.reservationRepository.save(existingActiveReservation);
    }

    return this.findOne(savedReservation.id);
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['table', 'table.features', 'hall'],
    });

    if (!reservation) {
      throw new NotFoundException('Rezervasyon bulunamadı');
    }

    return reservation;
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { userId },
      relations: ['table', 'hall'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findActiveReservation(userId: string): Promise<Reservation | null> {
    return this.reservationRepository.findOne({
      where: {
        userId,
        status: In([ReservationStatus.PENDING, ReservationStatus.ACTIVE]),
      },
      relations: ['table', 'hall'],
    });
  }

  async cancel(id: string, userId: string, reason?: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.userId !== userId) {
      throw new BadRequestException('Bu rezervasyon size ait değil');
    }

    if (![ReservationStatus.PENDING, ReservationStatus.ACTIVE].includes(reservation.status)) {
      throw new BadRequestException('Bu rezervasyon iptal edilemez');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();
    if (reason) {
      reservation.cancelledReason = reason;
    }

    // Kilidi serbest bırakmak için zamanla
    const delayMinutes = this.configService.get<number>('app.lockReleaseDelayMinutes', 5);
    const releaseTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    await this.tableLockRepository.update(
      { reservationId: id },
      { 
        status: LockStatus.CANCELLED,
        releaseScheduledAt: releaseTime,
      },
    );

    return this.reservationRepository.save(reservation);
  }

  async extend(id: string, userId: string, extendDto: ExtendReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.userId !== userId) {
      throw new BadRequestException('Bu rezervasyon size ait değil');
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Sadece aktif rezervasyonlar uzatılabilir');
    }

    // Son 30 dakika kontrolü
    const now = new Date();
    const minutesRemaining = (reservation.endTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesRemaining > 30) {
      throw new BadRequestException('Uzatma için son 30 dakikayı bekleyin');
    }

    // Mevcut süre + uzatma <= 3 saat kontrolü
    const maxHours = this.configService.get<number>('app.reservationMaxHours', 3);
    const currentHours = reservation.durationHours;
    const totalHours = currentHours + extendDto.additionalHours;

    if (totalHours > maxHours) {
      throw new BadRequestException(`Toplam süre ${maxHours} saati geçemez. Yeni rezervasyon yapın.`);
    }

    // Uzatma uygula
    const newEndTime = new Date(reservation.endTime.getTime() + extendDto.additionalHours * 60 * 60 * 1000);
    
    reservation.endTime = newEndTime;
    reservation.durationHours = totalHours;

    // Kilit zaten 3 saat olduğu için güncellemeye gerek yok

    return this.reservationRepository.save(reservation);
  }

  async getUserTodayStats(userId: string): Promise<{
    hasActiveReservation: boolean;
    activeReservation: Reservation | null;
    canMakeNewReservation: boolean;
    canExtend: boolean;
    todayReservations: Reservation[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReservations = await this.reservationRepository.find({
      where: {
        userId,
        reservationDate: Between(today, tomorrow),
      },
      relations: ['table', 'hall'],
      order: { startTime: 'ASC' },
    });

    const activeReservation = await this.findActiveReservation(userId);

    let canMakeNewReservation = true;
    let canExtend = false;

    if (activeReservation) {
      const now = new Date();
      const minutesRemaining = (activeReservation.endTime.getTime() - now.getTime()) / (1000 * 60);
      
      canMakeNewReservation = minutesRemaining <= 30;
      canExtend = minutesRemaining <= 30 && activeReservation.durationHours < 3;
    }

    return {
      hasActiveReservation: !!activeReservation,
      activeReservation,
      canMakeNewReservation,
      canExtend,
      todayReservations,
    };
  }

  private async checkOperatingHours(startTime: Date, durationHours: number): Promise<boolean> {
    const date = new Date(startTime);
    date.setHours(0, 0, 0, 0);

    // Aktif takvimi bul
    const schedule = await this.scheduleRepository.findOne({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(date),
        endDate: MoreThanOrEqual(date),
      },
    });

    // 7/24 ise her zaman geçerli
    if (schedule?.is24h) {
      return true;
    }

    const openingTime = schedule?.openingTime || '08:00';
    const closingTime = schedule?.closingTime || '23:00';

    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    const endHour = endTime.getHours();
    const endMin = endTime.getMinutes();

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return startMinutes >= openMinutes && endMinutes <= closeMinutes;
  }
}

