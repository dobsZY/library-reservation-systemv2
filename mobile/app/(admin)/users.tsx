import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../api/auth';
import { adminApi, AdminUser, AdminUserRole } from '../../api/admin';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';

const USER_ROLE_SECTIONS = [
  { role: 'admin', title: 'Yöneticiler' },
  { role: 'staff', title: 'Personeller' },
  { role: 'student', title: 'Öğrenciler' },
] as const;

/** Rol butonu — görseldeki açık mavi hap stili (admin bordo temasından ayrı) */
const ROLE_ACTION_BLUE_BG = '#E1F5FE';
const ROLE_ACTION_BLUE_FG = '#0277BD';

const ROLE_OPTIONS: { value: AdminUserRole; label: string; hint: string }[] = [
  { value: 'student', label: 'Öğrenci', hint: 'Rezervasyon ve öğrenci ekranları' },
  { value: 'staff', label: 'Personel', hint: 'Kütüphane personeli' },
  { value: 'admin', label: 'Yönetici', hint: 'Tam yetki' },
];

function roleLabelTr(role: string): string {
  const r = role.toLowerCase();
  if (r === 'admin') return 'Yönetici';
  if (r === 'staff') return 'Personel';
  return 'Öğrenci';
}

function userMatchesSearch(u: AdminUser, queryTrimmed: string): boolean {
  if (!queryTrimmed) return true;
  const n = queryTrimmed.toLocaleLowerCase('tr-TR');
  const name = (u.fullName || '').toLocaleLowerCase('tr-TR');
  const num = (u.studentNumber || '').toLocaleLowerCase('tr-TR');
  return name.includes(n) || num.includes(n);
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rolePickerUser, setRolePickerUser] = useState<AdminUser | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void getCurrentUser().then((u) => setCurrentUserId(u?.id ?? null));
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const performForceLogout = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      await adminApi.forceLogout(user.id);
      showAppDialog(
        'Başarılı',
        `${user.fullName} için sunucudaki oturumlar kapatıldı. Kullanıcı bir sonraki işlemde oturumunun düştüğünü görecek.`,
      );
      await fetchUsers();
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'İşlem başarısız.');
    } finally {
      setActionLoading(null);
    }
  };

  const performRoleUpdate = async (user: AdminUser, newRole: AdminUserRole) => {
    setRoleUpdatingId(user.id);
    try {
      await adminApi.updateUserRole(user.id, newRole);
      showAppDialog(
        'Başarılı',
        'Rol güncellendi. Kullanıcının oturumları kapatıldı; yeni yetki için yeniden giriş yapması gerekir.',
      );
      await fetchUsers();
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Rol güncellenemedi.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const confirmRoleChange = (user: AdminUser, newRole: AdminUserRole) => {
    const opt = ROLE_OPTIONS.find((o) => o.value === newRole);
    const label = opt?.label ?? newRole;
    setRolePickerUser(null);
    showAppDialog(
      'Rolü güncelle',
      `${user.fullName} kullanıcısı "${label}" rolüne alınacak. Mevcut oturumları sonlanır; kullanıcı yeniden giriş yapmalıdır.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => void performRoleUpdate(user, newRole),
        },
      ],
      'warning',
    );
  };

  const handleForceLogout = (user: AdminUser) => {
    const msg = `${user.fullName} (${user.studentNumber}) kullanıcısının tüm oturumları sonlandırılacak. Devam edilsin mi?`;

    showAppDialog(
      'Oturumu Sonlandır',
      msg,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sonlandır',
          style: 'destructive',
          onPress: () => void performForceLogout(user),
        },
      ],
      'warning',
    );
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return users;
    return users.filter((u) => userMatchesSearch(u, q));
  }, [users, searchQuery]);

  const userSections = useMemo(() => {
    const known = new Set(USER_ROLE_SECTIONS.map((s) => s.role));
    const base = USER_ROLE_SECTIONS.map(({ role, title }) => ({
      title,
      data: filteredUsers.filter((u) => u.role.toLowerCase() === role),
    })).filter((s) => s.data.length > 0);

    const other = filteredUsers.filter((u) => !known.has(u.role.toLowerCase()));
    if (other.length > 0) {
      base.push({ title: 'Diğer', data: other });
    }
    return base;
  }, [filteredUsers]);

  const searchHeader = (
    <View style={styles.searchWrap}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="İsim, soyisim veya öğrenci numarası"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10} accessibilityLabel="Aramayı temizle">
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const avatarForRole = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') {
      return {
        bg: adminTheme.primaryLight,
        icon: 'shield' as const,
        color: adminTheme.primary,
      };
    }
    if (r === 'staff') {
      return {
        bg: '#E0E7FF',
        icon: 'briefcase-outline' as const,
        color: '#4338CA',
      };
    }
    return {
      bg: colors.primaryLight,
      icon: 'person' as const,
      color: colors.primary,
    };
  };

  const renderUser = ({ item }: { item: AdminUser }) => {
    const av = avatarForRole(item.role);
    return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: av.bg }]}>
          <Ionicons name={av.icon} size={20} color={av.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.sub}>
            {item.studentNumber} · {roleLabelTr(item.role)}
          </Text>
        </View>
        <View style={styles.badges}>
          {item.hasActiveSession && (
            <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.badgeText, { color: '#16A34A' }]}>Aktif</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        {item.id !== currentUserId ? (
          <TouchableOpacity
            style={styles.roleBtn}
            onPress={() => setRolePickerUser(item)}
            disabled={roleUpdatingId === item.id || actionLoading === item.id}
          >
            {roleUpdatingId === item.id ? (
              <ActivityIndicator size="small" color={ROLE_ACTION_BLUE_FG} />
            ) : (
              <>
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={ROLE_ACTION_BLUE_FG}
                  style={styles.roleBtnKeyIcon}
                />
                <Text style={styles.roleBtnText}>Rolü Değiştir</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
        {item.hasActiveSession ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleForceLogout(item)}
            disabled={actionLoading === item.id || roleUpdatingId === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color={adminTheme.primary} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={16} color={adminTheme.primary} />
                <Text style={styles.actionText}>Oturumu Sonlandır</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; data: AdminUser[] };
  }) => {
    const isFirst = userSections[0]?.title === section.title;
    return (
      <View style={[styles.sectionHeader, isFirst && styles.sectionHeaderFirst]}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={adminTheme.primary} />
      </View>
    );
  }

  return (
    <>
      <SectionList
        sections={userSections}
        keyExtractor={(u) => u.id}
        renderItem={renderUser}
        renderSectionHeader={renderSectionHeader}
        style={styles.container}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={searchHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[adminTheme.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? 'Aramanızla eşleşen kullanıcı yok.'
                : 'Kullanıcı bulunamadı.'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!rolePickerUser}
        animationType="slide"
        transparent
        onRequestClose={() => setRolePickerUser(null)}
      >
        <Pressable style={styles.roleModalBackdrop} onPress={() => setRolePickerUser(null)}>
          <Pressable style={styles.roleModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.roleModalHeader}>
              <Text style={styles.roleModalTitle}>Rol Seçimi</Text>
              <TouchableOpacity onPress={() => setRolePickerUser(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {rolePickerUser ? (
              <Text style={styles.roleModalSubtitle} numberOfLines={2}>
                {rolePickerUser.fullName} · şu an: {roleLabelTr(rolePickerUser.role)}
              </Text>
            ) : null}
            {ROLE_OPTIONS.map((opt) => {
              const current = rolePickerUser?.role.toLowerCase() === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.roleOption, current && styles.roleOptionCurrent]}
                  onPress={() => {
                    if (!rolePickerUser || current) return;
                    confirmRoleChange(rolePickerUser, opt.value);
                  }}
                  disabled={!rolePickerUser || current}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roleOptionLabel, current && styles.roleOptionLabelCurrent]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.roleOptionHint, current && styles.roleOptionHintCurrent]}>
                    {opt.hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: 40 },
  searchWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHeaderFirst: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: adminTheme.primary,
    letterSpacing: 0.2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: ROLE_ACTION_BLUE_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(2, 119, 189, 0.12)',
  },
  roleBtnKeyIcon: {
    marginRight: 2,
    transform: [{ rotate: '-35deg' }],
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ROLE_ACTION_BLUE_FG,
    letterSpacing: 0.1,
    lineHeight: 17,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: adminTheme.primaryLight,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: adminTheme.primary },
  roleModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  roleModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.md,
  },
  roleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  roleModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: adminTheme.primary,
  },
  roleModalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  roleOption: {
    alignItems: 'center',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  roleOptionCurrent: {
    backgroundColor: adminTheme.primaryLight,
    borderColor: adminTheme.primary,
    borderWidth: 2,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  roleOptionLabelCurrent: {
    color: adminTheme.primary,
  },
  roleOptionHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 17,
  },
  roleOptionHintCurrent: {
    color: adminTheme.primary,
    opacity: 0.88,
  },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.md },
});
