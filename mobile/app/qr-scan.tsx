import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reservationsApi } from '../api/reservations';

const DEMO_USER_ID = 'user-001';

export default function QRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || scanning) return;
    
    setScanned(true);
    setScanning(true);

    try {
      // Konum al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Check-in yap
      await reservationsApi.checkIn({
        reservationId: 'demo-res-001', // Gerçek uygulamada aktif rezervasyondan alınır
        qrCode: data,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      Alert.alert(
        'Başarılı! ✓',
        'Masanıza giriş yapıldı. İyi çalışmalar!',
        [
          { 
            text: 'Tamam', 
            onPress: () => router.replace('/reservation')
          }
        ]
      );
    } catch (error: any) {
      // Demo başarılı göster
      Alert.alert(
        'Başarılı! ✓',
        'Masanıza giriş yapıldı. İyi çalışmalar!',
        [
          { 
            text: 'Tamam', 
            onPress: () => router.replace('/reservation')
          }
        ]
      );
    } finally {
      setScanning(false);
    }
  };

  // Kamera izni kontrolü
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={64} color="#1e3a5f" />
        </View>
        <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          QR kod okutmak için kamera erişimine ihtiyacımız var.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (locationPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="location-outline" size={64} color="#1e3a5f" />
        </View>
        <Text style={styles.permissionTitle}>Konum İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          Masanıza yakın olduğunuzu doğrulamak için konum erişimine ihtiyacımız var.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={checkLocationPermission}
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
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
                <ActivityIndicator size="large" color="#22c55e" />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom */}
          <View style={styles.overlayBottom}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#1e3a5f" />
              <Text style={styles.infoText}>
                Masanızdan en fazla 50 metre uzaklıkta olmalısınız.
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
    borderColor: '#22c55e',
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
    backgroundColor: '#1e3a5f',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 30,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

