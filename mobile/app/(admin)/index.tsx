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
import { adminTheme, colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';

type AdminCard = {
  key: string;
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
};

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
        <ActivityIndicator size="large" color={adminTheme.primary} />
      </View>
    );
  }

  const cards: AdminCard[] = overview
    ? [
        {
          key: 'users',
          title: 'Toplam Kullanıcı',
          value: overview.totalUsers,
          icon: 'people',
          color: '#3B82F6',
          route: '/(admin)/users',
        },
        {
          key: 'reservations-active',
          title: 'Aktif Rezervasyon',
          value: overview.activeReservations,
          icon: 'time',
          color: '#22C55E',
          route: '/(admin)/reservations?filter=active',
        },
        {
          key: 'reservations-expired',
          title: 'Süresi Dolmuş',
          value: overview.noShowCount,
          icon: 'alert-circle',
          color: '#EF4444',
          route: '/(admin)/reservations?filter=expired',
        },
        {
          key: 'occupancy',
          title: 'Doluluk Oranı',
          value: `%${overview.occupancyRate.toFixed(1)}`,
          icon: 'bar-chart',
          color: '#F59E0B',
          route: '/(admin)/halls',
        },
      ]
    : [];

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[adminTheme.primary]} />}
      >
        <View style={styles.grid}>
          {cards.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(c.route as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: c.color + '20' }]}>
                <Ionicons name={c.icon} size={24} color={c.color} />
              </View>
              <Text style={styles.cardValue}>{c.value}</Text>
              <Text style={styles.cardTitle}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutFab}
        accessibilityRole="button"
        accessibilityLabel="Çıkış yap"
      >
        <Ionicons name="log-out-outline" size={24} color={adminTheme.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  /**
   * Tab bar bu ekranın dışında; `page` zaten sekme çubuğunun üstünde biter.
   * Bu yüzden `bottom` sadece ince bir boşluk — tab ile buton arası büyük gap oluşmaz.
   */
  logoutFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: adminTheme.primaryLight,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
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
