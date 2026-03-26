/**
 * Basit uygulama içi event emitter.
 * Ekranlar arası veri senkronizasyonu için kullanılır.
 * Örneğin rezervasyon oluşturma/iptal/check-in sonrası diğer ekranların güncellenmesi.
 */

type Listener = () => void;

const listeners: Record<string, Set<Listener>> = {};

export const AppEvents = {
  /** Rezervasyon durumu değişti (oluşturma, iptal, check-in, süre dolma) */
  RESERVATION_CHANGED: 'reservation_changed',
  /** İstatistikler güncellenmeli (salon doluluk vb.) */
  STATS_CHANGED: 'stats_changed',
  /** Oturum süresi doldu veya yetkisiz erişim (401) */
  UNAUTHORIZED: 'unauthorized',
};

export function emitEvent(event: string): void {
  const set = listeners[event];
  if (set) {
    set.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn(`Event listener error [${event}]:`, e);
      }
    });
  }
}

export function onEvent(event: string, listener: Listener): () => void {
  if (!listeners[event]) {
    listeners[event] = new Set();
  }
  listeners[event].add(listener);

  // Cleanup fonksiyonu döner - useEffect'te kullanılabilir
  return () => {
    listeners[event]?.delete(listener);
  };
}
