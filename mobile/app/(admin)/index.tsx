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

type DashboardCard = {
  key: string;
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  iconBg: string;
  /** Belirtilirse bu ekrana gider */
  href?: string;
  /** Varsayılan: masa kontrol; qr-desk: QR tarama sekmesi */
  target?: 'masa-kontrol' | 'qr-desk';
};

const MASA_KONTROL_PATH = '/masa-kontrol';

const PURPLE_QR = '#7C3AED';
const PURPLE_QR_BG = '#EDE9FE';

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

  const cards: DashboardCard[] = overview
    ? [
        {
          key: 'users',
          title: 'Toplam Kullanıcı',
          value: overview.totalUsers,
          icon: 'people',
          accent: '#3B82F6',
          iconBg: '#DBEAFE',
          href: '/(admin)/users',
        },
        {
          key: 'reservations-active',
          title: 'Aktif Rezervasyon',
          value: overview.activeReservations,
          icon: 'time',
          accent: '#22C55E',
          iconBg: '#DCFCE7',
          href: '/(admin)/reservations?filter=active',
        },
        {
          key: 'reservations-expired',
          title: 'Süresi Dolmuş',
          value: overview.noShowCount,
          icon: 'alert-circle',
          accent: '#EF4444',
          iconBg: '#FEE2E2',
          href: '/(admin)/reservations?filter=expired',
        },
        {
          key: 'reservations-cancelled',
          title: 'İptal Edilen',
          value: overview.cancelledReservations ?? 0,
          icon: 'close-circle-outline',
          accent: '#4F46E5',
          iconBg: '#EEF2FF',
          href: '/(admin)/reservations?filter=cancelled',
        },
        {
          key: 'occupancy',
          title: 'Doluluk Oranı',
          value: `%${overview.occupancyRate.toFixed(1)}`,
          icon: 'bar-chart',
          accent: '#F59E0B',
          iconBg: '#FEF3C7',
        },
        {
          key: 'qr-desk',
          title: 'Masa QR tara',
          value: '',
          icon: 'qr-code',
          accent: PURPLE_QR,
          iconBg: PURPLE_QR_BG,
          target: 'qr-desk',
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
          {cards.map((c) => {
            const navigable = Boolean(c.href || c.target);
            const cardBody = (
              <>
                <View
                  style={[
                    styles.iconCircle,
                    c.target === 'qr-desk' && styles.iconCircleQr,
                    { backgroundColor: c.iconBg },
                  ]}
                >
                  <Ionicons
                    name={c.icon}
                    size={c.target === 'qr-desk' ? 30 : 22}
                    color={c.accent}
                  />
                </View>
                {c.target === 'qr-desk' ? (
                  <View style={styles.cardValueSpacer} />
                ) : (
                  <Text style={styles.cardValue}>{c.value}</Text>
                )}
                <Text style={styles.cardTitle}>{c.title}</Text>
              </>
            );
            if (!navigable) {
              return (
                <View key={c.key} style={styles.card} accessibilityLabel={c.title}>
                  {cardBody}
                </View>
              );
            }
            return (
              <TouchableOpacity
                key={c.key}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => {
                  if (c.href) {
                    router.push(c.href as any);
                    return;
                  }
                  router.push(
                    (c.target === 'qr-desk' ? '/(admin)/qr-desk' : MASA_KONTROL_PATH) as any,
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={c.title}
              >
                {cardBody}
              </TouchableOpacity>
            );
          })}
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
  content: { padding: spacing.lg, paddingBottom: 88 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircleQr: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: spacing.md,
  },
  /** QR kartında sayı satırı yok; diğer kartlardaki başlık hizası için boşluk */
  cardValueSpacer: {
    minHeight: 34,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  cardTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 18,
  },
});
