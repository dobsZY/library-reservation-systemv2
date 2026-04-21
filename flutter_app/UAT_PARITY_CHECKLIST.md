# Flutter RN Parity UAT Checklist

## 1) Auth ve Role Routing
- [ ] Login basarili -> role bazli yonlendirme (`/student`, `/admin`, `/staff`)
- [ ] Yanlis sifre -> hata mesaji gosterimi
- [ ] 401 sonrasinda session temizleme ve login ekranina donus

## 2) Ogrenci Modulu
- [ ] Home salon listesi yukleniyor (`GET /halls`)
- [ ] Rezervasyon durum karti (`GET /reservations/my/status`)
- [ ] Hall detail ekranindan rezervasyon olusturma (`POST /reservations`)
- [ ] Aktif rezervasyon ekraninda uzatma (`PUT /reservations/:id/extend`)
- [ ] Aktif rezervasyon ekraninda iptal (`DELETE /reservations/:id`)
- [ ] Gecmis rezervasyonlar listesi (`GET /reservations/my/history`)
- [ ] QR validate + check-in (`POST /reservations/validate-qr`, `POST /reservations/check-in`)

## 3) Admin Modulu
- [ ] Dashboard ozeti (`GET /admin/statistics/overview`)
- [ ] Rezervasyon filtreleme/listeme (`GET /admin/reservations`)
- [ ] Admin rezervasyon iptali (`DELETE /admin/reservations/:id`)
- [ ] Kullanici listesi (`GET /admin/users`)
- [ ] Rol degistirme (`PATCH /admin/users/:id/role`)
- [ ] Force logout (`POST /admin/users/:id/force-logout`)
- [ ] Hall listesi + table listesi (`GET /admin/halls`, `GET /admin/halls/:id/tables`)
- [ ] Table guncelleme (`PATCH /admin/tables/:id`)
- [ ] Ozel takvim CRUD (`GET/POST/PATCH/DELETE /admin/special-periods*`)
- [ ] QR desk snapshot (`POST /desk/table-snapshot`)

## 4) Staff Modulu
- [ ] Staff dashboard aciliyor
- [ ] Staff reservations ekrani goruntuleme calisiyor
- [ ] Staff tarafinda rezervasyon iptal aksiyonu kapali
- [ ] Staff halls ekraninda table edit kapali
- [ ] Staff QR desk ekrani calisiyor

## 5) Platform ve Permissionlar
- [ ] Kamera izni ve QR akisi
- [ ] Konum izni ve check-in akisi
- [ ] Bildirim izinleri/tercihleri

## 6) Build/Test
- [ ] `flutter pub get`
- [ ] `flutter analyze`
- [ ] `flutter test`
- [ ] Android debug build
- [ ] iOS debug build (macOS ortaminda)
