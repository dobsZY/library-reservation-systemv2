import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Hall } from '../../types';
import { hallsApi, statisticsApi, HallOccupancy } from '../../api/halls';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { onEvent, AppEvents } from '../../utils/events';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

export default function HallsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [halls, setHalls] = useState<HallOccupancy[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHalls = async () => {
    try {
      setError(null);
      const overall = await statisticsApi.getOverallOccupancy();
      setHalls(overall.hallsOccupancy);
    } catch (err: any) {
      if (handleApiError(err)) {
        return;
      }
      setError(err.message || 'Salonlar yüklenirken bir hata oluştu.');
      setHalls([]);
      showAppDialog('Hata', err.message || 'Salonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tab'a her focus olunduğunda veri yenile
  useFocusEffect(
    useCallback(() => {
      fetchHalls();
    }, [])
  );

  useEffect(() => {
    // Rezervasyon veya istatistik değişince yenile
    const unsub1 = onEvent(AppEvents.RESERVATION_CHANGED, fetchHalls);
    const unsub2 = onEvent(AppEvents.STATS_CHANGED, fetchHalls);
    return () => { unsub1(); unsub2(); };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHalls();
  }, []);

  const getOccupancyColor = (rate: number) => {
    if (rate < 50) return colors.success;
    if (rate < 80) return colors.warning;
    return colors.danger;
  };

  const getStatusLabel = (rate: number) => {
    if (rate < 50) return 'Müsait';
    if (rate < 80) return 'Orta';
    return 'Yoğun';
  };

  const renderHallCard = ({ item }: { item: HallOccupancy }) => (
    <TouchableOpacity 
      style={styles.hallCard}
      onPress={() => router.push(`/hall/${item.hallId}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.hallIcon}>
          <Ionicons name="library" size={28} color={colors.textPrimary} />
        </View>
        <View style={styles.hallInfo}>
          <Text style={styles.hallName}>{item.hallName}</Text>
          <Text style={styles.hallFloor}>{item.floor}. Kat</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getOccupancyColor(item.occupancyRate) }
        ]}>
          <Text style={styles.statusText}>{getStatusLabel(item.occupancyRate)}</Text>
        </View>
      </View>

      {/* Açıklama backend istatistiklerinde bulunmadığı için gösterilmiyor */}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${item.occupancyRate}%`,
                backgroundColor: getOccupancyColor(item.occupancyRate)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>%{Math.round(item.occupancyRate)}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={styles.statValue}>{item.availableTables}</Text>
          <Text style={styles.statLabel}>Boş</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.statValue}>{item.totalTables - item.availableTables}</Text>
          <Text style={styles.statLabel}>Dolu</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="grid-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.statValue}>{item.totalTables}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => router.push(`/hall/${item.hallId}`)}
      >
        <Text style={styles.selectButtonText}>Masa Seç</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={styles.loadingText}>Salonlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={halls}
        renderItem={renderHallCard}
        keyExtractor={(item) => item.hallId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Salon Seçin</Text>
            <Text style={styles.headerSubtitle}>
              Rezervasyon yapmak istediğiniz salonu seçin
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aktif salon bulunamadı</Text>
          </View>
        }
      />
    </View>
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
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  hallCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: 15,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hallIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hallInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hallName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hallFloor: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hallDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  selectButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 15,
  },
});

