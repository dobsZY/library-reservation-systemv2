import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';
import { showAppDialog } from '../utils/appDialogController';

const SUPPORT_EMAIL = 'kutuphane.destek@example.edu.tr';
const SUPPORT_PHONE = '+90 332 000 00 00';
const FAQ_URL = 'https://example.com/library-help';

export default function HelpSupportScreen() {
  const openExternalLink = async (url: string, failMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        showAppDialog('Uyarı', failMessage, undefined, 'warning');
        return;
      }
      await Linking.openURL(url);
    } catch {
      showAppDialog('Hata', 'Bağlantı açılırken bir sorun oluştu.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="headset-outline" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Yardım Merkezi</Text>
            <Text style={styles.heroSubtitle}>
              Yaşadığın sorunu en hızlı şekilde çözmek için destek kanallarını kullanabilirsin.
            </Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.badgeText}>Yanıt: 24 saat</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.badgeText}>3 destek kanalı</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <ActionRow
          icon="mail-outline"
          title="E-posta ile destek"
          subtitle={SUPPORT_EMAIL}
          onPress={() =>
            void openExternalLink(
              `mailto:${SUPPORT_EMAIL}`,
              'E-posta uygulaması açılamadı.',
            )
          }
        />
        <View style={styles.divider} />
        <ActionRow
          icon="call-outline"
          title="Telefon desteği"
          subtitle={SUPPORT_PHONE}
          onPress={() =>
            void openExternalLink(
              `tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`,
              'Telefon uygulaması açılamadı.',
            )
          }
        />
        <View style={styles.divider} />
        <ActionRow
          icon="help-circle-outline"
          title="Sık Sorulan Sorular"
          subtitle="SSS sayfasını aç"
          onPress={() =>
            void openExternalLink(FAQ_URL, 'SSS bağlantısı açılamadı.')
          }
        />
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="information-circle-outline" size={18} color={colors.info} />
        <Text style={styles.tipText}>
          Destek talebinde öğrenci numaranı ve sorunun ekran görüntüsünü paylaşman çözüm sürecini hızlandırır.
        </Text>
      </View>
    </ScrollView>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  badgeRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  textWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
