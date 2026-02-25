import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // QR
  qrSecret: process.env.QR_SECRET || 'default-qr-secret',
  
  // Konum
  locationMaxDistanceMeters: parseInt(process.env.LOCATION_MAX_DISTANCE_METERS || '50', 10),
  
  // Rezervasyon Kuralları
  reservationMaxHours: parseInt(process.env.RESERVATION_MAX_HOURS || '3', 10),
  reservationMinHours: parseInt(process.env.RESERVATION_MIN_HOURS || '1', 10),
  qrTimeoutMinutes: parseInt(process.env.QR_TIMEOUT_MINUTES || '30', 10),
  qrWarningMinutes: parseInt(process.env.QR_WARNING_MINUTES || '25', 10),
  chainQrTimeoutMinutes: parseInt(process.env.CHAIN_QR_TIMEOUT_MINUTES || '15', 10),
  lockReleaseDelayMinutes: parseInt(process.env.LOCK_RELEASE_DELAY_MINUTES || '5', 10),
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  
  // Swagger
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
}));

