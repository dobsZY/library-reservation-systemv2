import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  InteractionManager,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { Hall, TableAvailabilityItem, HallSlotsResponse, TableSlotItem, Reservation } from '../../types';
import { hallsApi } from '../../api/halls';
import { reservationsApi } from '../../api/reservations';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { emitEvent, onEvent, AppEvents } from '../../utils/events';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
/** Alt sayfa başlığındaki kapatma ikonu — dar ekranlarda taşmayı önlemek için üst sınırlı ölçek */
const SHEET_CLOSE_ICON_SIZE = Math.round(Math.min(26, Math.max(20, SCREEN_WIDTH * 0.062)));
// `mapContainer` içinde hem `margin` hem `padding` var:
// margin: spacing.lg (sol+sağ) + padding: spacing.md (sol+sağ)
// Harita genişliğini bunları düşerek hesaplayınca telefon ekranına taşma azalır.
const DEFAULT_MAP_WIDTH = SCREEN_WIDTH - (spacing.lg * 2 + spacing.md * 2);
type LayoutPoint = { x: number; y: number; w: number; h: number; r?: number };

function buildAHallLayoutPoints(count: number): LayoutPoint[] {
  const pts: LayoutPoint[] = [];
  const addGrid = (
    sx: number,
    sy: number,
    rows: number,
    cols: number,
    gx: number,
    gy: number,
    w: number,
    h: number,
  ) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pts.push({ x: sx + c * gx, y: sy + r * gy, w, h });
      }
    }
  };

  const addDiagonalBand = (
    sx: number,
    sy: number,
    rows: number,
    cols: number,
    stepX: number,
    stepY: number,
    w: number,
    h: number,
    r = 45,
  ) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        pts.push({
          x: sx + col * stepX + row * 10,
          y: sy + col * stepY + row * 44,
          w,
          h,
          r,
        });
      }
    }
  };

  // Grup 1: Sol üst ana çalışma sıraları (32)
  addGrid(90, 110, 8, 4, 48, 44, 22, 14);

  // Grup 2: Üst duvar yatay sıra (8) -> toplam 40
  addGrid(420, 86, 1, 8, 54, 0, 24, 14);

  // Grup 3: Orta çapraz uzun banklar (36) -> toplam 76
  addDiagonalBand(420, 180, 3, 12, 24, 14, 22, 14, 45);

  // Grup 4: İç orta ikinci çapraz set (20) -> toplam 96
  addDiagonalBand(330, 300, 2, 10, 24, 14, 22, 14, 45);

  // Grup 5: Sağ alt duvar ikili dikey masalar (8) -> toplam 104
  addGrid(1120, 500, 4, 2, 40, 42, 18, 16);

  // Koruyucu fallback (normalde çalışmaz)
  let i = 0;
  while (pts.length < count) {
    pts.push({
      x: 120 + (i % 10) * 34,
      y: 720 + Math.floor(i / 10) * 24,
      w: 16,
      h: 12,
      r: 0,
    });
    i++;
  }

  return pts.slice(0, count);
}

function localCalendarYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const base = new Date(year, month - 1, day, 12, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
}

function formatYmdForDisplay(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toLocaleDateString('tr-TR');
}

