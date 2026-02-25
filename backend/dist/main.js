"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const apiPrefix = configService.get('app.apiPrefix', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const corsOrigins = configService.get('app.corsOrigins', ['http://localhost:5173']);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    const swaggerEnabled = configService.get('app.swaggerEnabled', true);
    if (swaggerEnabled) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Kütüphane Rezervasyon API')
            .setDescription(`
        ## Selçuk Üniversitesi Kütüphane Masa Rezervasyon Sistemi
        
        Bu API, kütüphane masa rezervasyonu, QR check-in ve doluluk takibi işlemlerini yönetir.
        
        ### Özellikler
        - 🎫 Masa rezervasyonu (1-3 saat)
        - 📱 QR kod ile check-in
        - 📍 Konum doğrulama
        - 🔔 Bildirim sistemi
        - 📊 Doluluk istatistikleri
        `)
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('halls', 'Salon işlemleri')
            .addTag('tables', 'Masa işlemleri')
            .addTag('reservations', 'Rezervasyon işlemleri')
            .addTag('statistics', 'İstatistik işlemleri')
            .addTag('schedules', 'Çalışma takvimi işlemleri')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const port = configService.get('app.port', 3000);
    await app.listen(port);
    console.log(`
  🚀 Uygulama başlatıldı!
  
  📍 API: http://localhost:${port}/${apiPrefix}
  📚 Swagger: http://localhost:${port}/api/docs
  🌍 Ortam: ${configService.get('app.nodeEnv')}
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map