// Selçuk Üniversitesi Tasarım Sistemi
export const colors = {
  // Ana Renkler
  primary: '#F5C518',      // Sarı/Altın - Ana renk
  primaryLight: '#FFF8DC', // Açık sarı arka plan
  primaryDark: '#D4A816',  // Koyu sarı
  
  // Durum Renkleri
  success: '#22C55E',      // Yeşil - Başarı/Aktif
  successLight: '#DCFCE7', // Açık yeşil arka plan
  successDark: '#16A34A',
  
  warning: '#F59E0B',      // Turuncu - Uyarı
  warningLight: '#FEF3C7',
  
  danger: '#EF4444',       // Kırmızı - Hata/Dolu
  dangerLight: '#FEE2E2',
  
  info: '#3B82F6',         // Mavi - Bilgi
  infoLight: '#DBEAFE',
  
  // Nötr Renkler
  white: '#FFFFFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  border: '#E5E7EB',
  
  // Metin Renkleri
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Özel Renkler
  available: '#22C55E',    // Boş masa
  occupied: '#EF4444',     // Dolu masa
  reserved: '#F59E0B',     // Rezerve masa
  maintenance: '#9CA3AF',  // Bakımda
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

