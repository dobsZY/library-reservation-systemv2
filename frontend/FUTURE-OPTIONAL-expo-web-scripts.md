# İleri tarihli opsiyonel değişiklik: `frontend` → Expo web

Şu an **varsayılan**: `frontend` klasörü **Vite + React** ile çalışır (`pnpm dev` → `vite`).

İleride web arayüzünü **mobil ile birebir aynı** (Expo Router + React Native Web) yapmak istersen, `package.json` içindeki `scripts` bölümünü aşağıdakiyle değiştirebilirsin. Böylece `frontend` içinden `pnpm dev` çalıştırınca doğrudan `mobile` projesinin web sürümü (`expo start --web`) açılır.

**Not:** Bu seçenekte `frontend/src` altındaki Vite uygulaması **kullanılmaz**; tek kaynak `mobile` olur.

## Örnek `scripts` (yalnızca referans — uygulanmadı)

```json
{
  "scripts": {
    "dev": "pnpm --dir ../mobile web",
    "start": "pnpm --dir ../mobile web",
    "build": "pnpm --dir ../mobile export --platform web",
    "lint": "pnpm --dir ../mobile typecheck",
    "preview": "pnpm --dir ../mobile web"
  }
}
```

## Gereksinimler

- Repo kökünde veya `frontend` içinden `pnpm` ile `../mobile` erişilebilir olmalı.
- `mobile` klasöründe bağımlılıklar kurulu olmalı (`pnpm install`).

## Ne zaman mantıklı?

- Web ve mobilin **tek kod tabanından** gelmesini istediğinde.
- Vite/React web katmanını sürdürmek istemediğinde.

Tarih / karar: İhtiyaç oluşunca bu dosyayı güncelleyip uygulayabilirsin.
