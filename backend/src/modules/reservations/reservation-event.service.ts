import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLog, ReservationLogEvent } from '../../database/entities';

@Injectable()
export class ReservationEventService {
  private readonly logger = new Logger(ReservationEventService.name);

  constructor(
    @InjectRepository(ReservationLog)
    private readonly logRepository: Repository<ReservationLog>,
  ) {}

  async log(
    event: ReservationLogEvent,
    reservationId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const entry = this.logRepository.create({
        event,
        reservationId,
        userId,
        metadata,
      });
      await this.logRepository.save(entry);
    } catch (error) {
      this.logger.error(
        `Rezervasyon log kaydedilemedi: ${event} - ${reservationId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
