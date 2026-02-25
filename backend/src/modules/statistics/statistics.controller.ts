import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('occupancy')
  @ApiOperation({ summary: 'Genel doluluk istatistiklerini getir' })
  @ApiResponse({
    status: 200,
    description: 'Genel doluluk istatistikleri',
  })
  async getOverallOccupancy() {
    return this.statisticsService.getOverallOccupancy();
  }

  @Get('occupancy/hall/:hallId')
  @ApiOperation({ summary: 'Salon bazlı doluluk istatistiklerini getir' })
  async getHallOccupancy(@Param('hallId', ParseUUIDPipe) hallId: string) {
    return this.statisticsService.getHallOccupancy(hallId);
  }
}

