import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';
import { showAppDialog } from '../utils/appDialogController';

type NotificationPrefs = {
  reservationReminders: boolean;
  qrDeadlineReminder: boolean;
  announcements: boolean;
};

const PREFS_KEY = 'notification_preferences_v1';

const DEFAULT_PREFS: NotificationPrefs = {
  reservationReminders: true,
  qrDeadlineReminder: true,
  announcements: true,
};

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  const permissionText = useMemo(
    () => (permissionGranted ? 'Açık' : 'Kapalı'),
    [permissionGranted],
  );
  const enabledCount = useMemo(
    () => Object.values(prefs).filter(Boolean).length,
    [prefs],
  );

  const loadData = useCallback(async () => {
    try {
      const [permission, storedPrefs] = await Promise.all([
        Notifications.getPermissionsAsync(),
        AsyncStorage.getItem(PREFS_KEY),
      ]);

      setPermissionGranted(permission.status === 'granted');

      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs) as Partial<NotificationPrefs>;
        setPrefs({
          reservationReminders:
            typeof parsed.reservationReminders === 'boolean'
              ? parsed.reservationReminders
              : DEFAULT_PREFS.reservationReminders,
          qrDeadlineReminder:
            typeof parsed.qrDeadlineReminder === 'boolean'
              ? parsed.qrDeadlineReminder
              : DEFAULT_PREFS.qrDeadlineReminder,
          announcements:
            typeof parsed.announcements === 'boolean'
              ? parsed.announcements
              : DEFAULT_PREFS.announcements,
        });
      } else {
        setPrefs(DEFAULT_PREFS);
      }
    } catch {
      showAppDialog('Hata', 'Bildirim ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const persistPrefs = async (next: NotificationPrefs) => {
    try {
      setPrefs(next);
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      showAppDialog('Hata', 'Ayarlar kaydedilemedi.');
    }
  };

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    void persistPrefs(next);
  };

  const requestPermission = async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === 'granted') {
        setPermissionGranted(true);
        showAppDialog('Bilgi', 'Bildirim izni zaten açık.');
        return;
      }

      const requested = await Notifications.requestPermissionsAsync();
      const granted = requested.status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        showAppDialog(
          'Uyarı',
          Platform.OS === 'ios'
            ? 'Bildirim izni verilmedi. Ayarlar uygulamasından bildirimleri açabilirsiniz.'
            : 'Bildirim izni verilmedi. Cihaz ayarlarından bildirimleri açabilirsiniz.',
          undefined,
          'warning',
        );
        return;
      }

      showAppDialog('Başarılı', 'Bildirim izni açıldı.');
    } catch {
      showAppDialog('Hata', 'Bildirim izni alınırken bir sorun oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="notifications" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Bildirim Tercihleri</Text>
            <Text style={styles.heroSubtitle}>
              Hatırlatma ve bilgilendirme bildirimlerini buradan yönetebilirsin.
            </Text>
          </View>
        </View>
        <View style={styles.heroStatsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Aktif Tercih</Text>
            <Text style={styles.statPillValue}>{enabledCount}/3</Text>
          </View>
          <View
            style={[
              styles.permissionPill,
              permissionGranted ? styles.permissionPillOpen : styles.permissionPillClosed,
            ]}
          >
            <Text
              style={[
                styles.permissionPillText,
                permissionGranted ? styles.permissionPillTextOpen : styles.permissionPillTextClosed,
              ]}
            >
              İzin: {permissionText}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.permissionHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primaryDark} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Sistem Bildirim İzni</Text>
            <Text style={styles.rowDesc}>
              Uygulamanın sana uyarı gönderebilmesi için bildirim izni açık olmalıdır.
            </Text>
          </View>
        </View>
        {!permissionGranted && (
          <TouchableOpacity style={styles.permissionBtn} onPress={() => void requestPermission()}>
            <Text style={styles.permissionBtnText}>İzin Ver</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bildirim Türleri</Text>
        <SettingRow
          icon="time-outline"
          title="Rezervasyon süre hatırlatmaları"
          description="Süre bitimine yakın hatırlatma bildirimleri al."
          value={prefs.reservationReminders}
          onValueChange={(v) => updatePref('reservationReminders', v)}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="qr-code-outline"
          title="QR check-in son uyarısı"
          description="QR giriş son süresi yaklaşınca uyarı gönder."
          value={prefs.qrDeadlineReminder}
          onValueChange={(v) => updatePref('qrDeadlineReminder', v)}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="megaphone-outline"
          title="Duyuru bildirimleri"
          description="Kütüphane duyuru ve bilgilendirme bildirimleri al."
          value={prefs.announcements}
          onValueChange={(v) => updatePref('announcements', v)}
        />
      </View>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIconWrap, value && styles.settingIconWrapActive]}>
        <Ionicons
          name={icon}
          size={18}
          color={value ? colors.primaryDark : colors.textSecondary}
        />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
  heroStatsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  statPillLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statPillValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionPill: {
    flex: 1,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  permissionPillOpen: {
    backgroundColor: colors.successLight,
  },
  permissionPillClosed: {
    backgroundColor: colors.dangerLight,
  },
  permissionPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  permissionPillTextOpen: {
    color: colors.successDark,
  },
  permissionPillTextClosed: {
    color: colors.danger,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowDesc: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  openText: {
    color: colors.successDark,
    fontWeight: '700',
  },
  closedText: {
    color: colors.danger,
    fontWeight: '700',
  },
  permissionBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  permissionBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  settingIconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingDesc: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
