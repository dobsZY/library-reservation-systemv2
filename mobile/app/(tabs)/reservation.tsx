import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Reservation } from '../../types';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { onEvent, emitEvent, AppEvents } from '../../utils/events';

interface UserStats {
  totalReservations: number;
  completedReservations: number;
  cancelled: number;
  expired: number;
  noShow: number;
  participationRate: number;
}

function computeStats(reservations: Reservation[]): UserStats {
  const totalReservations = reservations.length;
  let completed = 0;
  let cancelled = 0;
  let expired = 0;
  let noShow = 0;

  for (const r of reservations) {
    switch (r.status) {
      case 'completed':
        completed++;
        break;
      case 'cancelled':
        cancelled++;
        break;
      case 'expired':
        expired++;
        break;
      case 'no_show':
        noShow++;
        break;
    }
  }

  const participationRate = totalReservations > 0 ? Math.round((completed / totalReservations) * 100) : 0;

  return { totalReservations, completedReservations: completed, cancelled, expired, noShow, participationRate };
}

function getHistoryStatusText(status: string): string {
  switch (status) {
    case 'reserved':
      return 'Aktif';
    case 'checked_in':
      return 'Check-in Yapıldı';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal Edildi';
    case 'expired':
      return 'Süresi Doldu';
    case 'no_show':
      return 'Gelmedi';
    default:
      return status;
  }
}

