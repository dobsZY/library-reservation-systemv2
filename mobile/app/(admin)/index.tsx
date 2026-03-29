import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { adminApi, AdminOverview } from '../../api/admin';
import { logout } from '../../api/auth';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';

export default function AdminHomeScreen() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'İstatistikler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const goToLogin = () => {
    router.replace('/login');
  };

  const performLogout = async () => {
    try {
      await logout();
    } finally {
      // Alert onPress / web confirm sonrası replace her koşulda çalışsın
      goToLogin();
    }
  };

  const handleLogout = () => {
    showAppDialog(
      'Çıkış',
      'Oturumu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
      'warning',
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  const cards = overview
    ? [
        { title: 'Toplam Kullanıcı', value: overview.totalUsers, icon: 'people' as const, color: '#3B82F6' },
        { title: 'Toplam Rezervasyon', value: overview.totalReservations, icon: 'calendar' as const, color: '#8B5CF6' },
        { title: 'Aktif Rezervasyon', value: overview.activeReservations, icon: 'time' as const, color: '#22C55E' },
        { title: 'Süresi Dolmuş', value: overview.noShowCount, icon: 'alert-circle' as const, color: '#EF4444' },
        { title: 'Doluluk Oranı', value: `%${overview.occupancyRate.toFixed(1)}`, icon: 'bar-chart' as const, color: '#F59E0B' },
      ]
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Yönetici Paneli</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {cards.map((c, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: c.color + '20' }]}>
              <Ionicons name={c.icon} size={24} color={c.color} />
            </View>
            <Text style={styles.cardValue}>{c.value}</Text>
            <Text style={styles.cardTitle}>{c.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  logoutBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardValue: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  cardTitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
