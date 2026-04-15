import { useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminTheme, colors, borderRadius, spacing, shadows } from '../constants/theme';

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const WEEKDAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

/** ISO 8601 week number for local calendar date (week starts Monday). */
function isoWeekNumber(y: number, m: number, d: number): number {
  const date = new Date(y, m, d, 12, 0, 0, 0);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function ymdParts(d: Date): { y: number; m: number; day: number } {
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
}

function formatYmd(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function parseYmd(ymd: string): { y: number; m: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return { y, m: mo, day: d };
}

export type SingleDatePickerHandle = { open: () => void };

type Props = {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  placeholder?: string;
  /** Admin ekranlarında bordo vurgu */
  accent?: 'student' | 'admin';
};

export const SingleDatePicker = forwardRef<SingleDatePickerHandle, Props>(
  function SingleDatePicker(
    { label, value, onChange, placeholder = 'Tarih Seçiniz', accent = 'student' },
    ref,
  ) {
    const isAdmin = accent === 'admin';
    const [open, setOpen] = useState(false);
    const parsed = value ? parseYmd(value) : null;
    const [viewY, setViewY] = useState(() => parsed?.y ?? new Date().getFullYear());
    const [viewM, setViewM] = useState(() => parsed?.m ?? new Date().getMonth());

    useImperativeHandle(ref, () => ({
      open: () => {
        if (parsed) {
          setViewY(parsed.y);
          setViewM(parsed.m);
        } else {
          const t = new Date();
          setViewY(t.getFullYear());
          setViewM(t.getMonth());
        }
        setOpen(true);
      },
    }));

    const displayText = useMemo(() => {
      if (!value) return null;
      const p = parseYmd(value);
      if (!p) return null;
      return new Date(p.y, p.m, p.day, 12, 0, 0, 0).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }, [value]);

    const weeks = useMemo(() => {
      const first = new Date(viewY, viewM, 1, 12, 0, 0, 0);
      const mondayOffset = (first.getDay() + 6) % 7;
      const gridStart = new Date(viewY, viewM, 1 - mondayOffset, 12, 0, 0, 0);

      const rows: { weekNum: number; days: { y: number; m: number; d: number; inMonth: boolean }[] }[] = [];
      let cursor = new Date(gridStart);
      for (let w = 0; w < 6; w++) {
        const monday = new Date(cursor);
        const { y: wy, m: wm, day: wd } = ymdParts(monday);
        const weekNum = isoWeekNumber(wy, wm, wd);
        const days: { y: number; m: number; d: number; inMonth: boolean }[] = [];
        for (let d = 0; d < 7; d++) {
          const { y, m, day } = ymdParts(cursor);
          days.push({
            y,
            m,
            d: day,
            inMonth: m === viewM && y === viewY,
          });
          cursor.setDate(cursor.getDate() + 1);
        }
        rows.push({ weekNum, days });
      }
      return rows;
    }, [viewY, viewM]);

    const openModal = () => {
      if (parsed) {
        setViewY(parsed.y);
        setViewM(parsed.m);
      } else {
        const t = new Date();
        setViewY(t.getFullYear());
        setViewM(t.getMonth());
      }
      setOpen(true);
    };

    const shiftMonth = (delta: number) => {
      const d = new Date(viewY, viewM + delta, 1, 12, 0, 0, 0);
      setViewY(d.getFullYear());
      setViewM(d.getMonth());
    };

    const shiftYear = (delta: number) => {
      setViewY((y) => y + delta);
    };

    const selectDay = (y: number, m: number, d: number) => {
      onChange(formatYmd(y, m, d));
      setOpen(false);
    };

    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.inputOuter,
            isAdmin && {
              backgroundColor: adminTheme.primaryLight,
              borderWidth: 1,
              borderColor: 'rgba(139, 26, 26, 0.14)',
            },
          ]}
          onPress={openModal}
          activeOpacity={0.85}
        >
          <Text style={[styles.inputText, !displayText && styles.placeholder]}>
            {displayText ?? placeholder}
          </Text>
        </TouchableOpacity>

        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.popover} onPress={(e) => e.stopPropagation()}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={12}>
                  <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                  <Text style={styles.monthName}>{MONTHS_TR[viewM]}</Text>
                  <View style={styles.yearBlock}>
                    <Text style={styles.yearText}>{viewY}</Text>
                    <View style={styles.yearStepper}>
                      <TouchableOpacity onPress={() => shiftYear(1)} hitSlop={8}>
                        <Ionicons name="chevron-up" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => shiftYear(-1)} hitSlop={8}>
                        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={12}>
                  <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.gridHeaderRow}>
                <View style={styles.weekColHeader}>
                  <Text style={styles.weekColHeaderText}>Hft</Text>
                </View>
                <View style={styles.sepVertical} />
                <View style={styles.dayHeaders}>
                  {WEEKDAYS_TR.map((abbr) => (
                    <Text key={abbr} style={styles.dayHead}>
                      {abbr}
                    </Text>
                  ))}
                </View>
              </View>

              {weeks.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  <View style={styles.weekCol}>
                    <Text style={styles.weekNum}>{row.weekNum}</Text>
                  </View>
                  <View style={styles.sepVertical} />
                  <View style={styles.daysRow}>
                    {row.days.map((cell, di) => {
                      const ymd = formatYmd(cell.y, cell.m, cell.d);
                      const selected = value === ymd;
                      return (
                        <TouchableOpacity
                          key={`${ri}-${di}`}
                          style={styles.dayCell}
                          onPress={() => selectDay(cell.y, cell.m, cell.d)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.dayInner,
                              selected &&
                                (isAdmin ? styles.daySelectedAdmin : styles.daySelectedStudent),
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                !cell.inMonth && styles.dayMuted,
                                selected &&
                                  (isAdmin
                                    ? styles.dayTextSelectedAdmin
                                    : styles.dayTextSelectedStudent),
                              ]}
                            >
                              {cell.d}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputOuter: {
    backgroundColor: '#E8EDF3',
    borderRadius: borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  inputText: { fontSize: 15, color: colors.textPrimary },
  placeholder: { color: colors.textMuted },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: spacing.lg,
  },
  popover: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  yearBlock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  yearText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  yearStepper: { justifyContent: 'center' },

  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weekColHeader: { width: 28, alignItems: 'center' },
  weekColHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sepVertical: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dayHeaders: {
    flex: 1,
    flexDirection: 'row',
  },
  dayHead: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  weekCol: { width: 28, alignItems: 'center', justifyContent: 'center' },
  weekNum: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  daysRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInner: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectedStudent: {
    backgroundColor: colors.primary,
  },
  daySelectedAdmin: {
    backgroundColor: adminTheme.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayMuted: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
  dayTextSelectedStudent: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  dayTextSelectedAdmin: {
    color: colors.white,
    fontWeight: '700',
  },
});
