import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { adminApi, AdminReservation } from '../../api/admin';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { SingleDatePicker } from '../../components/SingleDatePicker';

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
  cancelled: { bg: adminTheme.primaryLight, fg: adminTheme.primary },
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
  const { filter: routeFilter } = useLocalSearchParams<{ filter?: string }>();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [studentNumberQuery, setStudentNumberQuery] = useState('');
  const [fullNameQuery, setFullNameQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    if (typeof routeFilter !== 'string') return;
    const isValidFilter = FILTERS.some((f) => f.key === routeFilter);
    if (isValidFilter) {
      setFilter(routeFilter);
    }
  }, [routeFilter]);

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

  const filteredReservations = useMemo(() => {
    const studentNumber = studentNumberQuery.trim().toLowerCase();
    const fullName = fullNameQuery.trim().toLocaleLowerCase('tr-TR');
    const dateText = dateQuery.trim().toLowerCase();

    return reservations.filter((item) => {
      const itemStudentNumber = (item.user?.studentNumber || '').toLowerCase();
      const itemFullName = (item.user?.fullName || '').toLocaleLowerCase('tr-TR');
      const formattedDate = formatDate(item.startTime).toLowerCase();
      const isoDate = item.startTime ? item.startTime.slice(0, 10).toLowerCase() : '';

      const studentOk = !studentNumber || itemStudentNumber.includes(studentNumber);
      const fullNameOk = !fullName || itemFullName.includes(fullName);
      const dateOk = !dateText || formattedDate.includes(dateText) || isoDate.includes(dateText);

      return studentOk && fullNameOk && dateOk;
    });
  }, [dateQuery, fullNameQuery, reservations, studentNumberQuery]);

  const clearSearchFilters = () => {
    setStudentNumberQuery('');
    setFullNameQuery('');
    setDateQuery('');
  };

  const handleCancel = (res: AdminReservation) => {
    const isActive =
      res.status === 'reserved' || res.status === 'checked_in';

    if (!isActive) {
      Alert.alert('Bilgi', 'Bu rezervasyon iptal edilemez.');
      return;
    }

    const message = `${res.user?.fullName || res.userId} – ${res.hall?.name || ''} ${res.table?.tableNumber || ''}\n${formatDate(res.startTime)} ${formatTime(res.startTime)}–${formatTime(res.endTime)}\n\nBu rezervasyonu iptal etmek istediğinize emin misiniz?`;

    const doCancel = async () => {
      setCancelLoading(res.id);
      try {
        await adminApi.cancelReservation(res.id);
        Alert.alert('Başarılı', 'Rezervasyon iptal edildi.');
        fetchReservations();
      } catch (e: any) {
        if (handleApiError(e)) return;
        Alert.alert('Hata', e?.message || 'İşlem başarısız.');
      } finally {
        setCancelLoading(null);
      }
    };

    Alert.alert('Rezervasyonu İptal Et', message, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'İptal Et',
        style: 'destructive',
        onPress: () => void doCancel(),
      },
    ]);
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
              <ActivityIndicator size="small" color={adminTheme.primary} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={16} color={adminTheme.primary} />
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
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                numberOfLines={1}
                style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={adminTheme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[adminTheme.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Rezervasyon bulunamadı</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.searchFab}
        activeOpacity={0.85}
        onPress={() => setIsSearchModalOpen(true)}
      >
        <Ionicons name="search" size={22} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={isSearchModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSearchModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            activeOpacity={1}
            onPress={() => setIsSearchModalOpen(false)}
          />
          <View style={styles.searchModalCard}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Filtreleme / Arama</Text>
              <TouchableOpacity onPress={() => setIsSearchModalOpen(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={studentNumberQuery}
              onChangeText={setStudentNumberQuery}
              placeholder="Öğrenci no ile ara"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
            <TextInput
              value={fullNameQuery}
              onChangeText={setFullNameQuery}
              placeholder="Ad soyad ile ara"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
            <SingleDatePicker
              label="Rezervasyon Tarihi"
              value={dateQuery}
              onChange={setDateQuery}
              placeholder="Tarih ile ara"
            />
            {dateQuery ? (
              <TouchableOpacity
                onPress={() => setDateQuery('')}
                style={styles.resetDateBtn}
              >
                <Ionicons name="calendar-clear-outline" size={16} color={colors.warning} />
                <Text style={styles.resetDateText}>Tarihi Sıfırla</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.searchModalActions}>
              <TouchableOpacity onPress={clearSearchFilters} style={styles.clearFiltersBtn}>
                <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.clearFiltersText}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsSearchModalOpen(false)}
                style={styles.applyFiltersBtn}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                <Text style={styles.applyFiltersText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Filtre bar yüksekliği sabit kalsın (seçimde fontWeight değişse bile).
  filterBar: {
    height: 52,
    minHeight: 52,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 0,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 32,
    paddingVertical: 0,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: adminTheme.primary },
  filterLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dangerLight,
  },
  clearFiltersText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.danger,
    includeFontPadding: false,
  },
  resetDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warningLight,
  },
  resetDateText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.warning,
    includeFontPadding: false,
  },
  applyFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  applyFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  list: { padding: spacing.lg, paddingBottom: 110 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  searchModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  searchModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
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
    backgroundColor: adminTheme.primaryLight,
  },
  cancelText: { fontSize: 13, fontWeight: '600', color: adminTheme.primary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.md },
});
