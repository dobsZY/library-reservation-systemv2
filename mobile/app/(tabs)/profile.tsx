import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  InteractionManager,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { useEffect, useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { verifySession, logout } from '../../api/auth';
import { reservationsApi } from '../../api/reservations';
import { Reservation, ReservationStatus } from '../../types';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { onEvent, AppEvents } from '../../utils/events';

interface UserStats {
  totalReservations: number;
  completedReservations: number;
  cancelled: number;
  expired: number;
  noShow: number;
  participationRate: number; // completed / total
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

  const participationRate =
    totalReservations > 0 ? Math.round((completed / totalReservations) * 100) : 0;
  return {
    totalReservations,
    completedReservations: completed,
    cancelled,
    expired,
    noShow,
    participationRate,
  };
}

function getStatusText(status: ReservationStatus): string {
  switch (status) {
    case 'reserved': return 'Aktif';
    case 'checked_in': return 'Check-in Yapıldı';
    case 'completed': return 'Tamamlandı';
    case 'cancelled': return 'İptal Edildi';
    case 'expired': return 'Süresi Doldu';
    case 'no_show': return 'Gelmedi';
    default: return status;
  }
}

function getStatusColor(status: ReservationStatus): string {
  switch (status) {
    case 'reserved': return colors.warning;
    case 'checked_in': return colors.success;
    case 'completed': return colors.info;
    case 'cancelled': return colors.danger;
    case 'expired': return colors.textMuted;
    case 'no_show': return colors.danger;
    default: return colors.textMuted;
  }
}

export default function ProfileScreen() {
  const [userName, setUserName] = useState('Öğrenci');
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalReservations: 0,
    completedReservations: 0,
    cancelled: 0,
    expired: 0,
    noShow: 0,
    participationRate: 0,
  });
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [user, history] = await Promise.all([
        verifySession(),
        reservationsApi.getHistory().catch(() => [] as Reservation[]),
      ]);

      if (user) {
        setUserName(user.fullName || 'Öğrenci');
        setStudentId(user.studentNumber);
      }

      setReservations(history);
      setUserStats(computeStats(history));
    } catch (error: any) {
      if (handleApiError(error)) return;
      console.warn('Profil verileri alınamadı:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tab'a her focus olunduğunda veri yenile
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const unsub = onEvent(AppEvents.RESERVATION_CHANGED, fetchData);
    return () => unsub();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const goToLogin = () => {
    router.replace('/login');
  };

  const performLogout = async () => {
    try {
      await logout();
    } finally {
      // Alert kapanana kadar bekle; aksi halde replace bazı cihazlarda uygulanmayabiliyor
      InteractionManager.runAfterInteractions(() => {
        goToLogin();
      });
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Çıkış Yap',
        'Hesabınızdan çıkmak istediğinize emin misiniz?',
        [
          { text: 'Hayır', style: 'cancel' },
          {
            text: 'Evet, Çıkış Yap',
            style: 'destructive',
            onPress: () => {
              void performLogout();
            },
          },
        ],
      );
      return;
    }

    showAppDialog(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
      'warning',
    );
  };

  // Geçmiş rezervasyonlar: aktif olmayan (reserved/checked_in olmayan) en yeniden eskiye sıralı, ilk 20 adet
  const pastReservations = reservations
    .filter(r => r.status !== 'reserved' && r.status !== 'checked_in')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 20);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Profil Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={colors.textMuted} />
          </View>
        </View>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      {/* Bilgi Kartları */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="card-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Öğrenci Numarası</Text>
            <Text style={styles.infoValue}>{studentId || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Menü */}
      <View style={styles.menuSection}>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/notification-settings')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.menuLabel}>Bildirim Ayarları</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/help-support')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.menuLabel}>Yardım & Destek</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuIcon}>
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.danger }]}>Çıkış Yap</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
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
  
  // Header
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Info Section
  infoSection: {
    backgroundColor: colors.white,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },

  // Stats
  statsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Menu
  menuSection: {
    backgroundColor: colors.white,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // History
  historyContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  historyEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  historyEmptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyHall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyReason: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
