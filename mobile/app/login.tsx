import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../api/auth';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!studentNumber || !password) {
      setError('Kullanıcı adı / öğrenci numarası ve şifre zorunludur.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await login(studentNumber.trim(), password);
      if (typeof redirect === 'string' && redirect.length > 0) {
        router.replace(redirect as any);
        return;
      }
      if (res.user.role === 'admin') {
        router.replace('/(admin)');
      } else if (res.user.role === 'staff') {
        router.replace('/(staff)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      const msg = e?.message || 'Giriş başarısız. Lütfen tekrar deneyin.';
      setError(msg);
      if (msg.includes('aktif bir oturum')) {
        // aktif oturum mesajı backend ile uyumlu
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name="library" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Selçuk Kütüphane</Text>
        <Text style={styles.subtitle}>Öğrenci / personel / yönetici girişi</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Öğrenci numarası veya kullanıcı adı</Text>
          <TextInput
            style={styles.input}
            value={studentNumber}
            onChangeText={setStudentNumber}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
    marginTop: spacing.xl,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    flex: 1,
  },
});

