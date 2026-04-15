import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { staffBackofficeTheme } from '../../constants/staffTheme';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

const t = staffBackofficeTheme;

export default function StaffMasaKontrolScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Salonları ve rezervasyonları görüntüleyin. Masadaki QR kodunu okutmak için alttaki{' '}
        <Text style={styles.bold}>QR Tara</Text> sekmesini kullanın.
      </Text>

      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push('/(staff)/halls' as any)}
      >
        <View style={[styles.rowIcon, { backgroundColor: t.primaryLight }]}>
          <Ionicons name="grid-outline" size={22} color={t.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Salon ve masalar</Text>
          <Text style={styles.rowSub}>Salt görüntüleme</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push('/(staff)/reservations' as any)}
      >
        <View style={[styles.rowIcon, { backgroundColor: colors.successLight }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.success} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Rezervasyonlar</Text>
          <Text style={styles.rowSub}>Liste (iptal yok)</Text>
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
  bold: { fontWeight: '700', color: t.primary },
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
