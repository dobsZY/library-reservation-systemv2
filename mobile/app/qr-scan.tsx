import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reservationsApi } from '../api/reservations';
import { handleApiError } from '../utils/apiError';
import { showAppDialog } from '../utils/appDialogController';
import { emitEvent, AppEvents } from '../utils/events';
import { colors } from '../constants/theme';

function getCheckInErrorDialog(error: any): { title: string; message: string; tone?: 'danger' | 'warning' } {
  const rawMessage = String(error?.message || '');
  const normalized = rawMessage.toLocaleLowerCase('tr-TR');

  if (
    normalized.includes('gecersiz qr') ||
    normalized.includes('geçersiz qr') ||
    normalized.includes('yanlış masa') ||
    normalized.includes('yanlis masa') ||
    normalized.includes('qr kodu')
  ) {
    return {
      title: 'Yanlış QR Kodu',
      message: 'Okuttuğunuz QR kod rezervasyon yaptığınız masaya ait değil. Lütfen doğru masanın QR kodunu okutun.',
      tone: 'warning',
    };
  }

  if (
    normalized.includes('henuz baslamadi') ||
    normalized.includes('henüz başlamadı') ||
    normalized.includes('baslangic saatinde') ||
    normalized.includes('başlangıç saatinde')
  ) {
    return {
      title: 'Oturum Süresi Henüz Gelmedi',
      message: 'Masa doğru ama oturum süreniz henüz başlamadı. Başlangıç saatinde tekrar deneyin.',
      tone: 'warning',
    };
  }

  return {
    title: 'Hata',
    message: rawMessage || 'Check-in sırasında bir hata oluştu.',
    tone: 'danger',
  };
}

