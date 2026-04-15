import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function MasaKontrolScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Masaları izlemek ve rezervasyonları yönetmek için aşağıdaki kısayolları kullanabilirsiniz. Masadaki QR
        kodunu okutmak için alttaki <Text style={styles.bold}>QR Tara</Text> sekmesine geçin.
      </Text>

      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push('/(admin)/halls')}
      >
        <View style={[styles.rowIcon, { backgroundColor: adminTheme.primaryLight }]}>
          <Ionicons name="grid-outline" size={22} color={adminTheme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Salon ve masa yerleşimi</Text>
          <Text style={styles.rowSub}>Kroki ve masa düzenini aç</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push('/(admin)/reservations' as any)}
      >
        <View style={[styles.rowIcon, { backgroundColor: colors.successLight }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.success} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Rezervasyonlar</Text>
          <Text style={styles.rowSub}>Tüm rezervasyon kayıtları</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push('/(admin)/users' as any)}
      >
        <View style={[styles.rowIcon, { backgroundColor: colors.infoLight }]}>
          <Ionicons name="people-outline" size={22} color={colors.info} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Kullanıcılar</Text>
          <Text style={styles.rowSub}>Rol ve oturum yönetimi</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  bold: { fontWeight: '700', color: adminTheme.primary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
