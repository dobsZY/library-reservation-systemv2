import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { OperatingSchedule, ScheduleType } from '../entities/operating-schedule.entity';
import { Hall } from '../entities/hall.entity';
import { hashPassword } from '../../modules/auth/auth.utils';

// Selcuk Universitesi Merkez Kutuphane referans koordinatlari
const LIBRARY_CENTER_LATITUDE = 37.8716;
const LIBRARY_CENTER_LONGITUDE = 32.4938;
const DEFAULT_ALLOWED_RADIUS_METERS = 50;

const SEED_USERS = [
  {
    studentNumber: '200000001',
    fullName: 'Test Öğrenci',
    role: UserRole.STUDENT,
    password: 'Student123!',
  },
  {
    studentNumber: '200000002',
    fullName: 'Ayşe Kara',
    role: UserRole.STUDENT,
    password: 'Student123!',
  },
  {
    studentNumber: '200000003',
    fullName: 'Mehmet Demir',
    role: UserRole.STUDENT,
    password: 'Student123!',
  },
  {
    studentNumber: 'admin001',
    fullName: 'Sistem Yöneticisi',
    role: UserRole.ADMIN,
    password: 'Admin123!',
  },
  {
    studentNumber: 'staff001',
    fullName: 'Kütüphane Personeli',
    role: UserRole.STAFF,
    password: 'Staff123!',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(User);

  console.log('Seed başlatılıyor...\n');

  for (const userData of SEED_USERS) {
    const existing = await userRepo.findOne({
      where: { studentNumber: userData.studentNumber },
    });

    if (existing) {
      console.log(`  [MEVCUT] ${userData.studentNumber} - ${userData.fullName}`);
      continue;
    }

    const passwordHash = await hashPassword(userData.password);
    const user = userRepo.create({
      studentNumber: userData.studentNumber,
      fullName: userData.fullName,
      role: userData.role,
      passwordHash,
    });
    await userRepo.save(user);
    console.log(`  [OLUŞTURULDU] ${userData.studentNumber} - ${userData.fullName} (${userData.role})`);
  }

  // Varsayilan calisma takvimi olustur
  const scheduleRepo = dataSource.getRepository(OperatingSchedule);
  const existingSchedule = await scheduleRepo.findOne({
    where: { scheduleType: ScheduleType.NORMAL, isActive: true },
  });

  if (!existingSchedule) {
    const schedule = scheduleRepo.create({
      name: 'Normal Donem',
      scheduleType: ScheduleType.NORMAL,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      is24h: false,
      openingTime: '08:00',
      closingTime: '23:00',
      maxDurationHours: 3,
      chainQrTimeoutMinutes: 15,
      isActive: true,
    });
    await scheduleRepo.save(schedule);
    console.log('  [OLUSTURULDU] Varsayilan calisma takvimi (08:00 - 23:00)');
  } else {
    console.log('  [MEVCUT] Calisma takvimi');
  }

  // Mevcut salonlara koordinat bilgisi ekle (check-in icin gerekli)
  const hallRepo = dataSource.getRepository(Hall);
  const halls = await hallRepo.find();

  for (const hall of halls) {
    hall.centerLatitude = LIBRARY_CENTER_LATITUDE;
    hall.centerLongitude = LIBRARY_CENTER_LONGITUDE;
    hall.allowedRadiusMeters = DEFAULT_ALLOWED_RADIUS_METERS;

    await hallRepo.save(hall);
    console.log(
      `  [GUNCELLENDI] Salon "${hall.name}" koordinatlari set edildi ` +
        `(${LIBRARY_CENTER_LATITUDE}, ${LIBRARY_CENTER_LONGITUDE}, ${DEFAULT_ALLOWED_RADIUS_METERS}m)`,
    );
  }

  if (halls.length === 0) {
    console.log('  [BILGI] Henuz salon tanimlanmamis. Salonlar olusturulduktan sonra seed tekrar calistirilabilir.');
  }

  console.log('\nSeed tamamlandi!');
  console.log('\nTest kullanicilari:');
  console.log('  Ogrenci:  200000001 / Student123!');
  console.log('  Ogrenci:  200000002 / Student123!');
  console.log('  Ogrenci:  200000003 / Student123!');
  console.log('  Admin:    admin001  / Admin123!');
  console.log('  Personel: staff001  / Staff123!');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