export default function QRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [foregroundLocation, requestForegroundLocation] = Location.useForegroundPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const lastScanAtRef = useRef(0);

  /** QR ekranı Stack'te modal; özel AppDialog bazen üstte görünmez. Ayarlar için Alert kullan. */
  const handleLocationPermissionPress = async () => {
    if (!foregroundLocation) return;

    if (!foregroundLocation.granted && foregroundLocation.canAskAgain === false) {
      Alert.alert(
        'Konum İzni Kapalı',
        'Konum izni reddedildi. Check-in için Ayarlardan konum iznini açın.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Ayarları Aç', onPress: () => void Linking.openSettings() },
        ],
      );
      return;
    }

    try {
      const result = await requestForegroundLocation();
      if (!result.granted && result.canAskAgain === false) {
        Alert.alert(
          'Konum İzni Kapalı',
          'Konum izni verilmedi. Ayarlardan izni açabilirsiniz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    } catch (e) {
      console.warn('Konum izni', e);
      Alert.alert('Hata', 'Konum izni alınamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleCameraPermissionPress = async () => {
    if (!permission) return;

    // Daha önce kalıcı olarak reddedildiyse sistem penceresi çıkmaz; Ayarlar'a yönlendir.
    if (!permission.granted && permission.canAskAgain === false) {
      showAppDialog(
        'Kamera İzni Kapalı',
        'Kamera iznini daha önce reddettiniz. QR kod taramak için Ayarlar’dan kamera iznini açabilirsiniz.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Ayarları Aç', onPress: () => void Linking.openSettings() },
        ],
        'warning',
      );
      return;
    }

    // Üst üste modal (QR sayfası + özel diyalog) iOS’ta ikinci diyalogu yutabiliyor; doğrudan sistem iznini iste.
    try {
      const result = await requestPermission();
      if (!result.granted && result.canAskAgain === false) {
        showAppDialog(
          'Kamera İzni Kapalı',
          'Kamera izni verilmedi. Ayarlardan izni açabilirsiniz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => void Linking.openSettings() },
          ],
          'warning',
        );
      }
    } catch (e) {
      console.warn('Kamera izni', e);
      showAppDialog('Hata', 'Kamera izni alınamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    const nowMs = Date.now();
    // iOS/Android bazen arka arkaya aynı QR event'ini hızlıca basabiliyor.
    if (scanning) return;
    if (scanned && nowMs - lastScanAtRef.current < 1200) return;
    
    lastScanAtRef.current = nowMs;
    setScanned(true);
    setScanning(true);

    try {
      // Yanlis masa QR okutuldugunda backend'e check-in atmadan once net uyari ver.
      const [activeReservation, qrValidation] = await Promise.all([
        reservationsApi.getActive(),
        reservationsApi.validateQr(data),
      ]);

      if (!qrValidation?.isValid || !qrValidation.table) {
        showAppDialog('Yanlış QR Kodu', 'Bu QR kodu sisteme kayıtlı bir masaya ait değil.', [
          {
            text: 'Tamam',
            onPress: () => setScanned(false),
          },
        ]);
        return;
      }

      const reservedTableId = activeReservation?.tableId;
      if (reservedTableId && qrValidation.table.id !== reservedTableId) {
        const reservedTableNumber = activeReservation?.table?.tableNumber || '';
        showAppDialog(
          'Yanlış Masa QR Kodu',
          reservedTableNumber
            ? `Rezervasyonunuz ${reservedTableNumber} numaralı masa için. Lütfen kendi masanızın QR kodunu okutun.`
            : 'Okutulan QR kodu rezervasyon yaptığınız masaya ait değil. Lütfen kendi masanızın QR kodunu okutun.',
          [
            {
              text: 'Tamam',
              onPress: () => setScanned(false),
            },
          ],
          'warning',
        );
        return;
      }

      // Konum al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Check-in yap
      await reservationsApi.checkIn({
        qrCode: data,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracyMeters:
          typeof location.coords.accuracy === 'number' ? location.coords.accuracy : undefined,
      });

      // Diğer ekranları güncelle
      emitEvent(AppEvents.RESERVATION_CHANGED);
      emitEvent(AppEvents.STATS_CHANGED);

      showAppDialog(
        'Oturumunuz Başladı',
        'QR doğrulandı ve check-in tamamlandı. İyi çalışmalar!',
        [
          { 
            text: 'Tamam', 
            onPress: () => router.replace('/(tabs)/reservation')
          }
        ],
        'success',
      );
    } catch (error: any) {
      if (handleApiError(error)) {
        return;
      }
      const dialog = getCheckInErrorDialog(error);
      showAppDialog(dialog.title, dialog.message, [
        {
          text: 'Tamam',
          onPress: () => {
            setScanned(false);
          },
        },
      ], dialog.tone);
    } finally {
      setScanning(false);
      // Tarayicinin "takili kalmis" hissini engellemek icin otomatik re-arm
      setTimeout(() => setScanned(false), 450);
    }
  };

  // Kamera izni kontrolü
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={64} color={colors.textPrimary} />
        </View>
        <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          QR kod okutmak için kamera erişimine ihtiyacımız var.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleCameraPermissionPress}>
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (foregroundLocation === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={[styles.permissionText, { marginTop: 16 }]}>İzinler kontrol ediliyor…</Text>
      </View>
    );
  }

  if (!foregroundLocation.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="location-outline" size={64} color={colors.textPrimary} />
        </View>
        <Text style={styles.permissionTitle}>Konum İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          Masanıza yakın olduğunuzu doğrulamak için konum erişimine ihtiyacımız var.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          activeOpacity={0.85}
          hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
          onPress={() => void handleLocationPermissionPress()}
        >
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>
              Masadaki QR kodu çerçeve içine alın
            </Text>
          </View>

          {/* Middle with scanner frame */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scannerFrame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              
              {scanning && (
                <ActivityIndicator size="large" color={colors.success} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom */}
          <View style={styles.overlayBottom}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.textPrimary} />
              <Text style={styles.infoText}>
                Masanıza yakın olmalısınız (hedef mesafe yaklaşık 50 metre).
              </Text>
            </View>

            {scanned && !scanning && (
              <TouchableOpacity 
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.rescanButtonText}>Tekrar Tara</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>

      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 280,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
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
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  overlayBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    maxWidth: 320,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 30,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

