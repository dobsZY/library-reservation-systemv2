import { router } from 'expo-router';
import { ApiError } from '../api/client';
import { showAppDialog } from './appDialogController';

/**
 * Re-entrance guard: eş zamanlı birden fazla 401 yanıtında
 * tekrarlayan alert ve yönlendirmeyi önler.
 */
let isHandling = false;

/**
 * Ortak API hata yönetimi.
 * 401 durumunda oturumun düştüğünü varsayarak kullanıcıyı login ekranına yönlendirir.
 * Hata 401 ise true, değilse false döner.
 */
export function handleApiError(error: any): boolean {
  const message: string | undefined = error?.message;

  const isUnauthorized =
    (error instanceof ApiError && error.status === 401) ||
    (typeof message === 'string' && message.includes('Oturum süreniz sona erdi'));

  if (!isUnauthorized) {
    return false;
  }

  // Zaten bir 401 işleniyor ise tekrar alert gösterme
  if (isHandling) {
    return true;
  }
  isHandling = true;

  showAppDialog(
    'Oturum Süresi Doldu',
    'Oturum süreniz sona erdi. Lütfen tekrar giriş yapın.',
    [
      {
        text: 'Tamam',
        onPress: () => {
          // Tüm stack'i temizleyip login ekranına dön
          router.replace('/login');
          // Kısa bir süre sonra guard'ı sıfırla (yeni oturum açıldıktan sonra tekrar çalışabilmesi için)
          setTimeout(() => { isHandling = false; }, 1000);
        },
      },
    ],
    'danger',
  );

  return true;
}

