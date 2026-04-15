import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  adminApi,
  AdminSpecialPeriod,
} from '../../api/admin';
import {
  adminTheme,
  colors,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { SingleDatePicker } from '../../components/SingleDatePicker';

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  startDate: '',
  endDate: '',
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminSpecialPeriodsScreen() {
  const [items, setItems] = useState<AdminSpecialPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const minStartDate = useMemo(() => todayYmd(), []);
  const minEndDate = form.startDate && form.startDate > minStartDate ? form.startDate : minStartDate;

  const fetchPeriods = useCallback(async () => {
    try {
      const data = await adminApi.getSpecialPeriods();
      setItems(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Özel dönemler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPeriods();
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const onChangeStartDate = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, startDate: value };
      if (next.endDate && next.endDate < value) {
        next.endDate = value;
      }
      return next;
    });
  };

  const onChangeEndDate = (value: string) => {
    setForm((prev) => ({ ...prev, endDate: value }));
  };

  const createPeriod = async () => {
    const name = form.name.trim();
    const startDate = form.startDate.trim();
    const endDate = form.endDate.trim();

    if (!name || !startDate || !endDate) {
      showAppDialog('Eksik Bilgi', 'Dönem adı, başlangıç tarihi ve bitiş tarihi zorunludur.');
      return;
    }

    if (endDate < startDate) {
      showAppDialog('Geçersiz Tarih', 'Bitiş tarihi, başlangıç tarihinden önce olamaz.');
      return;
    }

    setSaving(true);
    try {
      await adminApi.createSpecialPeriod({
        name,
        startDate,
        endDate,
        is24h: true,
        openingTime: '00:00',
        closingTime: '23:59',
        priority: 100,
        rules: {
          allowAdvanceBooking: true,
          maxAdvanceDays: 1,
        },
      });
      resetForm();
      await fetchPeriods();
      showAppDialog('Başarılı', 'Özel Takvim oluşturuldu.');
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Özel Takvim oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const togglePeriod = async (item: AdminSpecialPeriod) => {
    try {
      await adminApi.toggleSpecialPeriodStatus(item.id, !item.isActive);
      await fetchPeriods();
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Durum güncellenemedi.');
    }
  };

  const askDeletePeriod = (item: AdminSpecialPeriod) => {
    showAppDialog(
      'Özel Takvimi Sil',
      `"${item.name}" takvimini silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void deletePeriod(item);
          },
        },
      ],
      'warning',
    );
  };

  const deletePeriod = async (item: AdminSpecialPeriod) => {
    try {
      await adminApi.deleteSpecialPeriod(item.id);
      await fetchPeriods();
      showAppDialog('Başarılı', 'Özel Takvim silindi.');
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Özel Takvim silinemedi.');
    }
  };

  const renderItem = ({ item }: { item: AdminSpecialPeriod }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
            <Text style={styles.cardMeta}>
              7/24 · İleri rezervasyon: {item.rules?.maxAdvanceDays ?? 1} gün
            </Text>
          </View>
          <View
            style={[
              styles.stateBadge,
              item.isActive ? styles.stateBadgeActive : styles.stateBadgePassive,
            ]}
          >
            <Text
              style={[
                styles.stateBadgeText,
                item.isActive ? styles.stateBadgeTextActive : styles.stateBadgeTextPassive,
              ]}
            >
              {item.isActive ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => togglePeriod(item)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={item.isActive ? 'pause-circle-outline' : 'checkmark-circle-outline'}
              size={16}
              color={adminTheme.primary}
            />
            <Text style={styles.toggleBtnText}>
              {item.isActive ? 'Pasife Al' : 'Aktif Et'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteIconBtn}
            onPress={() => askDeletePeriod(item)}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Yeni Takvim</Text>
        <TextInput
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
          placeholder="Dönem adı"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <View style={styles.datePickerStack}>
          <SingleDatePicker
            label="Başlangıç Tarihi"
            value={form.startDate}
            onChange={onChangeStartDate}
            placeholder="Başlangıç Seçin"
            minDate={minStartDate}
            accent="student"
          />
          <SingleDatePicker
            label="Bitiş Tarihi"
            value={form.endDate}
            onChange={onChangeEndDate}
            placeholder="Bitiş Seçin"
            minDate={minEndDate}
            accent="student"
          />
        </View>
        <TouchableOpacity
          style={[styles.createBtn, saving && styles.createBtnDisabled]}
          onPress={() => void createPeriod()}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={16} color={colors.white} />
              <Text style={styles.createBtnText}>Takvim Ekle</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={adminTheme.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[adminTheme.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-clear-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Tanımlı Takvim Yok</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 42,
    borderWidth: 0,
    borderRadius: borderRadius.xl,
    backgroundColor: '#E8EDF3',
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  datePickerStack: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  createBtn: {
    marginTop: spacing.xs,
    minHeight: 42,
    borderRadius: borderRadius.full,
    backgroundColor: adminTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  createBtnDisabled: {
    opacity: 0.7,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  stateBadgeActive: {
    backgroundColor: colors.successLight,
  },
  stateBadgePassive: {
    backgroundColor: adminTheme.primaryLight,
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stateBadgeTextActive: {
    color: colors.successDark,
  },
  stateBadgeTextPassive: {
    color: adminTheme.primary,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: borderRadius.md,
    backgroundColor: adminTheme.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleBtnText: {
    color: adminTheme.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  deleteIconBtn: {
    width: 40,
    minHeight: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 56,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textMuted,
  },
});

