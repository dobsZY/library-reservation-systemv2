import { NestFactory } from '@nestjs/core';
import * as fs from 'node:fs/promises';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { Table } from '../entities/table.entity';

const DEFAULT_CSV_PATH = 'C:/Users/Kaan/Desktop/qr_codes_all.csv';

type CsvRow = {
  hallName: string;
  tableNumber: string;
  qrCode: string;
};

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const rows: CsvRow[] = [];
  for (const line of lines.slice(1)) {
    const parts = line.split(',');
    if (parts.length < 3) continue;
    const hallName = parts[0].trim();
    const tableNumber = parts[1].trim();
    const qrCode = parts.slice(2).join(',').trim();
    if (!tableNumber || !qrCode) continue;
    rows.push({ hallName, tableNumber, qrCode });
  }
  return rows;
}

async function run() {
  const csvPath = process.env.QR_CSV_PATH || DEFAULT_CSV_PATH;
  const raw = await fs.readFile(csvPath, 'utf8');
  const rows = parseCsv(raw);

  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
  const tableRepo = ds.getRepository(Table);

  let updated = 0;
  let missing = 0;

  for (const row of rows) {
    const table = await tableRepo.findOne({
      where: { tableNumber: row.tableNumber, isActive: true },
    });
    if (!table) {
      missing++;
      continue;
    }
    table.qrCode = row.qrCode;
    await tableRepo.save(table);
    updated++;
  }

  console.log('CSV QR import tamamlandi.');
  console.log(`CSV satir sayisi: ${rows.length}`);
  console.log(`Guncellenen masa: ${updated}`);
  console.log(`Masa bulunamayan: ${missing}`);

  await app.close();
}

run().catch((err) => {
  console.error('CSV QR import hatasi:', err);
  process.exit(1);
});

