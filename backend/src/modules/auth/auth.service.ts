import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserSession } from '../../database/entities';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginResponseDto } from './dto';
import { verifyPassword } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { studentNumber, password } = loginDto;

    // Kullanıcı doğrulama
    const user = await this.usersService.findByStudentNumber(studentNumber);
    if (!user) {
      throw new UnauthorizedException('Öğrenci numarası veya şifre hatalı.');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Öğrenci numarası veya şifre hatalı.');
    }

    // Tek aktif oturum: önceki kayıtları sil (çıkış yapılmadan uygulama kapanırsa / token silinirse
    // sunucuda oturum kalır; yeni girişte takılmayı önlemek için burada temizlenir).
    await this.sessionRepository.delete({ userId: user.id });

    // JWT oluştur
    const jti = uuidv4();
    const payload = {
      sub: user.id,
      studentNumber: user.studentNumber,
      role: user.role,
      jti,
    };
    const accessToken = this.jwtService.sign(payload);

    // Oturum kaydı oluştur
    const expiresAt = this.computeExpiresAt();
    const session = this.sessionRepository.create({
      userId: user.id,
      jti,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    return {
      accessToken,
      user: {
        id: user.id,
        studentNumber: user.studentNumber,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    return {
      id: user.id,
      studentNumber: user.studentNumber,
      fullName: user.fullName,
      role: user.role,
    };
  }

  /**
   * JWT expiresIn konfigürasyonundan oturum bitiş zamanını hesaplar.
   */
  private computeExpiresAt(): Date {
    const expiresIn = this.configService.get<string>('app.jwtExpiresIn', '7d');
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      // Varsayılan: 7 gün
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * (multipliers[unit] || 86400000));
  }
}
