import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminUser } from '../../api/admin';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const renderUser = ({ item }: { item: AdminUser }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: item.role === 'admin' ? adminTheme.primaryLight : colors.primaryLight }]}>
          <Ionicons
            name={item.role === 'admin' ? 'shield' : 'person'}
            size={20}
            color={item.role === 'admin' ? adminTheme.primary : colors.primary}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.sub}>{item.studentNumber} · {item.role.toUpperCase()}</Text>
        </View>
        <View style={styles.badges}>
          {item.hasActiveSession && (
            <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.badgeText, { color: '#16A34A' }]}>Aktif</Text>
            </View>
          )}
        </View>
      </View>
      {item.hasActiveSession && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleForceLogout(item)}
          disabled={actionLoading === item.id}
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
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={adminTheme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(u) => u.id}
      renderItem={renderUser}
      style={styles.container}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[adminTheme.primary]} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 40 },
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: adminTheme.primaryLight,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: adminTheme.primary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.md },
});
