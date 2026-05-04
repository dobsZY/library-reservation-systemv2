import '../../env.defaults';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Hall } from '../entities/hall.entity';

/**
 * Tüm salonların check-in yarıçapını env'deki LOCATION_MAX_DISTANCE_METERS ile eşitler (varsayılan 300).
 * Tam seed çalıştırmadan sadece yarıçap migrasyonu için kullanın.
 */
async function main() {
  const meters = parseInt(process.env.LOCATION_MAX_DISTANCE_METERS || '300', 10);
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const ds = app.get(DataSource);
    const result = await ds
      .getRepository(Hall)
      .createQueryBuilder()
      .update(Hall)
      .set({ allowedRadiusMeters: meters })
      .execute();
    const affected = typeof result.affected === 'number' ? result.affected : 0;
    console.log(`Salon yarıçabı güncellendi: ${meters} m (${affected} satır).`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
