import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../../../database/entities';

export class LoginDto {
  @ApiProperty({ example: '200000001', description: 'Öğrenci numarası' })
  @IsString()
  @IsNotEmpty({ message: 'Öğrenci numarası boş olamaz.' })
  studentNumber: string;

  @ApiProperty({ example: 'Student123!', description: 'Şifre' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş olamaz.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;
}

export class UserProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '200000001' })
  studentNumber: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  fullName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Oturum başarıyla kapatıldı.' })
  message: string;
}
