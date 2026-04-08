-- ============================================
-- SELÇUK ÜNİVERSİTESİ KÜTÜPHANE REZERVASYON
-- Veritabanı Başlangıç Script'i
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Varsayılan masa özellikleri
INSERT INTO table_features (id, code, name, icon, description, display_order, is_active)
VALUES
  (uuid_generate_v4(), 'power_outlet', 'Priz', '🔌', 'Masada elektrik prizi mevcut', 1, true),
  (uuid_generate_v4(), 'window_view', 'Cam Kenarı', '🪟', 'Pencere kenarında, manzaralı', 2, true),
  (uuid_generate_v4(), 'quiet_zone', 'Sessiz Bölge', '🤫', 'Sessiz çalışma alanında', 3, true),
  (uuid_generate_v4(), 'computer', 'Bilgisayar', '🖥️', 'Masada bilgisayar mevcut', 4, true),
  (uuid_generate_v4(), 'group_table', 'Grup Masası', '👥', 'Grup çalışmasına uygun', 5, true),
  (uuid_generate_v4(), 'accessible', 'Engelli Erişimi', '♿', 'Engelli erişimine uygun', 6, true),
  (uuid_generate_v4(), 'air_conditioner', 'Klima Yakını', '❄️', 'Klimaya yakın konum', 7, true),
  (uuid_generate_v4(), 'near_door', 'Kapı Yakını', '🚪', 'Giriş kapısına yakın', 8, true),
  (uuid_generate_v4(), 'lamp', 'Masa Lambası', '💡', 'Kişisel masa lambası mevcut', 9, true),
  (uuid_generate_v4(), 'large_desk', 'Geniş Masa', '📐', 'Standarttan büyük çalışma alanı', 10, true)
ON CONFLICT (code) DO NOTHING;

-- Varsayılan çalışma takvimi (Normal dönem)
INSERT INTO operating_schedules (id, name, schedule_type, start_date, end_date, is_24h, opening_time, closing_time, is_active)
VALUES
  (uuid_generate_v4(), 'Normal Dönem 2024-2025', 'normal', '2024-09-01', '2025-06-30', false, '08:00', '23:00', true)
ON CONFLICT DO NOTHING;

-- Örnek Final Haftası
INSERT INTO operating_schedules (id, name, schedule_type, start_date, end_date, is_24h, opening_time, closing_time, is_active)
VALUES
  (uuid_generate_v4(), 'Final Haftası Ocak 2025', 'exam_final', '2025-01-13', '2025-01-26', true, '00:00', '23:59', true)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Başlangıç verileri yüklendi!';

