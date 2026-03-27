import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { getToken, verifySession } from '../api/auth';

type AuthTarget = 'login' | '(tabs)' | '(admin)';

/**
 * Uygulama giriş noktası (/). Expo Router web'de Stack.initialRouteName güvenilir olmadığı için
 * açılış her zaman burada doğrulanır ve login / (tabs) / (admin) yönlendirmesi yapılır.
 */
export default function Index() {
  const [target, setTarget] = useState<AuthTarget | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (cancelled) return;
      if (!token) {
        setTarget('login');
        return;
      }
      const user = await verifySession();
      if (cancelled) return;
      if (!user) {
        setTarget('login');
        return;
      }
      if (user.role === 'admin') {
        setTarget('(admin)');
      } else {
        setTarget('(tabs)');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (target === 'login') {
    return <Redirect href="/login" />;
  }
  if (target === '(admin)') {
    return <Redirect href="/(admin)" />;
  }
  return <Redirect href="/(tabs)" />;
}
