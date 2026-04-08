import { Alert } from 'react-native';
import { colors } from '../constants/theme';

export type AppDialogButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppDialogButton = {
  text: string;
  style?: AppDialogButtonStyle;
  onPress?: () => void;
};

export type AppDialogTone = 'default' | 'danger' | 'success' | 'warning' | 'info';

export type ShowAppDialogArgs = {
  title: string;
  message?: string;
  buttons?: AppDialogButton[];
  tone?: AppDialogTone;
};

type ShowFn = (args: ShowAppDialogArgs) => void;

let showImpl: ShowFn | null = null;

export function registerAppDialogHost(fn: ShowFn | null) {
  showImpl = fn;
}

/** Başlık / içeriğe göre uygun vurgu rengi (isteğe bağlı `tone` ile geçersiz kılınabilir) */
export function inferDialogTone(title: string, message?: string): AppDialogTone {
  const t = title.trim().toLowerCase();
  const combined = `${title} ${message ?? ''}`.toLowerCase();
  if (t === 'hata' || combined.includes('oturum süreniz') || t.includes('oturum süresi')) return 'danger';
  if (t.startsWith('başarılı') || combined.includes('başarıyla')) return 'success';
  if (t === 'uyarı') return 'warning';
  if (t === 'bilgi') return 'info';
  if (/iptal|çıkış|sonlandır/i.test(title) && /emin/i.test(combined)) return 'warning';
  return 'default';
}

export function toneAccentColor(tone: AppDialogTone): string {
  switch (tone) {
    case 'danger':
      return colors.danger;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'info':
      return colors.info;
    default:
      return colors.primary;
  }
}

/**
 * Uygulama temalı diyalog. `AppDialogHost` kökte yoksa `Alert.alert` ile geri döner.
 * İmza `Alert.alert` ile uyumludur: (title, message?, buttons?)
 */
export function showAppDialog(
  title: string,
  message?: string,
  buttons?: AppDialogButton[],
  toneOverride?: AppDialogTone,
): void {
  const tone = toneOverride ?? inferDialogTone(title, message);
  const finalButtons =
    buttons && buttons.length > 0 ? buttons : [{ text: 'Tamam' as const }];

  if (showImpl) {
    showImpl({
      title,
      message: message ?? '',
      buttons: finalButtons,
      tone,
    });
    return;
  }

  Alert.alert(title, message ?? '', finalButtons);
}
