import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '../../types';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { SingleDatePicker } from '../../components/SingleDatePicker';

function getStatusText(status: string): string {
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

function getStatusColor(status: string): string {
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

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ReservationHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Reservation[]>([]);

  /** Takvimde seçilen tarih; liste ancak "Filtrele" ile uygulanır. */
  const [pendingDate, setPendingDate] = useState<string>('');
  /** Uygulanan filtre; boşsa tüm geçmiş rezervasyonlar. */
  const [appliedFilterDate, setAppliedFilterDate] = useState<string>('');
  const params = useLocalSearchParams<{ showAll?: string }>();
  const showAllParamValue = Array.isArray((params as any)?.showAll)
    ? ((params as any)?.showAll?.[0] as string | undefined)
    : ((params as any)?.showAll as string | undefined);
  const showAllFromParams = showAllParamValue === '1' || showAllParamValue === 'true';
  const [showAll, setShowAll] = useState<boolean>(false);

  // Expo Router bazen parametreleri ilk render’da vermeyebiliyor; buna karşılık
  // parametre değişince state'i güncelliyoruz.
  useEffect(() => {
    setShowAll(showAllFromParams);
  }, [showAllFromParams]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await reservationsApi.getHistoryAll();
      setHistory(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      Alert.alert('Hata', e?.message || 'Geçmiş yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const pastReservations = useMemo(() => {
    return history
      .filter((r) => r.status !== 'reserved' && r.status !== 'checked_in')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [history]);

  const filtered = useMemo(() => {
    if (!appliedFilterDate) return pastReservations;
    return pastReservations.filter((r) => ymdLocal(new Date(r.startTime)) === appliedFilterDate);
  }, [pastReservations, appliedFilterDate]);

  const displayed = useMemo(() => {
    if (showAll) return filtered;
    return filtered.slice(0, 3);
  }, [filtered, showAll]);

  const showAllBtnVisible = !showAll && filtered.length > 3;

  const applyFilter = () => {
    if (!pendingDate.trim()) {
      Alert.alert('Uyarı', 'Lütfen önce bir tarih seçin.');
      return;
    }
    setAppliedFilterDate(pendingDate);
  };

  const resetFilters = () => {
    setPendingDate('');
    setAppliedFilterDate('');
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const sc = getStatusColor(item.status);
    return (
      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleWrap}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.table?.hall?.name || item.hall?.name || 'Salon'} - Masa {item.table?.tableNumber || '-'}
            </Text>
            <Text style={styles.itemTime}>
              {new Date(item.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
              {new Date(item.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(item.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: sc + '20' }]}>
            <Text style={[styles.badgeText, { color: sc }]}>
              {getStatusText(item.status).toLocaleUpperCase('tr-TR')}
            </Text>
          </View>
        </View>

        {item.status === 'cancelled' && item.cancelledReason && (
          <Text style={styles.reason}>İptal nedeni: {item.cancelledReason}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Tarih Filtreleme</Text>

        <SingleDatePicker
          label="Rezervasyon tarihi"
          value={pendingDate}
          onChange={setPendingDate}
          placeholder="Tarih Seçiniz"
        />

        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
            <Text style={styles.applyBtnText}>Filtrele</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
            <Text style={styles.clearBtnText}>Temizle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.countText}>
          Gösterilen: {displayed.length} / {filtered.length}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {pastReservations.length === 0
              ? 'Henüz geçmiş rezervasyon bulunmuyor.'
              : 'Seçilen tarihe ait rezervasyon kaydı bulunmamaktadır'}
          </Text>
        </View>
      ) : (
        <>
          {showAllBtnVisible && (
            <TouchableOpacity style={styles.showAllBtn} onPress={() => setShowAll(true)}>
              <Text style={styles.showAllBtnText}>Tümünü Gör</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={displayed}
            keyExtractor={(r) => r.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </>
      )}
      </ScrollView>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push('/(tabs)/reservation')}
        activeOpacity={0.9}
      >
        <Ionicons name="chevron-back" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 140 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

  filterCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  filterTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  filterActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  applyBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  clearBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  countText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 12 },

  showAllBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  showAllBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },

  backBtn: {
    position: 'absolute',
    left: spacing.lg,
    bottom: 58, // tab bar üstüne daha yakın
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },

  item: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemTitleWrap: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemTime: { marginTop: 4, fontSize: 12, color: colors.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  reason: { marginTop: 10, fontSize: 12, color: colors.textSecondary },

  empty: { marginTop: spacing.lg, alignItems: 'center' },
  emptyText: { marginTop: spacing.sm, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});

