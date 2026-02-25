import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { HallWithOccupancy } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    totalTables: number;
    availableTables: number;
    occupancyRate: number;
    hallStats: HallWithOccupancy[];
  } | null>(null);

  const fetchStats = async () => {
    try {
      // Demo veri
      setStats({
        totalTables: 120,
        availableTables: 45,
        occupancyRate: 62.5,
        hallStats: [
          { id: '1', name: 'A Salonu', floor: 1, totalTables: 40, availableTables: 15, occupancyRate: 62.5, description: 'Sessiz Çalışma Alanı' } as HallWithOccupancy,
          { id: '2', name: 'B Salonu', floor: 1, totalTables: 40, availableTables: 18, occupancyRate: 55, description: 'Grup Çalışma Alanı' } as HallWithOccupancy,
          { id: '3', name: 'C Salonu', floor: 2, totalTables: 40, availableTables: 12, occupancyRate: 70, description: 'Bilgisayarlı Alan' } as HallWithOccupancy,
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const getStatusColor = (rate: number) => {
    if (rate < 50) return colors.success;
    if (rate < 80) return colors.warning;
    return colors.danger;
  };

  const getStatusBg = (rate: number) => {
    if (rate < 50) return colors.successLight;
    if (rate < 80) return colors.warningLight;
    return colors.dangerLight;
  };

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
              {stats?.availableTables || 0}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.infoLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info }]}>
              <Ionicons name="calendar" size={20} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Rezervasyon</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>1</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.dangerLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.danger }]}>
              <Ionicons name="pie-chart" size={20} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Doluluk</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              %{Math.round(stats?.occupancyRate || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Hızlı Rezervasyon */}
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

        {stats?.hallStats.map((hall) => (
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
                <Text style={styles.hallDescription}>{hall.description}</Text>
                <Text style={styles.hallFloor}>{hall.floor}. Kat</Text>
              </View>
            </View>
            
            <View style={styles.hallStats}>
              <View style={[
                styles.occupancyBadge, 
                { backgroundColor: getStatusBg(hall.occupancyRate) }
              ]}>
                <Text style={[styles.occupancyText, { color: getStatusColor(hall.occupancyRate) }]}>
                  %{Math.round(hall.occupancyRate)}
                </Text>
              </View>
              <Text style={styles.availableText}>
                {hall.availableTables} / {hall.totalTables} boş
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* QR Kod Tara */}
      <TouchableOpacity 
        style={styles.qrButton}
        onPress={() => router.push('/qr-scan')}
        activeOpacity={0.7}
      >
        <View style={styles.qrIconContainer}>
          <Ionicons name="qr-code" size={32} color={colors.primary} />
        </View>
        <View style={styles.qrTextContainer}>
          <Text style={styles.qrTitle}>QR Kod Tara</Text>
          <Text style={styles.qrSubtitle}>Masanıza giriş yapın</Text>
        </View>
      </TouchableOpacity>

      {/* Aktif Rezervasyon Kartı */}
      <View style={styles.activeReservation}>
        <View style={styles.activeHeader}>
          <View style={styles.activeDot} />
          <Text style={styles.activeLabel}>ŞU ANDA AKTİF</Text>
        </View>
        <View style={styles.activeContent}>
          <View style={styles.activeIconBox}>
            <Ionicons name="library" size={24} color={colors.success} />
          </View>
          <View style={styles.activeInfo}>
            <Text style={styles.activeTitle}>A Salonu - Masa 15</Text>
            <Text style={styles.activeSubtitle}>Sessiz Çalışma Alanı</Text>
          </View>
        </View>
        <View style={styles.activeTimeRow}>
          <View style={styles.activeTimeItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.activeTimeText}>14:00 - 17:00</Text>
          </View>
          <View style={styles.activeTimeItem}>
            <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
            <Text style={[styles.activeTimeText, { color: colors.warning }]}>1:45:30 kaldı</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.activeButton}>
          <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
          <Text style={styles.activeButtonText}>Rezervasyonu İptal Et</Text>
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
    marginTop: spacing.lg,
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
    backgroundColor: colors.success,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
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

