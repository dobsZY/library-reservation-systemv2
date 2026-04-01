import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, MessageResponseDto, UserProfileDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { RequestUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({
    status: 200,
    description: 'Başarılı giriş',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Öğrenci numarası veya şifre hatalı',
  })
  @ApiResponse({
    status: 409,
    description: 'Zaten aktif bir oturum var',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oturumu kapat' })
  @ApiResponse({
    status: 200,
    description: 'Oturum başarıyla kapatıldı',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async logout(@CurrentUser() user: RequestUser): Promise<MessageResponseDto> {
    await this.authService.logout(user.id);
    return { message: 'Oturum başarıyla kapatıldı.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oturumdaki kullanıcı bilgisi' })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı profili',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getMe(@CurrentUser() user: RequestUser): Promise<UserProfileDto> {
    return this.authService.getProfile(user.id);
  }
}
