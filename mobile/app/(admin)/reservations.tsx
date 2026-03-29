import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminReservation } from '../../api/admin';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';

const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Tamamlanan' },
  { key: 'cancelled', label: 'İptal' },
  { key: 'expired', label: 'Süresi Dolmuş' },
];

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  reserved: { bg: '#DBEAFE', fg: '#2563EB' },
  checked_in: { bg: '#DCFCE7', fg: '#16A34A' },
  completed: { bg: '#F3F4F6', fg: '#6B7280' },
  cancelled: { bg: '#FEE2E2', fg: '#DC2626' },
  expired: { bg: '#F3F4F6', fg: '#9CA3AF' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminReservationsScreen() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await adminApi.getReservations(filter || undefined);
      setReservations(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Rezervasyonlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchReservations();
  }, [fetchReservations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = (res: AdminReservation) => {
    const isActive =
      res.status === 'reserved' || res.status === 'checked_in';

    if (!isActive) {
      showAppDialog('Bilgi', 'Bu rezervasyon iptal edilemez.');
      return;
    }

    const message = `${res.user?.fullName || res.userId} – ${res.hall?.name || ''} ${res.table?.tableNumber || ''}\n${formatDate(res.startTime)} ${formatTime(res.startTime)}–${formatTime(res.endTime)}\n\nBu rezervasyonu iptal etmek istediğinize emin misiniz?`;

    const doCancel = async () => {
      setCancelLoading(res.id);
      try {
        await adminApi.cancelReservation(res.id);
        showAppDialog('Başarılı', 'Rezervasyon iptal edildi.');
        fetchReservations();
      } catch (e: any) {
        if (handleApiError(e)) return;
        showAppDialog('Hata', e?.message || 'İşlem başarısız.');
      } finally {
        setCancelLoading(null);
      }
    };

    showAppDialog(
      'Rezervasyonu İptal Et',
      message,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: () => void doCancel(),
        },
      ],
      'warning',
    );
  };

  const renderItem = ({ item }: { item: AdminReservation }) => {
    // UI'da no_show ve expired'i tek kategori gibi gösteriyoruz.
    const displayStatus = item.status === 'no_show' ? 'expired' : item.status;
    const isAdminCancelled =
      item.status === 'cancelled' &&
      typeof item.cancelledReason === 'string' &&
      item.cancelledReason.toLowerCase().includes('yönetici');
    const sc = STATUS_COLORS[displayStatus] || STATUS_COLORS.expired;
    const isCancelable =
      item.status === 'reserved' || item.status === 'checked_in';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardName}>{item.user?.fullName || '—'}</Text>
            <Text style={styles.cardSub}>{item.user?.studentNumber || ''}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.fg }]}>
              {isAdminCancelled ? 'İPTAL (ADMIN)' : displayStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detail}>{item.hall?.name || '—'} · Masa {item.table?.tableNumber || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detail}>
            {formatDate(item.startTime)} {formatTime(item.startTime)}–{formatTime(item.endTime)}
          </Text>
        </View>

        {isCancelable && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item)}
            disabled={cancelLoading === item.id}
          >
            {cancelLoading === item.id ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.cancelText}>İptal Et</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Rezervasyon bulunamadı</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: { maxHeight: 52, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  filterChipActive: { backgroundColor: '#DC2626' },
  filterLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filterLabelActive: { color: '#fff', fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detail: { fontSize: 13, color: colors.textSecondary },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  cancelText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.md },
});
