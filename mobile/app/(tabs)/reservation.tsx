import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Reservation } from '../../types';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
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

export default function ReservationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [cancelling, setCancelling] = useState(false);
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
  const expiryEmittedRef = useRef<string | null>(null); // Sonsuz döngü önleme

  const pastReservations = history
    .filter((r) => r.status !== 'reserved' && r.status !== 'checked_in')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const pastReservationsPreview = pastReservations.slice(0, 4);

  const fetchReservation = useCallback(async () => {
    let status: any = null;
    try {
      status = await reservationsApi.getStatus();
      setHasActiveReservation(!!status?.hasActiveReservation);
      setActiveReservation(status?.activeReservation ?? null);
    } catch (error: any) {
      if (handleApiError(error)) return;
      // 404 veya boş değil, gerçek hata
      if (error?.status !== 404) {
        Alert.alert('Hata', error?.message || 'Rezervasyon bilgileri alınamadı.');
      }
      setHasActiveReservation(false);
      setActiveReservation(null);
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

  // Kalan süre ve progress bar hesaplama
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activeReservation) {
      setTimeRemaining('');
      setProgressPercent(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(activeReservation.startTime);
      const end = new Date(activeReservation.endTime);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const remaining = end.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining('Süre doldu');
        setProgressPercent(100);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Süre dolduğunda sadece bir kez veriyi yenile (sonsuz döngü önleme)
        if (activeReservation && expiryEmittedRef.current !== activeReservation.id) {
          expiryEmittedRef.current = activeReservation.id;
          setTimeout(() => {
            emitEvent(AppEvents.RESERVATION_CHANGED);
            emitEvent(AppEvents.STATS_CHANGED);
          }, 3000);
        }
        return;
      }

      // Yüzde hesapla (elapsed / total)
      const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgressPercent(pct);

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeReservation]);

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
      if (Platform.OS === 'web') {
        window.alert('Rezervasyonunuz iptal edildi.');
      } else {
        Alert.alert('Başarılı', 'Rezervasyonunuz iptal edildi.');
      }
    } catch (e: any) {
      if (handleApiError(e)) return;
      const msg = typeof e?.message === 'string' ? e.message : 'Rezervasyon iptal edilemedi.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Hata', msg);
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleCancel = () => {
    if (!activeReservation) return;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Rezervasyonunuzu iptal etmek istediğinize emin misiniz?')) {
        void doCancelReservation();
      }
      return;
    }

    Alert.alert(
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

        {/* İstatistikler + Geçmiş (Hesabım yerine Rezervasyonlarım) */}
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
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Geçmiş Rezervasyonlarım</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reservation-history')}>
                  <Text style={styles.historyAllLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {pastReservationsPreview.length === 0 ? (
            <Text style={styles.historyEmpty}>Henüz geçmiş rezervasyon bulunmuyor.</Text>
          ) : (
            pastReservationsPreview.map((res) => (
              <View key={res.id} style={styles.historyPreviewItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyPreviewTop}>
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
                    {getHistoryStatusText(res.status).toUpperCase()}
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

      {/* Kalan Süre */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>Kalan Süre</Text>
        <Text style={styles.timerValue}>{timeRemaining || '--:--:--'}</Text>
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
        {isCheckedIn && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.extendButton]}
            onPress={() => {
              if (!activeReservation) return;
              Alert.alert(
                'Süre Uzat',
                'Rezervasyonunuzu 1 saat uzatmak istediğinize emin misiniz?',
                [
                  { text: 'Hayır', style: 'cancel' },
                  {
                    text: 'Evet, Uzat',
                    onPress: async () => {
                      try {
                        await reservationsApi.extend(activeReservation.id);
                        Alert.alert('Başarılı', 'Rezervasyonunuz 1 saat uzatıldı.');
                        fetchReservation();
                        emitEvent(AppEvents.RESERVATION_CHANGED);
                        emitEvent(AppEvents.STATS_CHANGED);
                      } catch (e: any) {
                        if (handleApiError(e)) return;
                        Alert.alert('Hata', e?.message || 'Uzatma yapılamadı.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Süre Uzat</Text>
          </TouchableOpacity>
        )}

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
          <Text style={styles.historyTitle}>Geçmiş Rezervasyonlarım</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reservation-history')}>
            <Text style={styles.historyAllLink}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {pastReservationsPreview.length === 0 ? (
          <Text style={styles.historyEmpty}>Henüz geçmiş rezervasyon bulunmuyor.</Text>
        ) : (
          pastReservationsPreview.map((res) => (
            <View key={res.id} style={styles.historyPreviewItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyPreviewTop}>
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
              <View style={[styles.historyPreviewBadge, { backgroundColor: getHistoryStatusColor(res.status) + '20' }]}>
                <Text style={[styles.historyPreviewBadgeText, { color: getHistoryStatusColor(res.status) }]}>
                  {getHistoryStatusText(res.status).toUpperCase()}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flexBasis: '47%',
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
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    textAlign: 'center',
  },
  historyEmpty: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  historyPreviewItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
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
