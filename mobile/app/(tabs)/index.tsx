import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Hall, Reservation } from '../../types';
import { hallsApi, statisticsApi, OverallStatistics } from '../../api/halls';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { onEvent, emitEvent, AppEvents } from '../../utils/events';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<OverallStatistics | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryEmittedRef = useRef<string | null>(null); // Hangi rezervasyon için süre doldu emiti yapıldığını takip et

  const fetchData = useCallback(async () => {
    try {
      const [overall, hallsList, status] = await Promise.all([
        statisticsApi.getOverallOccupancy(),
        hallsApi.getAll(),
        reservationsApi.getStatus().catch(() => null),
      ]);

      setStats(overall);
      setHalls(hallsList);
      setHasActiveReservation(!!status?.hasActiveReservation);
      setActiveReservation(status?.activeReservation ?? null);
    } catch (error: any) {
      if (handleApiError(error)) return;
      console.warn('Ana sayfa verileri alınamadı:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tab'a her focus olunduğunda veri yenile (stale data önleme)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    // Her 30 saniyede otomatik yenile
    const interval = setInterval(fetchData, 30000);
    // Event aboneliği: rezervasyon veya istatistik değişince yenile
    const unsub1 = onEvent(AppEvents.RESERVATION_CHANGED, fetchData);
    const unsub2 = onEvent(AppEvents.STATS_CHANGED, fetchData);
    return () => {
      clearInterval(interval);
      unsub1();
      unsub2();
    };
  }, [fetchData]);

  // Kalan süre sayacı
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activeReservation) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(activeReservation.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Süre doldu');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Süre dolduğunda sadece bir kez veriyi yenile (sonsuz döngü önleme)
        if (expiryEmittedRef.current !== activeReservation.id) {
          expiryEmittedRef.current = activeReservation.id;
          setTimeout(() => {
            emitEvent(AppEvents.RESERVATION_CHANGED);
          }, 3000);
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

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
    fetchData();
  }, [fetchData]);

  const doCancelReservation = async () => {
    if (!activeReservation) return;
    setCancelling(true);
    try {
      await reservationsApi.cancel(activeReservation.id);
      setHasActiveReservation(false);
      setActiveReservation(null);
      emitEvent(AppEvents.RESERVATION_CHANGED);
      emitEvent(AppEvents.STATS_CHANGED);
      await fetchData();
      showAppDialog('Başarılı', 'Rezervasyonunuz iptal edildi.');
    } catch (e: any) {
      if (handleApiError(e)) return;
      const msg = typeof e?.message === 'string' ? e.message : 'Rezervasyon iptal edilemedi.';
      showAppDialog('Hata', msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelReservation = () => {
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

  const handleQrPress = () => {
    if (activeReservation && activeReservation.status === 'reserved') {
      router.push('/qr-scan');
    } else if (activeReservation) {
      showAppDialog('Bilgi', 'Check-in zaten yapılmış veya uygun değil.');
    } else {
      showAppDialog('Bilgi', 'Aktif bir rezervasyonunuz bulunmuyor. Önce rezervasyon yapın.');
    }
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
      default: return colors.textMuted;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const availableTables = stats?.availableTables ?? 0;
  const occupancyRate = stats?.overallOccupancyRate ?? 0;
  const activeReservationsCount = stats?.activeReservations ?? 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Özet Bilgi Kartları */}
      <View style={styles.summarySection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.sectionLabel}>Özet Bilgi</Text>
        </View>
        
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Boş Masa</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {availableTables}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.infoLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info }]}>
              <Ionicons name="calendar" size={20} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Rezervasyon</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {activeReservationsCount}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.dangerLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.danger }]}>
              <Ionicons name="pie-chart" size={20} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Doluluk</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              %{Math.round(occupancyRate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Hızlı Rezervasyon */}
      {!activeReservation && (
        <TouchableOpacity 
          style={styles.quickReserveButton}
          onPress={() => router.push('/halls')}
          activeOpacity={0.8}
        >
          <View style={styles.quickReserveIcon}>
            <Ionicons name="add-circle" size={24} color={colors.success} />
          </View>
          <Text style={styles.quickReserveText}>Hızlı Rezervasyon Yap</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.success} />
        </TouchableOpacity>
      )}

      {/* Aktif Rezervasyon Kartı */}
      {hasActiveReservation && activeReservation && (
        <View style={styles.activeReservation}>
          <View style={styles.activeHeader}>
            <View style={[styles.activeDot, { backgroundColor: getStatusColor(activeReservation.status) }]} />
            <Text style={[styles.activeLabel, { color: getStatusColor(activeReservation.status) }]}>
              {activeReservation.status === 'checked_in' ? 'CHECK-IN YAPILDI' : 'ŞU ANDA AKTİF'}
            </Text>
          </View>
          <View style={styles.activeContent}>
            <View style={styles.activeIconBox}>
              <Ionicons name="library" size={24} color={colors.success} />
            </View>
            <View style={styles.activeInfo}>
              <Text style={styles.activeTitle}>
                {activeReservation.table?.hall?.name || activeReservation.hall?.name || 'Salon'} - Masa {activeReservation.table?.tableNumber || '-'}
              </Text>
              <Text style={styles.activeSubtitle}>
                {getStatusText(activeReservation.status)}
              </Text>
            </View>
          </View>
          <View style={styles.activeTimeRow}>
            <View style={styles.activeTimeItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.activeTimeText}>
                {new Date(activeReservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {timeRemaining ? (
              <View style={styles.activeTimeItem}>
                <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
                <Text style={[styles.activeTimeText, { color: colors.warning }]}>{timeRemaining}</Text>
              </View>
            ) : null}
          </View>

          {/* QR Check-in butonu */}
          {activeReservation.status === 'reserved' && (
            <TouchableOpacity
              style={styles.qrCheckinButton}
              onPress={() => router.push('/qr-scan')}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code" size={18} color={colors.primary} />
              <Text style={styles.qrCheckinText}>QR ile Giriş Yap</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}

          <Pressable
            style={styles.activeButton}
            onPress={handleCancelReservation}
            disabled={cancelling}
            hitSlop={12}
            android_ripple={{ color: 'rgba(220,38,38,0.10)' }}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.activeButtonText}>Rezervasyonu İptal Et</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Salonlar */}
      <View style={styles.hallsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Salonlar</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Müsait</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.legendText}>Yoğun</Text>
            </View>
          </View>
        </View>

        {halls.map((hall) => {
          // İstatistiklerde bu salona ait bilgiyi bul
          const hallOcc = stats?.hallsOccupancy?.find(h => h.hallId === hall.id);
          return (
            <TouchableOpacity 
              key={hall.id}
              style={styles.hallCard}
              onPress={() => router.push(`/hall/${hall.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.hallInfo}>
                <View style={styles.hallIconContainer}>
                  <Ionicons name="library" size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.hallDetails}>
                  <Text style={styles.hallName}>{hall.name}</Text>
                  {hall.description ? (
                    <Text style={styles.hallDescription}>{hall.description}</Text>
                  ) : null}
                  <Text style={styles.hallFloor}>{hall.floor}. Kat</Text>
                </View>
              </View>
              
              {hallOcc ? (
                <View style={styles.hallStats}>
                  <View style={[
                    styles.occupancyBadge,
                    { backgroundColor: hallOcc.occupancyRate < 50 ? colors.successLight : hallOcc.occupancyRate < 80 ? colors.warningLight : colors.dangerLight }
                  ]}>
                    <Text style={[
                      styles.occupancyText,
                      { color: hallOcc.occupancyRate < 50 ? colors.success : hallOcc.occupancyRate < 80 ? colors.warning : colors.danger }
                    ]}>
                      %{Math.round(hallOcc.occupancyRate)}
                    </Text>
                  </View>
                  <Text style={styles.availableText}>
                    {hallOcc.availableTables}/{hallOcc.totalTables} boş
                  </Text>
                </View>
              ) : null}
              
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
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
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  // Hızlı Rezervasyon
  quickReserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success,
    marginBottom: spacing.lg,
  },
  quickReserveIcon: {
    marginRight: spacing.md,
  },
  quickReserveText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },

  // Salonlar
  hallsSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  hallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  hallInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hallIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  hallDetails: {
    flex: 1,
  },
  hallName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hallDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hallFloor: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  hallStats: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  occupancyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  occupancyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  availableText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  // QR Button
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  qrIconContainer: {
    marginRight: spacing.md,
  },
  qrTextContainer: {
    flex: 1,
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

  // Aktif Rezervasyon
  activeReservation: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.success,
    ...shadows.md,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activeIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activeInfo: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  activeTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTimeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  qrCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  qrCheckinText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
});
