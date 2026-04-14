/**
 * Personel (staff) arka ofis görünümü.
 * Admin temasından ayrı dosya: personel için renk/başlık değişiklikleri admin ve öğrenci ekranlarını etkilemez.
 */
import { adminTheme } from './theme';

export const staffBackofficeTheme = {
  ...adminTheme,
  /** Üst bar / sekmelerde gösterilen panel adı */
  panelHeaderTitle: 'Personel paneli',
  /** Ana sekme kısa adı */
  panelTabLabel: 'Panel',
};
