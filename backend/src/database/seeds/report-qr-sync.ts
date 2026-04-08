import { NestFactory } from '@nestjs/core';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Table } from '../entities/table.entity';

const IMPORT_DIR = process.env.QR_IMPORT_DIR || 'C:/Users/Kaan/Desktop/qr_png';
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function parseTableNumberFromFileName(fileName: string): string | null {
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  const match = nameWithoutExt.match(/([A-Fa-f])[\s_-]?(\d{1,3})/);
  if (!match) return null;
  return `${match[1].toUpperCase()} ${match[2].padStart(3, '0')}`;
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) out.push(fullPath);
      }
    }
  }

  await walk(dir);
  return out;
}

async function run() {
  const files = await walkFiles(IMPORT_DIR);
  const tableNumbersFromFiles = new Set<string>();
  for (const fullPath of files) {
    const parsed = parseTableNumberFromFileName(path.basename(fullPath));
    if (parsed) tableNumbersFromFiles.add(parsed);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
  const tableRepo = ds.getRepository(Table);

  const activeTables = await tableRepo.find({
    where: { isActive: true },
    select: { tableNumber: true },
  });
  const tableNumbersFromDb = new Set(activeTables.map((t) => t.tableNumber));

  const missingInDb = Array.from(tableNumbersFromFiles).filter((n) => !tableNumbersFromDb.has(n));
  const missingInFiles = Array.from(tableNumbersFromDb).filter((n) => !tableNumbersFromFiles.has(n));

  console.log('--- QR Sync Report ---');
  console.log(`QR file count: ${files.length}`);
  console.log(`Parsed unique table numbers from files: ${tableNumbersFromFiles.size}`);
  console.log(`Active table count in DB: ${tableNumbersFromDb.size}`);
  console.log(`In files but not DB: ${missingInDb.length}`);
  console.log(`In DB but not files: ${missingInFiles.length}`);

  if (missingInDb.length > 0) {
    console.log('\nMissing in DB (first 50):');
    console.log(missingInDb.slice(0, 50).join(', '));
  }

  if (missingInFiles.length > 0) {
    console.log('\nMissing in files (first 50):');
    console.log(missingInFiles.slice(0, 50).join(', '));
  }

  await app.close();
}

run().catch((err) => {
  console.error('QR sync report error:', err);
  process.exit(1);
});