export default function HallDetailScreen() {
  const { id: routeId } = useLocalSearchParams<{ id: string | string[] }>();
  const hallId = Array.isArray(routeId) ? routeId[0] ?? '' : routeId ?? '';
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [hall, setHall] = useState<Hall | null>(null);
  const [tableItems, setTableItems] = useState<TableAvailabilityItem[]>([]);
  const [stats, setStats] = useState<{ total: number; available: number; occupied: number; occupancyRate: number } | null>(null);
  const [slotsData, setSlotsData] = useState<HallSlotsResponse | null>(null);
  const [selectedTableItem, setSelectedTableItem] = useState<TableAvailabilityItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TableSlotItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapWidth, setMapWidth] = useState<number>(Math.max(1, DEFAULT_MAP_WIDTH));
  const todayYmd = useMemo(() => localCalendarYmd(), []);
  const [selectedDateYmd, setSelectedDateYmd] = useState<string>(todayYmd);
  const [canShowTomorrowButton, setCanShowTomorrowButton] = useState(false);

  const selectedTableRef = useRef<TableAvailabilityItem | null>(null);
  const selectedSlotRef = useRef<TableSlotItem | null>(null);
  useEffect(() => {
    selectedTableRef.current = selectedTableItem;
    selectedSlotRef.current = selectedSlot;
  }, [selectedTableItem, selectedSlot]);

  useEffect(() => {
    if (!canShowTomorrowButton && selectedDateYmd !== todayYmd) {
      setSelectedDateYmd(todayYmd);
    }
  }, [canShowTomorrowButton, selectedDateYmd, todayYmd]);

  const selectedTableSlots = useMemo(() => {
    if (!selectedTableItem || !slotsData) return [];
    const tableData = slotsData.tables.find((t) => t.tableId === selectedTableItem.table.id);
    return tableData?.slots || [];
  }, [selectedTableItem, slotsData]);
  const hasAnyAvailableSlot = useMemo(
    () => selectedTableSlots.some((slot) => slot.isAvailable),
    [selectedTableSlots],
  );

  /** Kroki rengi için: dakikada bir "şu an" dilimini güncelle */
  const [mapColorTick, setMapColorTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMapColorTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  /**
   * Kırmızı: yalnızca şu an bulunulan saat aralığında masada
   * gerçek bir rezervasyon/kilit çakışması varsa.
   * (Süre penceresi kapanan geçmiş slotlar tek başına masayı kırmızıya düşürmez.)
   */
  const tableMapShowRed = useMemo(() => {
    void mapColorTick;
    const now = Date.now();
    const map = new Map<string, boolean>();
    if (!slotsData?.tables?.length) return map;
    for (const row of slotsData.tables) {
      const slots = row.slots;
      const bookedInCurrentInterval = slots.some((s) => {
        // blockedUntil varsa bu slotun gerçekten rezervasyon/kilit nedeniyle bloklandığını anlarız.
        if (s.isAvailable || !s.blockedUntil) return false;
        const startMs = new Date(s.startTime).getTime();
        const endMs = new Date(s.endTime).getTime();
        return now >= startMs && now < endMs;
      });
      map.set(row.tableId, bookedInCurrentInterval);
    }
    return map;
  }, [slotsData, mapColorTick]);

  const fetchHallData = useCallback(async () => {
    if (!hallId) return;
    const requestedYmd = selectedDateYmd || todayYmd;
    try {
      setError(null);
      // Önce slotları al; sunucunun kullandığı `date` ile müsaitlik iste (takvim uyumu)
      const slots = await hallsApi.getSlots(hallId, requestedYmd).catch(() => null);
      if (requestedYmd === todayYmd && slots) {
        const canShowTomorrow =
          slots.datePolicy?.periodKind === 'special' &&
          !!slots.datePolicy?.allowAdvanceBooking &&
          (slots.datePolicy?.maxAdvanceDays ?? 1) >= 1;
        setCanShowTomorrowButton(canShowTomorrow);
      }
      const isFutureDateRequest = requestedYmd !== todayYmd;
      if (isFutureDateRequest && slots) {
        const canBookFutureDate =
          slots.datePolicy?.periodKind === 'special' && !!slots.datePolicy?.allowAdvanceBooking;
        if (!canBookFutureDate) {
          showAppDialog(
            'Bilgi',
            'Ileri tarih rezervasyonu sadece admin tarafindan tanimlanan ozel donemlerde aciktir.',
          );
          setSelectedDateYmd(todayYmd);
          return;
        }
      }

      const dateForAvailability = slots?.date ?? requestedYmd;
      const availabilityData = await hallsApi.getAvailability(hallId, dateForAvailability);
      setHall(availabilityData.hall);
      setTableItems(availabilityData.tables);
      setStats(availabilityData.statistics);
      setSlotsData(slots);
      setSelectedTableItem((prev) => {
        if (!prev) return null;
        const updated = availabilityData.tables.find((t) => t.table.id === prev.table.id);
        return updated ?? null;
      });
    } catch (err: any) {
      if (handleApiError(err)) {
        return;
      }
      setError(err.message || 'Salon bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hallId, selectedDateYmd, todayYmd]);

  useEffect(() => {
    fetchHallData();
    const unsub1 = onEvent(AppEvents.STATS_CHANGED, fetchHallData);
    const unsub2 = onEvent(AppEvents.RESERVATION_CHANGED, fetchHallData);
    return () => {
      unsub1();
      unsub2();
    };
  }, [hallId, fetchHallData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchHallData();
  }, [fetchHallData]);

  const handleTablePress = (item: TableAvailabilityItem) => {
    setSelectedTableItem(item);
    setSelectedSlot(null);
  };

  const handleReserve = () => {
    const tableItem = selectedTableRef.current;
    const slot = selectedSlotRef.current;
    if (!tableItem || !slot) {
      showAppDialog('Uyarı', 'Lütfen bir saat seçin.');
      return;
    }
    void createReservation();
  };

  const createReservation = async () => {
    const tableItem = selectedTableRef.current;
    const slot = selectedSlotRef.current;
    if (!tableItem || !slot) return;

    const tableId = tableItem.table.id;
    const startTime = slot.startTime;

    setReserving(true);
    try {
      const created: Reservation = await reservationsApi.create({
        tableId,
        startTime,
      });

      const until =
        typeof created.endTime === 'string'
          ? created.endTime
          : new Date(created.endTime).toISOString();

      setTableItems((prev) => {
        const next = prev.map((row) =>
          row.table.id === tableId
            ? { ...row, isAvailable: false, availableFrom: until }
            : row,
        );
        const total = next.length;
        const available = next.filter((t) => t.isAvailable).length;
        const occupied = total - available;
        setStats({
          total,
          available,
          occupied,
          occupancyRate: total > 0 ? (occupied / total) * 100 : 0,
        });
        return next;
      });

      emitEvent(AppEvents.RESERVATION_CHANGED);
      emitEvent(AppEvents.STATS_CHANGED);
      setRefreshing(true);
      await fetchHallData();

      setSelectedTableItem(null);
      setSelectedSlot(null);

      InteractionManager.runAfterInteractions(() => {
        showAppDialog(
          'Rezervasyon oluşturuldu',
          'Rezervasyonunuz başarıyla oluşturuldu.',
          [
            {
              text: 'Rezervasyona Git',
              onPress: () => router.replace('/(tabs)/reservation'),
            },
            { text: 'Tamam', style: 'cancel' },
          ],
          'success',
        );
      });
    } catch (err: any) {
      if (handleApiError(err)) {
        return;
      }
      showAppDialog('Hata', err?.message || 'Rezervasyon oluşturulamadı.');
    } finally {
      setReserving(false);
    }
  };

  const getTableColor = (item: TableAvailabilityItem, isSelected: boolean) => {
    const hasSlotDerived = tableMapShowRed.has(item.table.id);
    const slotDerivedRed = hasSlotDerived ? tableMapShowRed.get(item.table.id) === true : false;
    const showRed = !item.isAvailable || slotDerivedRed;
    if (showRed) return colors.danger;
    if (isSelected) return colors.primary;
    return colors.success;
  };

  const layoutWidth = hall?.layoutWidth || 800;
  const layoutHeight = hall?.layoutHeight || 600;
  const isAHall = (hall?.name || '').toLocaleLowerCase('tr-TR').includes('a salonu');
  const scaleX = mapWidth / layoutWidth;
  const scaleY = (mapWidth * 1.0) / layoutHeight;
  const scale = Math.min(scaleX, scaleY);
  const mapHeight = layoutHeight * scale;
  const aHallLayoutById = useMemo(() => {
    if (!isAHall || tableItems.length === 0) return new Map<string, LayoutPoint>();
    const sorted = [...tableItems].sort((a, b) =>
      a.table.tableNumber.localeCompare(b.table.tableNumber, 'tr', { numeric: true }),
    );
    const points = buildAHallLayoutPoints(sorted.length);
    const map = new Map<string, LayoutPoint>();
    sorted.forEach((item, idx) => {
      map.set(item.table.id, points[idx]);
    });
    return map;
  }, [isAHall, tableItems]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Salon yükleniyor...</Text>
      </View>
    );
  }

  if (error && !hall) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
        <Text style={styles.errorTitle}>Yüklenemedi</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); void fetchHallData(); }}>
          <Ionicons name="refresh" size={18} color={colors.white} />
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Hall Info */}
        <View style={styles.hallInfo}>
          <View style={styles.hallInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hallName}>{hall?.name || 'Salon'}</Text>
              {hall?.description ? (
                <Text style={styles.hallDescription}>{hall.description}</Text>
              ) : null}
              <Text style={styles.hallFloor}>{hall?.floor}. Kat</Text>
            </View>
            {stats && (
              <View style={styles.occupancyBadge}>
                <Text style={[
                  styles.occupancyText,
                  { color: stats.occupancyRate < 50 ? colors.success : stats.occupancyRate < 80 ? colors.warning : colors.danger }
                ]}>
                  %{Math.round(stats.occupancyRate)}
                </Text>
                <Text style={styles.occupancyLabel}>Doluluk</Text>
              </View>
            )}
          </View>
          <View style={styles.dateSelectorRow}>
            <TouchableOpacity
              style={[
                styles.dateChip,
                selectedDateYmd === todayYmd && styles.dateChipActive,
              ]}
              onPress={() => setSelectedDateYmd(todayYmd)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dateChipText,
                  selectedDateYmd === todayYmd && styles.dateChipTextActive,
                ]}
              >
                Bugün
              </Text>
            </TouchableOpacity>
            {canShowTomorrowButton && (
              <TouchableOpacity
                style={[
                  styles.dateChip,
                  selectedDateYmd === addDaysToYmd(todayYmd, 1) && styles.dateChipActive,
                ]}
                onPress={() => setSelectedDateYmd(addDaysToYmd(todayYmd, 1))}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    selectedDateYmd === addDaysToYmd(todayYmd, 1) && styles.dateChipTextActive,
                  ]}
                >
                  Yarın
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.dateSelectedText}>{formatYmdForDisplay(selectedDateYmd)}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Boş ({stats?.available || 0})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>Dolu ({stats?.occupied || 0})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Seçili</Text>
          </View>
        </View>

        {/* Hall Map */}
        {tableItems.length > 0 ? (
          <View
            style={styles.mapContainer}
            onLayout={(e) => {
              // `mapContainer` padding'ini (sol+sağ) düşerek gerçek kullanılabilir genişliği buluyoruz.
              const innerW = e.nativeEvent.layout.width - spacing.md * 2;
              if (innerW > 0) setMapWidth(innerW);
            }}
          >
            <View style={[styles.map, { width: mapWidth, height: mapHeight }]}>
              <View style={styles.entrance}>
                <Ionicons name="enter-outline" size={14} color={colors.white} />
                <Text style={styles.entranceText}>GİRİŞ</Text>
              </View>

              {isAHall && (
                <>
                  <View
                    style={[
                      styles.staffDesk,
                      {
                        left: 608 * scale,
                        top: 224 * scale,
                        width: 132 * scale,
                        height: 56 * scale,
                      },
                    ]}
                  >
                    <Text style={styles.staffDeskText}>Görevli</Text>
                  </View>
                  <View
                    style={[
                      styles.walkway,
                      {
                        left: 90 * scale,
                        top: 220 * scale,
                        width: 470 * scale,
                        height: 230 * scale,
                      },
                    ]}
                  />
                </>
              )}

              {tableItems.map((item) => {
                const isSelected = selectedTableItem?.table.id === item.table.id;
                const custom = isAHall ? aHallLayoutById.get(item.table.id) : undefined;
                const tableW = Math.max((custom?.w ?? item.table.width) * scale, 10);
                const tableH = Math.max((custom?.h ?? item.table.height) * scale, 8);
                const tableLabel = item.table.tableNumber.replace(/[^\d]/g, '').slice(-2);
                const canShowLabel = !isAHall && tableW >= 20 && tableH >= 18;
                return (
                  <TouchableOpacity
                    key={item.table.id}
                    style={[
                      styles.table,
                      {
                        left: (custom?.x ?? item.table.positionX) * scale,
                        top: (custom?.y ?? item.table.positionY) * scale,
                        width: tableW,
                        height: tableH,
                        backgroundColor: getTableColor(item, isSelected),
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: colors.textPrimary,
                        transform: custom?.r ? [{ rotate: `${custom.r}deg` }] : undefined,
                      }
                    ]}
                    onPress={() => handleTablePress(item)}
                    activeOpacity={0.7}
                  >
                    {canShowLabel ? (
                      <Text style={styles.tableNumber}>{tableLabel || item.table.tableNumber}</Text>
                    ) : null}
                    {item.table.features && item.table.features.some((f: any) => 
                      f.name === 'Priz' || f.name === 'priz' || f.icon === 'flash'
                    ) && (
                      <View style={styles.tableFeature}>
                        <Ionicons name="flash" size={10} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyMapContainer}>
            <Ionicons name="grid-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyMapText}>Bu salonda henüz masa tanımlanmamış.</Text>
          </View>
        )}

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>{stats.available}</Text>
              <Text style={styles.statLabel}>Boş</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.statValue, { color: colors.danger }]}>{stats.occupied}</Text>
              <Text style={styles.statLabel}>Dolu</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.infoLight }]}>
              <Text style={[styles.statValue, { color: colors.info }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>
        )}

        {error && hall && (
          <View style={styles.inlineError}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        )}

        <View style={{ height: selectedTableItem ? 400 : 30 }} />
      </ScrollView>

      {/* Bottom Sheet for Selected Table */}
      {selectedTableItem && (
        <View style={styles.bottomSheet} collapsable={false}>
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <View style={styles.tableIcon}>
                <Ionicons name="grid" size={20} color={colors.primary} />
              </View>
              <View style={styles.sheetTitleTextWrap}>
                <Text style={styles.sheetTitle} numberOfLines={1} ellipsizeMode="tail">
                  Masa {selectedTableItem.table.tableNumber}
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={2} ellipsizeMode="tail">
                  {selectedTableItem.isAvailable ? (
                    <Text style={{ color: colors.success }}>Müsait</Text>
                  ) : (
                    <Text style={{ color: colors.danger }}>
                      {selectedTableItem.availableFrom
                        ? `Boşalma: ${new Date(selectedTableItem.availableFrom).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Dolu'}
                    </Text>
                  )}
                  {' • '}
                  {selectedTableItem.table.features && selectedTableItem.table.features.some((f: any) => 
                    f.name === 'Priz' || f.name === 'priz' || f.icon === 'flash'
                  )
                    ? 'Priz mevcut'
                    : 'Standart masa'
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedTableItem(null);
                setSelectedSlot(null);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <Ionicons name="close" size={SHEET_CLOSE_ICON_SIZE} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Saat Slotları (backend'den) */}
          {selectedTableSlots.length > 0 ? (
            <View style={styles.slotsContainer}>
              <Text style={styles.slotsTitle}>
                Saat Aralıkları ({formatYmdForDisplay(selectedDateYmd)})
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.slotsScrollView}
                contentContainerStyle={styles.slotsContent}
              >
                {selectedTableSlots.map((slot, index) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const startDisplay = new Date(slot.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  const endDisplay = new Date(slot.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.slotButton,
                        isSelected && styles.slotButtonSelected,
                        !slot.isAvailable && styles.slotButtonDisabled,
                      ]}
                      onPress={() => slot.isAvailable && setSelectedSlot(slot)}
                      disabled={!slot.isAvailable}
                    >
                      <Text style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeSelected,
                        !slot.isAvailable && styles.slotTimeDisabled,
                      ]}>
                        {startDisplay}
                      </Text>
                      <Text style={[
                        styles.slotArrow,
                        isSelected && styles.slotArrowSelected,
                        !slot.isAvailable && styles.slotTimeDisabled,
                      ]}>
                        →
                      </Text>
                      <Text style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeSelected,
                        !slot.isAvailable && styles.slotTimeDisabled,
                      ]}>
                        {endDisplay}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {!hasAnyAvailableSlot && (
                <Text style={styles.noSlotsText}>Bugün müsait saat yok</Text>
              )}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Ionicons name="time-outline" size={24} color={colors.textMuted} />
              <Text style={styles.noSlotsText}>Bugün için uygun saat bulunamadı</Text>
            </View>
          )}

          {/* Bilgilendirme */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={styles.noteText}>
              Rezervasyon 1 saat sürelidir. Süre dolmadan önce en fazla 2 kez uzatma hakkınız olacaktır. Rezervasyon sonrası 30 dakika içinde QR kod ile check-in yapmanız gerekmektedir.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.reserveButton,
              (!selectedSlot || reserving) && { opacity: 0.6, backgroundColor: colors.textMuted },
              pressed && selectedSlot && !reserving && { opacity: 0.85 },
            ]}
            onPress={handleReserve}
            disabled={!selectedSlot || reserving}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {reserving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="calendar" size={20} color={colors.white} />
                <Text style={styles.reserveButtonText}>
                  {selectedSlot ? 'Rezervasyon Yap' : 'Lütfen Saat Seçin'}
                </Text>
              </>
            )}
          </Pressable>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  
  hallInfo: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hallInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  hallFloor: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  dateSelectorRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateChipTextActive: {
    color: colors.primary,
  },
  dateSelectedText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  occupancyBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  occupancyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  occupancyLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },

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

  mapContainer: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  map: {
    backgroundColor: '#F6F7FB',
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9DEE8',
  },
  walkway: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E4D6D6',
    backgroundColor: '#F8F5F5',
    borderRadius: 8,
  },
  staffDesk: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#B0892B',
    backgroundColor: '#FFF7E2',
    borderRadius: 10,
    zIndex: 1,
  },
  staffDeskText: {
    color: '#7A5A14',
    fontSize: 10,
    fontWeight: '700',
  },
  entrance: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
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
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableNumber: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  tableFeature: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },

  emptyMapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.lg,
  },
  emptyMapText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },

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

  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
  },
  inlineErrorText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
  },

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
    zIndex: 100,
    elevation: Platform.OS === 'android' ? 24 : shadows.lg.elevation,
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
    gap: spacing.sm,
  },
  sheetTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sheetTitleTextWrap: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
    marginLeft: spacing.xs,
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },

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

  slotsContainer: {
    marginBottom: spacing.md,
  },
  slotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  slotsScrollView: {
    marginHorizontal: -spacing.lg,
  },
  slotsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minWidth: 120,
  },
  slotButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  slotButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotTimeSelected: {
    color: colors.primary,
  },
  slotTimeDisabled: {
    color: '#9CA3AF',
  },
  slotArrow: {
    fontSize: 14,
    color: colors.textMuted,
  },
  slotArrowSelected: {
    color: colors.primary,
  },
  noSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  noSlotsText: {
    fontSize: 14,
    color: colors.textMuted,
  },

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
