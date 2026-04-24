/**
 * Tüm prod konfigürasyonu koda gömülü; .env kullanılmıyor.
 * Lokal geliştirmede istersen process.env.X set ederek override edebilirsin;
 * boşsa aşağıdaki değerler kullanılır.
 */
export const config = {
  NODE_ENV: 'production',
  PORT: '3000',
  API_PREFIX: 'api/v1',
  DB_HOST: 'postgres',
  DB_PORT: '5432',
  DB_USERNAME: 'kutuphane',
  DB_PASSWORD: 'kutuphane123',
  DB_DATABASE: 'kütüphane',
  /** Tam URL set edildiginde TypeORM buna gore baglanir (docker agi: servis adi `postgres`) */
  DATABASE_URL: 'postgresql://kutuphane:kutuphane123@postgres:5432/kütüphane',
  // Uretimde daima false: synchronize semayi otomatik degistirmeye calisir, risklidir. Semayi migration ile yonet.
  DB_SYNCHRONIZE: 'false',
  DB_LOGGING: 'false',

  REDIS_HOST: 'redis',
  REDIS_PORT: '6379',

  JWT_SECRET: 'selcuk-university-library-jwt-prod-2026-xK8vNq3mZ7',
  JWT_EXPIRES_IN: '7d',
  QR_SECRET: 'selcuk-library-qr-prod-2026-pR9wLm4nBv',

  CORS_ORIGINS: 'https://kutuphane.aatakan.info',
  SWAGGER_ENABLED: 'true',

  LOCATION_MAX_DISTANCE_METERS: '50',
  LOCATION_ACCURACY_TOLERANCE_CAP_METERS: '25',

  RESERVATION_MAX_HOURS: '3',
  RESERVATION_MIN_HOURS: '1',
  QR_TIMEOUT_MINUTES: '30',
  QR_WARNING_MINUTES: '25',
  CHAIN_QR_TIMEOUT_MINUTES: '15',
  LOCK_RELEASE_DELAY_MINUTES: '5',
} as const;

for (const [key, value] of Object.entries(config)) {
  if (process.env[key] === undefined || process.env[key] === '') {
    process.env[key] = value;
  }
}
