import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { onEvent, AppEvents } from '../utils/events';
import { handleApiError } from '../utils/apiError';
import AppDialogHost from '../components/AppDialogHost';
import { getToken } from '../api/auth';
import { adminTheme } from '../constants/theme';

/** Web dahil tüm platformlarda açılışın `app/index.tsx` üzerinden yapılmasını zorunlu kılar. */
export const unstable_settings = {
  initialRouteName: 'index',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as Notifications.NotificationBehavior),
});

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Bildirim izni verilmedi');
        }
      } catch (e) {
        console.log('Bildirim izni hatası', e);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const handleNotificationNavigation = async (data: any) => {
      if (!data || (data.type !== 'extend_reminder' && data.type !== 'qr_deadline_reminder_15m')) return;
      const token = await getToken();
      if (!token) {
        router.replace({
          pathname: '/login',
          params: { redirect: '/(tabs)/reservation' },
        });
        return;
      }
      router.replace('/(tabs)/reservation');
    };

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleNotificationNavigation(response.notification.request.content.data);
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      void handleNotificationNavigation(response.notification.request.content.data);
    });

    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const unsub = onEvent(AppEvents.UNAUTHORIZED, () => {
      handleApiError({ message: 'Oturum süreniz sona erdi', status: 401 });
    });

    return () => unsub();
  }, []);

  return (
    <>
      <AppDialogHost />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Giriş', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(staff)" options={{ headerShown: false }} />
        <Stack.Screen name="notification-settings" options={{ title: 'Bildirim Ayarları' }} />
        <Stack.Screen name="help-support" options={{ title: 'Yardım & Destek' }} />
        <Stack.Screen
          name="hall/[id]"
          options={{
            title: 'Salon Detayı',
            // "card" iOS'ta kenarlardan boşluk/border-radius ile görünebiliyor.
            // Tam ekrana oturması için modal kullanıyoruz.
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="qr-scan" options={{ title: 'QR Kod Tara', presentation: 'modal' }} />
        <Stack.Screen
          name="table-qr-desk"
          options={{ title: 'Masa QR Kontrolü', presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="masa-kontrol"
          options={{
            title: 'Masa kontrolü',
            headerStyle: { backgroundColor: adminTheme.headerBackground },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
      </Stack>
    </>
  );
}

