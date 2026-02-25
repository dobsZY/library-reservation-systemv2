import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HallWithOccupancy } from '../../types';
import { hallsApi } from '../../api/halls';

export default function HallsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [halls, setHalls] = useState<HallWithOccupancy[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHalls = async () => {
    try {
      setError(null);
      const data = await hallsApi.getAllOccupancy();
      setHalls(data);
    } catch (err: any) {
      setError(err.message);
      // Demo veri
      setHalls([
        { 
          id: '1', name: 'A Salonu - Sessiz Çalışma', floor: 1, 
          totalTables: 40, availableTables: 15, occupancyRate: 62.5,
          description: 'Bireysel sessiz çalışma alanı',
          layoutWidth: 800, layoutHeight: 600, capacity: 40,
          allowedRadiusMeters: 50, isActive: true, displayOrder: 1
        } as HallWithOccupancy,
        { 
          id: '2', name: 'B Salonu - Grup Çalışma', floor: 1, 
          totalTables: 30, availableTables: 8, occupancyRate: 73.3,
          description: 'Grup çalışma ve tartışma alanı',
          layoutWidth: 800, layoutHeight: 600, capacity: 30,
          allowedRadiusMeters: 50, isActive: true, displayOrder: 2
        } as HallWithOccupancy,
        { 
          id: '3', name: 'C Salonu - Bilgisayar', floor: 2, 
          totalTables: 25, availableTables: 20, occupancyRate: 20,
          description: 'Bilgisayarlı çalışma alanı',
          layoutWidth: 800, layoutHeight: 600, capacity: 25,
          allowedRadiusMeters: 50, isActive: true, displayOrder: 3
        } as HallWithOccupancy,
        { 
          id: '4', name: 'D Salonu - Çok Amaçlı', floor: 2, 
          totalTables: 35, availableTables: 5, occupancyRate: 85.7,
          description: 'Çok amaçlı çalışma alanı',
          layoutWidth: 800, layoutHeight: 600, capacity: 35,
          allowedRadiusMeters: 50, isActive: true, displayOrder: 4
        } as HallWithOccupancy,
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHalls();
  }, []);

  const getOccupancyColor = (rate: number) => {
    if (rate < 50) return '#22c55e';
    if (rate < 80) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusLabel = (rate: number) => {
    if (rate < 50) return 'Müsait';
    if (rate < 80) return 'Orta';
    return 'Yoğun';
  };

  const renderHallCard = ({ item }: { item: HallWithOccupancy }) => (
    <TouchableOpacity 
      style={styles.hallCard}
      onPress={() => router.push(`/hall/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.hallIcon}>
          <Ionicons name="library" size={28} color="#1e3a5f" />
        </View>
        <View style={styles.hallInfo}>
          <Text style={styles.hallName}>{item.name}</Text>
          <Text style={styles.hallFloor}>{item.floor}. Kat</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getOccupancyColor(item.occupancyRate) }
        ]}>
          <Text style={styles.statusText}>{getStatusLabel(item.occupancyRate)}</Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.hallDescription}>{item.description}</Text>
      )}

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
          <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
          <Text style={styles.statValue}>{item.availableTables}</Text>
          <Text style={styles.statLabel}>Boş</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
          <Text style={styles.statValue}>{item.totalTables - item.availableTables}</Text>
          <Text style={styles.statLabel}>Dolu</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="grid-outline" size={20} color="#1e3a5f" />
          <Text style={styles.statValue}>{item.totalTables}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => router.push(`/hall/${item.id}`)}
      >
        <Text style={styles.selectButtonText}>Masa Seç</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a5f" />
        <Text style={styles.loadingText}>Salonlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={halls}
        renderItem={renderHallCard}
        keyExtractor={(item) => item.id}
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
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
    color: '#1e3a5f',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  hallCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hallIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
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
    color: '#1e3a5f',
  },
  hallFloor: {
    fontSize: 13,
    color: '#888',
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
    backgroundColor: '#e0e0e0',
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
    color: '#666',
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
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  selectButtonText: {
    color: '#fff',
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
    color: '#888',
    marginTop: 15,
  },
});

