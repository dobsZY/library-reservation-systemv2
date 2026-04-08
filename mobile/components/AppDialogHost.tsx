import { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  registerAppDialogHost,
  type ShowAppDialogArgs,
  type AppDialogButton,
  toneAccentColor,
} from '../utils/appDialogController';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_MAX = Math.min(400, SCREEN_W * 0.9);

export default function AppDialogHost() {
  const [args, setArgs] = useState<ShowAppDialogArgs | null>(null);

  useEffect(() => {
    registerAppDialogHost((next) => setArgs(next));
    return () => registerAppDialogHost(null);
  }, []);

  const close = useCallback(() => setArgs(null), []);

  const onButtonPress = useCallback((btn: AppDialogButton) => {
    const fn = btn.onPress;
    if (fn) {
      try {
        fn();
      } catch (e) {
        console.warn('AppDialogHost onPress', e);
      }
    }
    setArgs(null);
  }, []);

  if (!args) {
    return null;
  }

  const tone = args.tone ?? 'default';
  const accent = toneAccentColor(tone);
  const buttons = args.buttons ?? [{ text: 'Tamam' }];
  const message = args.message?.trim() ?? '';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
      {...Platform.select({
        ios: { presentationStyle: 'overFullScreen' as const },
        default: {},
      })}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { width: CARD_MAX }]}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <View style={styles.cardInner}>
            <Text style={styles.title}>{args.title}</Text>
            {message.length > 0 ? <Text style={styles.message}>{args.message}</Text> : null}
            <View
              style={[
                styles.buttonRow,
                buttons.length === 1 ? styles.buttonRowSingle : null,
              ]}
            >
              {buttons.map((btn, i) => (
                <TouchableOpacity
                  key={`${btn.text}-${i}`}
                  activeOpacity={0.88}
                  style={[
                    styles.buttonBase,
                    buttons.length > 1 ? styles.buttonFlex : styles.buttonFull,
                    buttonVariantStyle(btn.style),
                  ]}
                  onPress={() => onButtonPress(btn)}
                >
                  <Text
                    style={[styles.buttonLabel, buttonLabelStyle(btn.style)]}
                    numberOfLines={2}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buttonVariantStyle(style: AppDialogButton['style']) {
  if (style === 'cancel') {
    return {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    };
  }
  if (style === 'destructive') {
    return { backgroundColor: colors.danger };
  }
  return {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  };
}

function buttonLabelStyle(style: AppDialogButton['style']) {
  if (style === 'cancel') {
    return { color: colors.textPrimary };
  }
  if (style === 'destructive') {
    return { color: colors.white };
  }
  return { color: colors.textPrimary };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    ...shadows.lg,
    ...Platform.select({
      android: { elevation: 12 },
      default: {},
    }),
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  cardInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: '#FFFCF5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonRowSingle: {
    flexDirection: 'column',
  },
  buttonBase: {
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonFlex: {
    flex: 1,
    minWidth: 0,
  },
  buttonFull: {
    width: '100%',
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
