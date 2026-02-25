import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HallsService } from './halls.service';
import { CreateHallDto, UpdateHallDto, HallResponseDto, HallAvailabilityDto } from './dto';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm salonları listele' })
  @ApiResponse({ status: 200, description: 'Salon listesi', type: [HallResponseDto] })
  async findAll() {
    return this.hallsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Salon detayını getir' })
  @ApiResponse({ status: 200, description: 'Salon detayı', type: HallResponseDto })
  @ApiResponse({ status: 404, description: 'Salon bulunamadı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hallsService.findOne(id);
  }

  @Get(':id/tables')
  @ApiOperation({ summary: 'Salon masalarını getir' })
  @ApiResponse({ status: 200, description: 'Salon ve masaları' })
  async findWithTables(@Param('id', ParseUUIDPipe) id: string) {
    return this.hallsService.findWithTables(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Salon doluluk durumunu getir' })
  @ApiQuery({ name: 'date', required: false, description: 'Tarih (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Doluluk durumu', type: HallAvailabilityDto })
  async getAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.hallsService.getHallAvailability(id, date);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni salon oluştur' })
  @ApiResponse({ status: 201, description: 'Salon oluşturuldu', type: HallResponseDto })
  async create(@Body() createHallDto: CreateHallDto) {
    return this.hallsService.create(createHallDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Salon güncelle' })
  @ApiResponse({ status: 200, description: 'Salon güncellendi', type: HallResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHallDto: UpdateHallDto,
  ) {
    return this.hallsService.update(id, updateHallDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Salon sil (soft delete)' })
  @ApiResponse({ status: 200, description: 'Salon silindi' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hallsService.remove(id);
  }
}

