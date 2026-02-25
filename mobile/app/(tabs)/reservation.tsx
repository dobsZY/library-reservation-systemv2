import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Reservation } from '../../types';

const DEMO_USER_ID = 'user-001';

export default function ReservationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const fetchReservation = async () => {
    try {
      // Demo aktif rezervasyon
      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      setActiveReservation({
        id: 'demo-res-001',
        userId: DEMO_USER_ID,
        tableId: 'table-1',
        reservationDate: now.toISOString().split('T')[0],
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        durationHours: 2,
        status: 'checked_in',
        qrCheckedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        table: {
          id: 'table-1',
          hallId: 'hall-1',
          tableNumber: 'A-15',
          positionX: 100,
          positionY: 100,
          width: 60,
          height: 60,
          rotation: 0,
          qrCode: 'QR-A15',
          status: 'occupied',
          isActive: true,
          hall: {
            id: 'hall-1',
            name: 'A Salonu',
            floor: 1,
            layoutWidth: 800,
            layoutHeight: 600,
            allowedRadiusMeters: 50,
            capacity: 40,
            isActive: true,
            displayOrder: 1,
          },
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, []);

  // Kalan süre hesaplama
  useEffect(() => {
    if (!activeReservation) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(activeReservation.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Süre doldu');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeReservation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservation();
  }, []);

  const handleCancel = () => {
    Alert.alert(
      'Rezervasyonu İptal Et',
      'Rezervasyonunuzu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        { 
          text: 'Evet, İptal Et', 
          style: 'destructive',
          onPress: () => {
            setActiveReservation(null);
            Alert.alert('Başarılı', 'Rezervasyonunuz iptal edildi.');
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activeReservation) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="calendar-outline" size={80} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Rezervasyon Yok</Text>
        <Text style={styles.emptySubtitle}>
          Henüz aktif bir rezervasyonunuz bulunmuyor.
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/halls')}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Rezervasyon Yap</Text>
        </TouchableOpacity>
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
      {/* Özet Bilgi */}
      <View style={styles.summarySection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.sectionLabel}>Özet Bilgi</Text>
        </View>
        
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="library" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Salon</Text>
            <Text style={styles.summaryValue}>A</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.infoLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info }]}>
              <Ionicons name="grid" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Masa</Text>
            <Text style={styles.summaryValue}>15</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            </View>
            <Text style={styles.summaryLabel}>Durum</Text>
            <Text style={[styles.summaryValue, { color: colors.success, fontSize: 14 }]}>Aktif</Text>
          </View>
        </View>
      </View>

      {/* Rezervasyonlarım Başlık */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Rezervasyonlarım</Text>
        <View style={styles.headerLine} />
        <View style={styles.countBadge}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.countText}>1 rezervasyon</Text>
        </View>
      </View>

      {/* Yaklaşan Rezervasyonlar */}
      <View style={styles.upcomingSection}>
        <View style={styles.upcomingHeader}>
          <View style={styles.upcomingLine} />
          <Text style={styles.upcomingTitle}>Yaklaşan Rezervasyonlar</Text>
          <View style={styles.upcomingCount}>
            <Text style={styles.upcomingCountText}>1</Text>
          </View>
        </View>

        {/* Rezervasyon Kartı */}
        <View style={styles.reservationCard}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>
              {new Date().getDate()}
            </Text>
            <Text style={styles.dateMonth}>
              {new Date().toLocaleDateString('tr-TR', { month: 'short' })}
            </Text>
          </View>
          
          <View style={styles.reservationInfo}>
            <View style={styles.reservationHeader}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.reservationDay}>
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
              </Text>
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Bugün</Text>
              </View>
            </View>
            <View style={styles.reservationDetails}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.reservationTime}>
                {new Date(activeReservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.reservationLocation}>
                {activeReservation.table?.hall?.name} - Masa {activeReservation.table?.tableNumber}
              </Text>
            </View>
          </View>

          <View style={styles.reservationBadge}>
            <Text style={styles.reservationBadgeText}>A</Text>
          </View>
        </View>
      </View>

      {/* Kalan Süre */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>Kalan Süre</Text>
        <Text style={styles.timerValue}>{timeRemaining}</Text>
        <View style={styles.timerProgress}>
          <View style={[styles.timerProgressBar, { width: '60%' }]} />
        </View>
      </View>

      {/* QR Check-in */}
      {activeReservation.status === 'confirmed' && (
        <TouchableOpacity 
          style={styles.qrCard}
          onPress={() => router.push('/qr-scan')}
        >
          <Ionicons name="qr-code" size={32} color={colors.primary} />
          <View style={styles.qrInfo}>
            <Text style={styles.qrTitle}>QR Kod Tara</Text>
            <Text style={styles.qrSubtitle}>Masanıza giriş yapmak için QR kodu okutun</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Eylem Butonları */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.extendButton]}
          onPress={() => Alert.alert('Bilgi', 'Süre uzatma özelliği yakında!')}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Süre Uzat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.actionButtonText, { color: colors.danger }]}>İptal Et</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 30,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
    gap: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Yaklaşan Rezervasyonlar
  upcomingSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  upcomingLine: {
    width: 4,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  upcomingCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  upcomingCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Rezervasyon Kartı
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  reservationInfo: {
    flex: 1,
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reservationDay: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  todayBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  reservationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  reservationTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  separator: {
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  reservationLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reservationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 197, 24, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservationBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  // Timer
  timerSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  timerProgress: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },

  // QR Card
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  qrInfo: {
    flex: 1,
    marginLeft: spacing.md,
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

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  extendButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
