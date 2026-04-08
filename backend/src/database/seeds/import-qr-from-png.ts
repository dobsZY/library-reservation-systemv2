import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { AppModule } from '../../app.module';
import { Table } from '../entities/table.entity';

type DecodedQr = {
  tableNumber: string;
  qrText: string;
  fileName: string;
};

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const DEFAULT_IMPORT_DIR = 'C:/Users/Kaan/Desktop/qr_png';

function parseTableNumberFromFileName(fileName: string): string | null {
  // Ornekler: A001.png, A_001.png, A-001.jpg, A 001.webp
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  const match = nameWithoutExt.match(/([A-Fa-f])[\s_-]?(\d{1,3})/);
  if (!match) return null;

  const hallCode = match[1].toUpperCase();
  const index = match[2].padStart(3, '0');
  return `${hallCode} ${index}`;
}

async function decodeQrFromImage(filePath: string): Promise<string> {
  // qrcode-reader kutuphanesi callback tabanli; Promise wrapper kullaniyoruz.
  const { Jimp } = require('jimp');
  const QrCodeReader = require('qrcode-reader');
  const image = await Jimp.read(filePath);

  const tryDecode = async (bitmap: any): Promise<string> =>
    new Promise<string>((resolve, reject) => {
      const qr = new QrCodeReader();
      qr.callback = (err: Error | null, value: { result?: string } | null) => {
        if (err) {
          reject(err);
          return;
        }
        const result = value?.result?.trim();
        if (!result) {
          reject(new Error('QR icerigi okunamadi.'));
          return;
        }
        resolve(result);
      };
      qr.decode(bitmap);
    });

  const variants = [
    image.clone(),
    image.clone().greyscale(),
    image.clone().contrast(0.45),
    image.clone().greyscale().contrast(0.6),
    image.clone().resize({ w: image.bitmap.width * 2, h: image.bitmap.height * 2 }),
    image.clone().resize({ w: image.bitmap.width * 3, h: image.bitmap.height * 3 }).greyscale(),
    image
      .clone()
      .resize({ w: image.bitmap.width * 4, h: image.bitmap.height * 4 })
      .greyscale()
      .contrast(0.75),
  ];

  let lastError: unknown = null;
  for (const variant of variants) {
    try {
      return await tryDecode(variant.bitmap);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('QR icerigi okunamadi.');
}

async function collectDecodedQrs(importDir: string): Promise<DecodedQr[]> {
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  await walk(importDir);

  const decoded: DecodedQr[] = [];

  for (const fullPath of files) {
    const fileName = path.basename(fullPath);
    const tableNumber = parseTableNumberFromFileName(fileName);
    if (!tableNumber) {
      console.warn(`  [ATLANDI] Masa numarasi anlasilamadi: ${fileName}`);
      continue;
    }

    try {
      const qrText = await decodeQrFromImage(fullPath);
      decoded.push({ tableNumber, qrText, fileName });
      console.log(`  [OKUNDU] ${fileName} -> ${tableNumber}`);
    } catch (err: any) {
      console.warn(`  [ATLANDI] ${fileName} QR okunamadi: ${err?.message || err}`);
    }
  }

  return decoded;
}

async function run() {
  const importDir = process.env.QR_IMPORT_DIR || DEFAULT_IMPORT_DIR;
  console.log(`QR import baslatiliyor. Klasor: ${importDir}`);

  try {
    await fs.access(importDir);
  } catch {
    throw new Error(`Import klasoru bulunamadi: ${importDir}`);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const tableRepo = dataSource.getRepository(Table);

  const decodedQrs = await collectDecodedQrs(importDir);
  if (decodedQrs.length === 0) {
    console.log('Islenecek QR dosyasi bulunamadi.');
    await app.close();
    return;
  }

  let updated = 0;
  let notFound = 0;

  for (const item of decodedQrs) {
    const table = await tableRepo.findOne({
      where: { tableNumber: item.tableNumber, isActive: true },
    });

    if (!table) {
      notFound++;
      console.warn(
        `  [BULUNAMADI] ${item.tableNumber} icin aktif masa yok. Dosya: ${item.fileName}`,
      );
      continue;
    }

    table.qrCode = item.qrText;
    await tableRepo.save(table);
    updated++;
    console.log(`  [GUNCELLENDI] ${item.tableNumber} <- ${item.fileName}`);
  }

  console.log('\nQR import tamamlandi.');
  console.log(`Toplam okunan: ${decodedQrs.length}`);
  console.log(`Guncellenen masa: ${updated}`);
  console.log(`Masa bulunamayan: ${notFound}`);

  await app.close();
}

run().catch((err) => {
  console.error('QR import hatasi:', err);
  process.exit(1);
});

