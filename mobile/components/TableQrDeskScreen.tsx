import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { deskApi, DeskReservationRow, DeskTableSnapshot } from '../api/desk';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../constants/theme';
import { handleApiError } from '../utils/apiError';
import { showAppDialog } from '../utils/appDialogController';

export type TableQrDeskLayout = 'modal' | 'tab';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function statusLabelTr(status: string): string {
  switch (status) {
    case 'reserved':
      return 'QR bekleniyor';
    case 'checked_in':
      return 'Check-in yapıldı';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal';
    case 'expired':
      return 'Süresi doldu';
    case 'no_show':
      return 'Gelmedi';
    default:
      return status;
  }
}

export default function TableQrDeskScreen({ layout = 'modal' }: { layout?: TableQrDeskLayout }) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const lastScanAtRef = useRef(0);
  const [snapshot, setSnapshot] = useState<DeskTableSnapshot | null>(null);

  const dismiss = useCallback(() => {
    if (layout === 'tab') {
      router.replace('/(admin)');
    } else {
      router.back();
    }
  }, [layout, router]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanning) return;
    const nowMs = Date.now();
    if (nowMs - lastScanAtRef.current < 1200) return;
    lastScanAtRef.current = nowMs;
    setScanning(true);
    try {
      const snap = await deskApi.getTableSnapshot(data);
      setSnapshot(snap);
    } catch (e: any) {
      if (handleApiError(e)) return;
      const msg = typeof e?.message === 'string' ? e.message : 'Masa bilgisi alınamadı.';
      showAppDialog('Hata', msg, [{ text: 'Tamam' }]);
    } finally {
      setScanning(false);
    }
  };

  const handleCameraPermissionPress = async () => {
    try {
      await requestPermission();
    } catch {
      showAppDialog('Hata', 'Kamera izni alınamadı.');
    }
  };

  const renderReservationRow = (row: DeskReservationRow, isActiveSlot: boolean) => (
    <View
      key={row.id}
      style={[styles.rowCard, isActiveSlot && styles.rowCardActive]}
    >
      <Image source={{ uri: row.user.deskAvatarUrl }} style={styles.rowAvatar} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName}>{row.user.fullName}</Text>
        <Text style={styles.rowSub}>{row.user.studentNumber}</Text>
        <Text style={styles.rowTime}>
          {formatTime(row.startTime)} – {formatTime(row.endTime)}
        </Text>
        <Text style={[styles.rowStatus, isActiveSlot && styles.rowStatusActive]}>
          {statusLabelTr(row.status)}
        </Text>
      </View>
    </View>
  );

  if (snapshot) {
    const { table, calendarDate, activeReservation, todayReservations } = snapshot;
    return (
      <View style={styles.resultPage}>
        <View style={styles.resultHeader}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSnapshot(null)}
            hitSlop={12}
            accessibilityLabel="Tekrar tara"
          >
            <Ionicons name="arrow-back" size={24} color={adminTheme.primary} />
          </TouchableOpacity>
          <Text style={styles.resultHeaderTitle} numberOfLines={1}>
            Masa kontrolü
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={dismiss} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.tableBanner}>
            <Ionicons name="location-outline" size={22} color={adminTheme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tableBannerTitle}>
                {table.hall.name || 'Salon'} · Masa {table.tableNumber}
              </Text>
              <Text style={styles.tableBannerSub}>Tarih: {calendarDate}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Şu anki slot (masayı kullanması beklenen)</Text>
          {activeReservation ? (
            <View style={styles.activeCard}>
              <Image
                source={{ uri: activeReservation.user.deskAvatarUrl }}
                style={styles.activeAvatar}
              />
              <Text style={styles.activeName}>{activeReservation.user.fullName}</Text>
              <Text style={styles.activeSub}>{activeReservation.user.studentNumber}</Text>
              <Text style={styles.activeHint}>
                {formatTime(activeReservation.startTime)} – {formatTime(activeReservation.endTime)} ·{' '}
                {statusLabelTr(activeReservation.status)}
              </Text>
              <Text style={styles.activeCompareHint}>
                Masada oturan kişi ile aşağıdaki görseli karşılaştırın. Görsel, sistemde kayıtlı kullanıcıya
                özel üretilmiş tutarlı bir avatardır (yüz fotoğrafı değildir).
              </Text>
            </View>
          ) : (
            <View style={styles.emptyActive}>
              <Ionicons name="person-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyActiveText}>
                Bu saat diliminde onaylı aktif rezervasyon yok veya süre dışında.
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            Bugünkü tüm rezervasyonlar ({todayReservations.length})
          </Text>
          {todayReservations.length === 0 ? (
            <Text style={styles.noneText}>Bu masa için bugün kayıt yok.</Text>
          ) : (
            todayReservations.map((r) =>
              renderReservationRow(r, activeReservation?.id === r.id),
            )
          )}
        </ScrollView>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={adminTheme.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.textPrimary} />
        <Text style={styles.permissionTitle}>Kamera izni</Text>
        <Text style={styles.permissionText}>Masa QR kodunu okutmak için kamera gerekir.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => void handleCameraPermissionPress()}>
          <Text style={styles.permissionButtonText}>İzin ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={dismiss}>
          <Text style={styles.cancelBtnText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>Masadaki QR kodu çerçeve içine alın</Text>
          </View>
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {scanning && <ActivityIndicator size="large" color={colors.success} />}
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.bottomHint}>
              Yönetici veya personel oturumu gerekir. Öğrenci hesabıyla bu ekran kullanılamaz.
            </Text>
          </View>
        </View>
      </CameraView>
      <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  instructionText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  overlayMiddle: { flexDirection: 'row', height: 280 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scannerFrame: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.success,
    borderWidth: 4,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  overlayBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  bottomHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', lineHeight: 18 },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  permissionText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  permissionButton: {
    marginTop: spacing.lg,
    backgroundColor: adminTheme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: spacing.md },
  cancelBtnText: { color: colors.textMuted, fontSize: 14 },
  resultPage: { flex: 1, backgroundColor: colors.background },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  resultHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: adminTheme.primary,
  },
  resultScroll: { flex: 1 },
  resultScrollContent: { padding: spacing.lg, paddingBottom: 48 },
  tableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  tableBannerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  tableBannerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: adminTheme.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  activeAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background,
  },
  activeName: { marginTop: spacing.md, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  activeSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  activeHint: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  activeCompareHint: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyActive: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  emptyActiveText: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rowCardActive: { borderWidth: 2, borderColor: adminTheme.primary },
  rowAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.background },
  rowBody: { flex: 1, marginLeft: spacing.md },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowTime: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  rowStatus: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
  rowStatusActive: { color: adminTheme.primary },
  noneText: { fontSize: 14, color: colors.textMuted },
});
