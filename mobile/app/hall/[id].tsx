import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Hall, Table } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32;
const MAP_HEIGHT = 380;

export default function HallDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [hall, setHall] = useState<Hall | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  useEffect(() => {
    fetchHallData();
  }, [id]);

  const fetchHallData = async () => {
    try {
      setHall({
        id: id || '1',
        name: 'A Salonu',
        floor: 1,
        description: 'Sessiz Çalışma Alanı - Konuşmak yasaktır.',
        layoutWidth: 800,
        layoutHeight: 600,
        allowedRadiusMeters: 50,
        capacity: 40,
        isActive: true,
        displayOrder: 1,
      });

      // Demo masalar
      const demoTables: Table[] = [];
      const rows = 5;
      const cols = 8;
      const tableWidth = 45;
      const tableHeight = 45;
      const startX = 25;
      const startY = 25;
      const gapX = 80;
      const gapY = 65;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          const statuses: ('available' | 'occupied' | 'reserved')[] = ['available', 'occupied', 'reserved'];
          const randomStatus = Math.random() < 0.4 ? 'available' : (Math.random() < 0.7 ? 'occupied' : 'reserved');
          
          demoTables.push({
            id: `table-${index + 1}`,
            hallId: id || '1',
            tableNumber: `A-${(index + 1).toString().padStart(2, '0')}`,
            positionX: startX + col * gapX,
            positionY: startY + row * gapY,
            width: tableWidth,
            height: tableHeight,
            rotation: 0,
            qrCode: `QR-A${index + 1}`,
            status: index < 20 ? randomStatus : 'available',
            isActive: true,
            features: col % 3 === 0 ? [{ id: '1', name: 'Priz', icon: 'flash' }] : undefined,
          });
        }
      }

      setTables(demoTables);
    } finally {
      setLoading(false);
    }
  };

  const handleTablePress = (table: Table) => {
    if (table.status !== 'available') {
      Alert.alert(
        'Masa Müsait Değil', 
        table.status === 'occupied' ? 'Bu masa şu anda kullanımda.' : 'Bu masa rezerve edilmiş.'
      );
      return;
    }
    setSelectedTable(table);
  };

  const handleReserve = async () => {
    if (!selectedTable) return;

    Alert.alert(
      'Başarılı!',
      `${selectedTable.tableNumber} numaralı masa ${selectedDuration} saat için rezerve edildi.`,
      [{ text: 'Tamam', onPress: () => router.push('/reservation') }]
    );
  };

  const getTableColor = (status: string, isSelected: boolean) => {
    if (isSelected) return colors.primary;
    switch (status) {
      case 'available': return colors.success;
      case 'occupied': return colors.danger;
      case 'reserved': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const scaleX = MAP_WIDTH / (hall?.layoutWidth || 800);
  const scaleY = MAP_HEIGHT / (hall?.layoutHeight || 600);
  const scale = Math.min(scaleX, scaleY);

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hall Info */}
        <View style={styles.hallInfo}>
          <Text style={styles.hallName}>{hall?.name}</Text>
          <Text style={styles.hallDescription}>{hall?.description}</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Boş ({availableCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Rezerve ({reservedCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>Dolu ({occupiedCount})</Text>
          </View>
        </View>

        {/* Hall Map */}
        <View style={styles.mapContainer}>
          <View style={[styles.map, { width: MAP_WIDTH, height: MAP_HEIGHT }]}>
            {/* Entrance indicator */}
            <View style={styles.entrance}>
              <Ionicons name="enter-outline" size={14} color={colors.white} />
              <Text style={styles.entranceText}>GİRİŞ</Text>
            </View>

            {/* Tables */}
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              return (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    styles.table,
                    {
                      left: table.positionX * scale,
                      top: table.positionY * scale,
                      width: table.width * scale,
                      height: table.height * scale,
                      backgroundColor: getTableColor(table.status, isSelected),
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: colors.textPrimary,
                    }
                  ]}
                  onPress={() => handleTablePress(table)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tableNumber}>
                    {table.tableNumber.split('-')[1]}
                  </Text>
                  {table.features?.some(f => f.name === 'Priz') && (
                    <View style={styles.tableFeature}>
                      <Ionicons name="flash" size={10} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{availableCount}</Text>
            <Text style={styles.statLabel}>Boş</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{reservedCount}</Text>
            <Text style={styles.statLabel}>Rezerve</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.dangerLight }]}>
            <Text style={[styles.statValue, { color: colors.danger }]}>{occupiedCount}</Text>
            <Text style={styles.statLabel}>Dolu</Text>
          </View>
        </View>

        <View style={{ height: selectedTable ? 280 : 30 }} />
      </ScrollView>

      {/* Bottom Sheet for Selected Table */}
      {selectedTable && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <View style={styles.tableIcon}>
                <Ionicons name="grid" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Masa {selectedTable.tableNumber}</Text>
                <Text style={styles.sheetSubtitle}>
                  {selectedTable.features?.length 
                    ? `Priz mevcut`
                    : 'Standart masa'
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedTable(null)}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Duration Selector */}
          <Text style={styles.durationLabel}>Süre Seçin</Text>
          <View style={styles.durationOptions}>
            {[1, 2, 3].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.durationButton,
                  selectedDuration === hours && styles.durationButtonActive
                ]}
                onPress={() => setSelectedDuration(hours)}
              >
                <Text style={[
                  styles.durationText,
                  selectedDuration === hours && styles.durationTextActive
                ]}>
                  {hours} Saat
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={styles.noteText}>
              Seçtiğiniz süre ne olursa olsun, masa 3 saat boyunca sizin için kilitlenir.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.reserveButton}
            onPress={handleReserve}
          >
            <Ionicons name="calendar" size={20} color={colors.white} />
            <Text style={styles.reserveButtonText}>Rezervasyon Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Hall Info
  hallInfo: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hallName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hallDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Map
  mapContainer: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  map: {
    backgroundColor: '#F0F4F8',
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  entrance: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entranceText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  table: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableNumber: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  tableFeature: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    ...shadows.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tableIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },

  // Duration
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationTextActive: {
    color: colors.white,
  },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },

  // Reserve Button
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  reserveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
