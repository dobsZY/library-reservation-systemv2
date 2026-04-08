import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository, MoreThan } from 'typeorm';
import { UserSession } from '../../../database/entities';

interface JwtPayload {
  sub: string;
  studentNumber: string;
  role: string;
  jti: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {
    const secret = configService.get<string>('app.jwtSecret');
    if (!secret) {
      throw new Error('JWT_SECRET yapılandırılmamış.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Oturumun hâlâ aktif olduğunu doğrula (logout yapılmamış olmalı)
    const session = await this.sessionRepository.findOne({
      where: {
        jti: payload.jti,
        userId: payload.sub,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş oturum.');
    }

    return {
      id: payload.sub,
      studentNumber: payload.studentNumber,
      role: payload.role,
    };
  }
}