function getHistoryStatusColor(status: string): string {
  switch (status) {
    case 'reserved':
      return colors.warning;
    case 'checked_in':
      return colors.success;
    case 'completed':
      return colors.info;
    case 'cancelled':
      return colors.danger;
    case 'expired':
      return colors.textMuted;
    case 'no_show':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

function formatCountdownMs(remainingMs: number): string {
  const ms = Math.max(0, remainingMs);
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function ReservationScreen() {
  const router = useRouter();
  const EXTEND_REMINDER_TYPE = 'extend_reminder';
  const VACATE_SEAT_REMINDER_TYPE = 'vacate_seat_reminder';
  const QR_DEADLINE_REMINDER_TYPE = 'qr_deadline_reminder_5m';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [canExtend, setCanExtend] = useState(false);
  const [extensionBlockedByNextReservation, setExtensionBlockedByNextReservation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [timerTitle, setTimerTitle] = useState<string>('Kalan Süre');
  const [qrCheckInRemaining, setQrCheckInRemaining] = useState<string | null>(null);
  const [qrCheckInUrgent, setQrCheckInUrgent] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [cancelling, setCancelling] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalReservations: 0,
    completedReservations: 0,
    cancelled: 0,
    expired: 0,
    noShow: 0,
    participationRate: 0,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTotalMsRef = useRef<number>(0);
  const expiryEmittedRef = useRef<string | null>(null); // Sonsuz döngü önleme

  const pastReservations = history
    .filter((r) => r.status !== 'reserved' && r.status !== 'checked_in')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const pastReservationsPreview = pastReservations.slice(0, 3);

  const fetchReservation = useCallback(async () => {
    let status: any = null;
    try {
      status = await reservationsApi.getStatus();
      setHasActiveReservation(!!status?.hasActiveReservation);
      setActiveReservation(status?.activeReservation ?? null);
      setCanExtend(!!status?.canExtend);
      setExtensionBlockedByNextReservation(!!status?.extensionBlockedByNextReservation);
    } catch (error: any) {
      if (handleApiError(error)) return;
      // 404 veya boş değil, gerçek hata
      if (error?.status !== 404) {
        showAppDialog('Hata', error?.message || 'Rezervasyon bilgileri alınamadı.');
      }
      setHasActiveReservation(false);
      setActiveReservation(null);
      setCanExtend(false);
      setExtensionBlockedByNextReservation(false);
    }

    try {
      const allHistory = await reservationsApi.getHistoryAll();
      setHistory(allHistory);
      setUserStats(computeStats(allHistory));
    } catch (e: any) {
      // Geçmiş yüklenemezse aktif rezervasyon akisini bozmuyoruz.
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  const refreshExtendEligibility = useCallback(async () => {
    try {
      const status = await reservationsApi.getStatus();
      setCanExtend(!!status?.canExtend);
      setExtensionBlockedByNextReservation(!!status?.extensionBlockedByNextReservation);
    } catch {
      // Sessiz geç: buton görünürlüğü bir sonraki tam yenilemede toparlanır
    }
  }, []);

  // Tab'a her focus olunduğunda veri yenile
  useFocusEffect(
    useCallback(() => {
      fetchReservation();
    }, [fetchReservation])
  );

  useEffect(() => {
    // Event aboneliği
    const unsub = onEvent(AppEvents.RESERVATION_CHANGED, fetchReservation);
    return () => unsub();
  }, [fetchReservation]);

  useEffect(() => {
    if (!activeReservation || activeReservation.status !== 'checked_in') {
      return;
    }

    void refreshExtendEligibility();
    const interval = setInterval(() => {
      void refreshExtendEligibility();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeReservation?.id, activeReservation?.status, refreshExtendEligibility]);

  // Kalan süre ve progress bar hesaplama
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activeReservation) {
      setTimeRemaining('');
      setTimerTitle('Kalan Süre');
      setQrCheckInRemaining(null);
      setQrCheckInUrgent(false);
      setProgressPercent(0);
      countdownTotalMsRef.current = 0;
      return;
    }

    const isCheckedIn = activeReservation.status === 'checked_in' && !!activeReservation.checkedInAt;
    const startMs = new Date(activeReservation.startTime).getTime();
    const endMs = new Date(activeReservation.endTime).getTime();
    const qrDeadlineMs = activeReservation.qrDeadline
      ? new Date(activeReservation.qrDeadline).getTime()
      : startMs + 30 * 60 * 1000;

    if (!isCheckedIn && activeReservation.status === 'reserved') {
      const nowInit = Date.now();
      if (nowInit < startMs) {
        countdownTotalMsRef.current = Math.max(1, startMs - nowInit);
      }
    } else if (isCheckedIn) {
      countdownTotalMsRef.current = Math.max(1, endMs - Date.now());
    }

    const updateTimer = () => {
      const now = Date.now();

      if (isCheckedIn) {
        setTimerTitle('Kalan Süre');
        setQrCheckInRemaining(null);
        setQrCheckInUrgent(false);
        const remaining = endMs - now;
        if (remaining <= 0) {
          setTimeRemaining('Süre doldu');
          setProgressPercent(100);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        const reservationStart = new Date(activeReservation.startTime).getTime();
        const totalReservationMs = Math.max(1, endMs - reservationStart);
        const elapsedSinceStart = now - reservationStart;
        setProgressPercent(Math.min(100, Math.max(0, (elapsedSinceStart / totalReservationMs) * 100)));
        setTimeRemaining(formatCountdownMs(remaining));
        return;
      }

      if (activeReservation.status === 'reserved') {
        if (now < startMs) {
          setTimerTitle('Kalan Süre');
          setQrCheckInRemaining(null);
          setQrCheckInUrgent(false);
          const remaining = startMs - now;
          const elapsed = countdownTotalMsRef.current - remaining;
          setProgressPercent(Math.min(100, Math.max(0, (elapsed / countdownTotalMsRef.current) * 100)));
          setTimeRemaining(formatCountdownMs(remaining));
          return;
        }

        if (now < qrDeadlineMs) {
          setTimerTitle('Durum');
          setTimeRemaining('Başladı');
          const qrLeft = qrDeadlineMs - now;
          setQrCheckInRemaining(formatCountdownMs(qrLeft));
          setQrCheckInUrgent(qrLeft <= 5 * 60 * 1000);
          const qrWindowMs = Math.max(1, qrDeadlineMs - startMs);
          const elapsedInQr = now - startMs;
          setProgressPercent(Math.min(100, Math.max(0, (elapsedInQr / qrWindowMs) * 100)));
          return;
        }

        setTimerTitle('Durum');
        setTimeRemaining('QR süresi doldu');
        setQrCheckInRemaining(null);
        setQrCheckInUrgent(false);
        setProgressPercent(100);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (expiryEmittedRef.current !== activeReservation.id) {
          expiryEmittedRef.current = activeReservation.id;
          setTimeout(() => {
            emitEvent(AppEvents.RESERVATION_CHANGED);
            emitEvent(AppEvents.STATS_CHANGED);
          }, 3000);
        }
        return;
      }

      setTimerTitle('Kalan Süre');
      setQrCheckInRemaining(null);
      setQrCheckInUrgent(false);
      setTimeRemaining('');
      setProgressPercent(0);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeReservation]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const syncExtendReminderNotification = async () => {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const extendNotifications = scheduled.filter(
        (n) => (n.content.data as any)?.type === EXTEND_REMINDER_TYPE,
      );
      const vacateNotifications = scheduled.filter(
        (n) => (n.content.data as any)?.type === VACATE_SEAT_REMINDER_TYPE,
      );
      const qrDeadlineNotifications = scheduled.filter((n) => {
        const t = (n.content.data as any)?.type;
        return t === QR_DEADLINE_REMINDER_TYPE || t === 'qr_deadline_reminder_15m';
      });

      if (!activeReservation) {
        await Promise.all([
          ...extendNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
          ...vacateNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
          ...qrDeadlineNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        ]);
        return;
      }

      // QR okutma son süresine 5 dk kala hatırlatma (yalnızca RESERVED)
      if (activeReservation.status === 'reserved') {
        const now = Date.now();
        const qrDeadlineMs = activeReservation.qrDeadline
          ? new Date(activeReservation.qrDeadline).getTime()
          : new Date(activeReservation.startTime).getTime() + 30 * 60 * 1000;
        const triggerMs = qrDeadlineMs - 5 * 60 * 1000;
        const reminderKey = `${activeReservation.id}:${qrDeadlineMs}`;

        if (qrDeadlineMs <= now || triggerMs <= now) {
          await Promise.all(
            qrDeadlineNotifications.map((n) =>
              Notifications.cancelScheduledNotificationAsync(n.identifier),
            ),
          );
        } else {
          const existingSame = qrDeadlineNotifications.find(
            (n) => (n.content.data as any)?.key === reminderKey,
          );
          if (!existingSame) {
            await Promise.all(
              qrDeadlineNotifications.map((n) =>
                Notifications.cancelScheduledNotificationAsync(n.identifier),
              ),
            );
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Son 5 dakika: QR ile check-in',
                body: 'QR kodu okutmanız için son 5 dakika, lütfen check-in yapın.',
                sound: true,
                data: {
                  type: QR_DEADLINE_REMINDER_TYPE,
                  key: reminderKey,
                  route: '/(tabs)/reservation',
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(triggerMs),
              },
            });
          }
        }
      } else {
        await Promise.all(
          qrDeadlineNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
      }

      if (activeReservation.status !== 'checked_in') {
        await Promise.all(
          extendNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        await Promise.all(
          vacateNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        return;
      }

      if (activeReservation.extensionDeclinedAt) {
        await Promise.all(
          extendNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        await Promise.all(
          vacateNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        return;
      }

      const now = Date.now();
      const endMs = new Date(activeReservation.endTime).getTime();
      const triggerMs = endMs - 15 * 60 * 1000;
      const kind = extensionBlockedByNextReservation ? 'vacate' : 'extend';
      const reminderKey = `${activeReservation.id}:${activeReservation.endTime}:${kind}`;

      if (endMs <= now) {
        await Promise.all(
          extendNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        await Promise.all(
          vacateNotifications.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier),
          ),
        );
        return;
      }

      const relevantScheduled = extensionBlockedByNextReservation
        ? vacateNotifications
        : extendNotifications;
      const existingSame = relevantScheduled.find(
        (n) => (n.content.data as any)?.key === reminderKey,
      );
      if (existingSame) {
        return;
      }

      await Promise.all(
        extendNotifications.map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
      );
      await Promise.all(
        vacateNotifications.map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
      );

      const triggerDate = new Date(Math.max(now + 1000, triggerMs));
      if (extensionBlockedByNextReservation) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Rezervasyon süreniz sona eriyor',
            body:
              '15 dakika içerisinde rezervasyon süreniz sonlanacaktır. Lütfen masayı bir sonraki rezervasyon için vaktinde boşaltmaya özen gösteriniz.',
            sound: true,
            data: {
              type: VACATE_SEAT_REMINDER_TYPE,
              key: reminderKey,
              route: '/(tabs)/reservation',
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Sürenizin bitmesine 15 dakika kaldı',
            body: 'Rezervasyon sürenizi uzatmak ister misiniz?',
            sound: true,
            data: {
              type: EXTEND_REMINDER_TYPE,
              key: reminderKey,
              route: '/(tabs)/reservation',
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }
    };

    void syncExtendReminderNotification();
  }, [
    activeReservation?.id,
    activeReservation?.status,
    activeReservation?.endTime,
    activeReservation?.startTime,
    activeReservation?.qrDeadline,
    activeReservation?.extensionDeclinedAt,
    extensionBlockedByNextReservation,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservation();
  }, [fetchReservation]);

  const doCancelReservation = async () => {
    if (!activeReservation) return;
    setCancelling(true);
    try {
      await reservationsApi.cancel(activeReservation.id);
      setHasActiveReservation(false);
      setActiveReservation(null);
      emitEvent(AppEvents.RESERVATION_CHANGED);
      emitEvent(AppEvents.STATS_CHANGED);
      await fetchReservation();
      showAppDialog('Başarılı', 'Rezervasyonunuz iptal edildi.');
    } catch (e: any) {
      if (handleApiError(e)) return;
      const msg = typeof e?.message === 'string' ? e.message : 'Rezervasyon iptal edilemedi.';
      showAppDialog('Hata', msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancel = () => {
    if (!activeReservation) return;

    showAppDialog(
      'Rezervasyonu İptal Et',
      'Rezervasyonunuzu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: () => void doCancelReservation(),
        },
      ],
      'warning',
    );
  };

  const doAcknowledgeScheduledEnd = async (blockedByNext: boolean) => {
    if (!activeReservation) return;
    setEndingSession(true);
    try {
      await reservationsApi.acknowledgeScheduledEnd(activeReservation.id);
      emitEvent(AppEvents.RESERVATION_CHANGED);
      emitEvent(AppEvents.STATS_CHANGED);
      await fetchReservation();
      const infoMessage = blockedByNext
        ? 'Rezervasyonunuz Başarılı Şekilde Sonlandırıldı'
        : 'Rezervasyonunuzu uzatma talebinde bulunmadınız.Rezervasyonunuz başarıyla sonlandırılmıştır.';
      showAppDialog('Bilgi', infoMessage);
    } catch (e: any) {
      if (handleApiError(e)) return;
      const msg =
        typeof e?.message === 'string' ? e.message : 'İşlem gerçekleştirilemedi.';
      showAppDialog('Hata', msg);
    } finally {
      setEndingSession(false);
    }
  };

  const handleEndAtScheduledTime = () => {
    if (!activeReservation) return;
    const blockedByNext = extensionBlockedByNextReservation;
    showAppDialog(
      'Rezervasyonu Sonlandırmak İstediğinize Emin Misiniz?',
      '',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sonlandır',
          style: 'destructive',
          onPress: () => void doAcknowledgeScheduledEnd(blockedByNext),
        },
      ],
      'warning',
    );
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'reserved': return 'QR Bekleniyor';
      case 'checked_in': return 'Check-in Yapıldı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      case 'expired': return 'Süresi Doldu';
      case 'no_show': return 'Gelmedi';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'reserved': return colors.warning;
      case 'checked_in': return colors.success;
      case 'completed': return colors.info;
      case 'cancelled': return colors.danger;
      case 'expired': return colors.textMuted;
      case 'no_show': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const getProgressBarColor = (): string => {
    if (qrCheckInUrgent) return colors.danger;
    if (progressPercent > 85) return colors.danger;
    if (progressPercent > 60) return colors.warning;
    return colors.success;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasActiveReservation || !activeReservation) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.emptyHero}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={80} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Aktif Rezervasyon Yok</Text>
          <Text style={styles.emptySubtitle}>
            Henüz aktif bir rezervasyonunuz bulunmuyor.
          </Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/halls')}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.createButtonText}>Rezervasyon Yap</Text>
          </TouchableOpacity>
        </View>

        {/* İstatistikler + Geçmiş — üstteki padding ile aynı hizada, tam genişlik */}
        <View style={[styles.statsSection, styles.emptyMainSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart" size={18} color={colors.textSecondary} />
            <Text style={styles.sectionLabel}>Kütüphane İstatistiklerim</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{userStats.totalReservations}</Text>
              <Text style={styles.statLabel}>Toplam{'\n'}Rezervasyon</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{userStats.completedReservations}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.statNumber, { color: colors.danger }]}>{userStats.cancelled}</Text>
              <Text style={styles.statLabel}>İptal Edilen</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
              <Text style={[styles.statNumber, { color: colors.info }]}>%{userStats.participationRate}</Text>
              <Text style={styles.statLabel}>Katılım{'\n'}Oranı</Text>
            </View>
          </View>
        </View>

        <View style={[styles.historySection, styles.emptyMainSection]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle} numberOfLines={1} ellipsizeMode="tail">
              Geçmiş Rezervasyonlarım
            </Text>
          {pastReservations.length > 3 && (
            <TouchableOpacity
              style={styles.historyAllLinkWrap}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/reservation-history',
                  params: { showAll: '1' },
                })
              }
            >
              <Text style={styles.historyAllLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          )}
          </View>

          {pastReservationsPreview.length === 0 ? (
            <Text style={styles.historyEmpty}>Henüz geçmiş rezervasyon bulunmuyor.</Text>
          ) : (
            pastReservationsPreview.map((res) => (
              <View key={res.id} style={styles.historyPreviewItem}>
                <View style={styles.historyPreviewTextCol}>
                  <Text style={styles.historyPreviewTop} numberOfLines={2} ellipsizeMode="tail">
                    {res.table?.hall?.name || res.hall?.name || 'Salon'} · Masa {res.table?.tableNumber || '-'}
                  </Text>
                  <Text style={styles.historyPreviewTime}>
                    {new Date(res.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                    {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(res.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {res.status === 'cancelled' && res.cancelledReason && (
                    <Text style={styles.historyReason}>İptal nedeni: {res.cancelledReason}</Text>
                  )}
                </View>
                <View
                  style={[
                    styles.historyPreviewBadge,
                    { backgroundColor: getHistoryStatusColor(res.status) + '20' },
                  ]}
                >
                  <Text style={[styles.historyPreviewBadgeText, { color: getHistoryStatusColor(res.status) }]}>
                  {getHistoryStatusText(res.status).toLocaleUpperCase('tr-TR')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    );
  }

  const hallName = activeReservation.table?.hall?.name || activeReservation.hall?.name || '';
  const tableNumber = activeReservation.table?.tableNumber || '';
  const status = activeReservation.status;
  const isReserved = status === 'reserved';
  const isCheckedIn = status === 'checked_in';
  const showEndAtScheduledButton = isCheckedIn && !activeReservation.extensionDeclinedAt;
  const showCancelReservedButton = isReserved;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Özet Bilgi */}
      <View style={styles.summarySection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.sectionLabel}>Aktif Rezervasyon</Text>
        </View>
        
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="library" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Salon</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{hallName || '-'}</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.infoLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info }]}>
              <Ionicons name="grid" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Masa</Text>
            <Text style={styles.summaryValue}>{tableNumber || '-'}</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: getStatusColor(status) === colors.success ? colors.successLight : getStatusColor(status) === colors.warning ? colors.warningLight : colors.dangerLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: getStatusColor(status) }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Durum</Text>
            <Text style={[styles.summaryValue, { color: getStatusColor(status), fontSize: 14 }]}>
              {getStatusText(status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Rezervasyon Kartı */}
      <View style={styles.upcomingSection}>
        <View style={styles.upcomingHeader}>
          <View style={styles.upcomingLine} />
          <Text style={styles.upcomingTitle}>Rezervasyon Detayı</Text>
        </View>

        <View style={styles.reservationCard}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>
              {new Date(activeReservation.startTime).getDate()}
            </Text>
            <Text style={styles.dateMonth}>
              {new Date(activeReservation.startTime).toLocaleDateString('tr-TR', { month: 'short' })}
            </Text>
          </View>
          
          <View style={styles.reservationInfo}>
            <View style={styles.reservationHeader}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.reservationDay}>
                {new Date(activeReservation.startTime).toLocaleDateString('tr-TR', { weekday: 'long' })}
              </Text>
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Bugün</Text>
              </View>
            </View>
            <View style={styles.reservationDetails}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.reservationTime}>
                {new Date(activeReservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.reservationLocation} numberOfLines={1}>
                {hallName} - Masa {tableNumber}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Kalan Süre / Durum + QR check-in penceresi */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>{timerTitle}</Text>
        <Text
          style={[
            styles.timerValue,
            timeRemaining === 'Başladı' && styles.timerValueStarted,
            qrCheckInRemaining != null && styles.timerValueWithQrBelow,
          ]}
        >
          {timeRemaining || '--:--:--'}
        </Text>
        {qrCheckInRemaining != null && (
          <View style={styles.qrDeadlineBlock}>
            <View style={styles.timerDivider} />
            <Text style={styles.qrDeadlineHintLabel}>
              Masanıza QR ile giriş yapmak için kalan süre
            </Text>
            <Text
              style={[
                styles.qrDeadlineHintValue,
                qrCheckInUrgent && styles.qrDeadlineHintUrgent,
              ]}
            >
              {qrCheckInRemaining}
            </Text>
            <Text style={styles.qrDeadlineCaption}>
              Bu süre, QR okutarak check-in yapmanız gereken son ana kadar geri sayar.
            </Text>
          </View>
        )}
        <View style={styles.timerProgress}>
          <View style={[
            styles.timerProgressBar,
            {
              width: `${Math.min(100, progressPercent)}%`,
              backgroundColor: getProgressBarColor(),
            }
          ]} />
        </View>
      </View>

      {/* QR Check-in */}
      {isReserved && (
        <TouchableOpacity 
          style={styles.qrCard}
          onPress={() => router.push('/qr-scan')}
        >
          <Ionicons name="qr-code" size={32} color={colors.primary} />
          <View style={styles.qrInfo}>
            <Text style={styles.qrTitle}>QR Kod Tara</Text>
            <Text style={styles.qrSubtitle}>Masanıza giriş yapmak için QR kodu okutun</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Check-in yapıldı bilgisi */}
      {isCheckedIn && activeReservation.checkedInAt && (
        <View style={styles.checkedInCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <View style={styles.checkedInInfo}>
            <Text style={styles.checkedInTitle}>Check-in Yapıldı</Text>
            <Text style={styles.checkedInTime}>
              {new Date(activeReservation.checkedInAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} tarihinde giriş yapıldı
            </Text>
          </View>
        </View>
      )}

      {/* Eylem Butonları */}
      <View style={styles.actionsContainer}>
        {isCheckedIn && canExtend && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.extendButton]}
            onPress={() => {
              if (!activeReservation) return;
              showAppDialog(
                'Süre Uzat',
                'Rezervasyonunuzu 1 saat uzatmak istediğinize emin misiniz?',
                [
                  { text: 'Hayır', style: 'cancel' },
                  {
                    text: 'Evet, Uzat',
                    onPress: async () => {
                      try {
                        await reservationsApi.extend(activeReservation.id);
                        showAppDialog('Başarılı', 'Rezervasyonunuz 1 saat uzatıldı.');
                        fetchReservation();
                        emitEvent(AppEvents.RESERVATION_CHANGED);
                        emitEvent(AppEvents.STATS_CHANGED);
                      } catch (e: any) {
                        if (handleApiError(e)) return;
                        showAppDialog('Hata', e?.message || 'Uzatma yapılamadı.');
                      }
                    }
                  }
                ],
                'warning',
              );
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Süre Uzat</Text>
          </TouchableOpacity>
        )}

        {showEndAtScheduledButton && (
          <Pressable
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleEndAtScheduledTime}
            disabled={endingSession}
            hitSlop={12}
            android_ripple={{ color: 'rgba(220,38,38,0.10)' }}
          >
            {endingSession ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="stop-circle-outline" size={20} color={colors.danger} />
                <Text style={[styles.actionButtonText, { color: colors.danger }]}>Sonlandır</Text>
              </>
            )}
          </Pressable>
        )}
        {showCancelReservedButton && (
          <Pressable
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={cancelling}
            hitSlop={12}
            android_ripple={{ color: 'rgba(220,38,38,0.10)' }}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                <Text style={[styles.actionButtonText, { color: colors.danger }]}>İptal Et</Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* İstatistikler + Geçmiş (Hesabım yerine) */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={18} color={colors.textSecondary} />
          <Text style={styles.sectionLabel}>Kütüphane İstatistiklerim</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{userStats.totalReservations}</Text>
            <Text style={styles.statLabel}>Toplam{'\n'}Rezervasyon</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{userStats.completedReservations}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.dangerLight }]}>
            <Text style={[styles.statNumber, { color: colors.danger }]}>{userStats.cancelled}</Text>
            <Text style={styles.statLabel}>İptal Edilen</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
            <Text style={[styles.statNumber, { color: colors.info }]}>%{userStats.participationRate}</Text>
            <Text style={styles.statLabel}>Katılım{'\n'}Oranı</Text>
          </View>
        </View>

        <View style={{ height: spacing.md }} />

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle} numberOfLines={1} ellipsizeMode="tail">
            Geçmiş Rezervasyonlarım
          </Text>
          {pastReservations.length > 3 && (
          <TouchableOpacity
            style={styles.historyAllLinkWrap}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/reservation-history',
                params: { showAll: '1' },
              })
            }
          >
            <Text style={styles.historyAllLink}>Tümünü Gör</Text>
          </TouchableOpacity>
          )}
        </View>

        {pastReservationsPreview.length === 0 ? (
          <Text style={styles.historyEmpty}>Henüz geçmiş rezervasyon bulunmuyor.</Text>
        ) : (
          pastReservationsPreview.map((res) => (
            <View key={res.id} style={styles.historyPreviewItem}>
              <View style={styles.historyPreviewTextCol}>
                <Text style={styles.historyPreviewTop} numberOfLines={2} ellipsizeMode="tail">
                  {res.table?.hall?.name || res.hall?.name || 'Salon'} · Masa {res.table?.tableNumber || '-'}
                </Text>
                <Text style={styles.historyPreviewTime}>
                  {new Date(res.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(res.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {res.status === 'cancelled' && res.cancelledReason && (
                  <Text style={styles.historyReason}>İptal nedeni: {res.cancelledReason}</Text>
                )}
              </View>
              <View
                style={[
                  styles.historyPreviewBadge,
                  { backgroundColor: getHistoryStatusColor(res.status) + '20' },
                ]}
              >
                <Text style={[styles.historyPreviewBadgeText, { color: getHistoryStatusColor(res.status) }]}>
                  {getHistoryStatusText(res.status).toLocaleUpperCase('tr-TR')}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  emptyHero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  /** Boş rezervasyon ekranında istatistik + geçmiş, ScrollView içinde tam genişlik (Kütüphane İstatistikleri ile aynı hat) */
  emptyMainSection: {
    alignSelf: 'stretch',
    width: '100%',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
    gap: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Özet Bilgi
  summarySection: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'flex-start',
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Yaklaşan Rezervasyonlar
  upcomingSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  upcomingLine: {
    width: 4,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },

  // Rezervasyon Kartı
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  reservationInfo: {
    flex: 1,
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reservationDay: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  todayBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  reservationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  reservationTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  separator: {
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  reservationLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    flexShrink: 1,
  },

  // Timer
  timerSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  timerValueStarted: {
    letterSpacing: 0,
  },
  timerValueWithQrBelow: {
    marginBottom: spacing.sm,
  },
  qrDeadlineBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerDivider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  qrDeadlineHintLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  qrDeadlineHintValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  qrDeadlineHintUrgent: {
    color: colors.danger,
  },
  qrDeadlineCaption: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 16,
  },
  timerProgress: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgressBar: {
    height: '100%',
    borderRadius: 3,
  },

  // QR Card
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  qrInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  qrSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Checked-in info
  checkedInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
    gap: spacing.md,
  },
  checkedInInfo: {
    flex: 1,
  },
  checkedInTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  checkedInTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  extendButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },

  // İstatistikler + Geçmiş (Hesabım yerine)
  statsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: '46%',
    maxWidth: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '600',
  },

  historySection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  historyTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyAllLinkWrap: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  historyAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  historyEmpty: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  historyPreviewItem: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    width: '100%',
  },
  historyPreviewTextCol: {
    flex: 1,
    minWidth: 0,
  },
  historyPreviewTop: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyPreviewTime: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyReason: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyPreviewBadge: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  historyPreviewBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
