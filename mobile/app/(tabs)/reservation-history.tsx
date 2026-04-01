import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '../../types';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

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

  const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
  const [toDate, setToDate] = useState<string>(''); // YYYY-MM-DD
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
    if (!fromDate && !toDate) return pastReservations;

    return pastReservations.filter((r) => {
      const d = new Date(r.startTime);
      const ymd = ymdLocal(d);

      if (fromDate && ymd < fromDate) return false;
      if (toDate && ymd > toDate) return false;
      return true;
    });
  }, [pastReservations, fromDate, toDate]);

  const displayed = useMemo(() => {
    if (showAll) return filtered;
    return filtered.slice(0, 3);
  }, [filtered, showAll]);

  const showAllBtnVisible = !showAll && filtered.length > 3;

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    // "Tümünü Gör" modundayken filtreleme yine de tüm kayıtları etkilemeli.
    // Bu yüzden showAll durumunu sıfırlamıyoruz.
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

        <View style={styles.filterRow}>
          <TextInput
            style={styles.input}
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="Başlangıç (YYYY-MM-DD)"
            autoCapitalize="none"
            keyboardType="default"
          />
          <TextInput
            style={styles.input}
            value={toDate}
            onChangeText={setToDate}
            placeholder="Bitiş (YYYY-MM-DD)"
            autoCapitalize="none"
            keyboardType="default"
          />
        </View>

        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => {}}>
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
          <Text style={styles.emptyText}>Bu tarihte rezervasyon bulunamadı.</Text>
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
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
  },
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

