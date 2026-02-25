import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

export default function ProfileScreen() {
  // Demo kullanıcı bilgisi
  const user = {
    name: 'DOĞUKAAN YAZICI',
    studentId: '223301075',
    faculty: 'Teknoloji Fakültesi',
    email: '223301075@ogr.selcuk.edu.tr',
    totalReservations: 24,
    completedReservations: 22,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profil Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={colors.textMuted} />
          </View>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
      </View>

      {/* Bilgi Kartları */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="card-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Öğrenci Numarası</Text>
            <Text style={styles.infoValue}>{user.studentId}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="school-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fakülte / MYO</Text>
            <Text style={styles.infoValue}>{user.faculty}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>E-Posta</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Kütüphane İstatistiklerim</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.statNumber}>{user.totalReservations}</Text>
            <Text style={styles.statLabel}>Toplam{'\n'}Rezervasyon</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{user.completedReservations}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
            <Text style={[styles.statNumber, { color: colors.info }]}>
              %{Math.round((user.completedReservations / user.totalReservations) * 100)}
            </Text>
            <Text style={styles.statLabel}>Başarı{'\n'}Oranı</Text>
          </View>
        </View>
      </View>

      {/* Menü */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.menuLabel}>Rezervasyon Geçmişi</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.menuLabel}>Bildirim Ayarları</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.menuLabel}>Yardım & Destek</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
  
  // Header
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Info Section
  infoSection: {
    backgroundColor: colors.white,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },

  // Stats
  statsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Menu
  menuSection: {
    backgroundColor: colors.white,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
