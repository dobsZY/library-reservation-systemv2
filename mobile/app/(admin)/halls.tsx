import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminHall, AdminTable } from '../../api/admin';
import { adminTheme, colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { handleApiError } from '../../utils/apiError';
import { showAppDialog } from '../../utils/appDialogController';
import { useBackofficeCapabilities } from '../../context/BackofficeCapabilitiesContext';

export default function AdminHallsScreen() {
  const { allowTableEdit } = useBackofficeCapabilities();
  const [halls, setHalls] = useState<AdminHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedHall, setSelectedHall] = useState<AdminHall | null>(null);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [editingTable, setEditingTable] = useState<AdminTable | null>(null);
  const [editForm, setEditForm] = useState({ positionX: '', positionY: '', width: '', height: '' });
  const [saving, setSaving] = useState(false);

  const fetchHalls = useCallback(async () => {
    try {
      const data = await adminApi.getHalls();
      setHalls(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Salonlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHalls();
  };

  const selectHall = async (hall: AdminHall) => {
    setSelectedHall(hall);
    setTablesLoading(true);
    try {
      const data = await adminApi.getHallTables(hall.id);
      setTables(data);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Masalar yüklenemedi.');
    } finally {
      setTablesLoading(false);
    }
  };

  const openEdit = (table: AdminTable) => {
    setEditingTable(table);
    setEditForm({
      positionX: String(table.positionX ?? 0),
      positionY: String(table.positionY ?? 0),
      width: String(table.width ?? 50),
      height: String(table.height ?? 50),
    });
  };

  const handleSave = async () => {
    if (!editingTable) return;
    setSaving(true);
    try {
      await adminApi.updateTable(editingTable.id, {
        positionX: parseFloat(editForm.positionX) || 0,
        positionY: parseFloat(editForm.positionY) || 0,
        width: parseFloat(editForm.width) || 50,
        height: parseFloat(editForm.height) || 50,
      });
      showAppDialog('Başarılı', 'Masa güncellendi.');
      setEditingTable(null);
      if (selectedHall) selectHall(selectedHall);
    } catch (e: any) {
      if (handleApiError(e)) return;
      showAppDialog('Hata', e?.message || 'Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  // ── Hall List ──
  if (!selectedHall) {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={adminTheme.primary} />
        </View>
      );
    }
    return (
      <FlatList
        data={halls}
        keyExtractor={(h) => h.id}
        style={styles.container}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[adminTheme.primary]} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.hallCard} onPress={() => selectHall(item)}>
            <View style={styles.hallIcon}>
              <Ionicons name="business-outline" size={22} color={adminTheme.primary} />
            </View>
            <View style={styles.hallInfo}>
              <Text style={styles.hallName}>{item.name}</Text>
              <Text style={styles.hallSub}>Kat {item.floor}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Salon bulunamadı</Text>
          </View>
        }
      />
    );
  }

  // ── Table List ──
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backRow} onPress={() => setSelectedHall(null)}>
        <Ionicons name="arrow-back" size={20} color={adminTheme.primary} />
        <Text style={styles.backText}>Salonlara Dön</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{selectedHall.name} – Masalar</Text>

      {tablesLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={adminTheme.primary} />
        </View>
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableNum}>Masa {item.tableNumber}</Text>
                {allowTableEdit ? (
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 24 }} />
                )}
              </View>
              <Text style={styles.tableDetail}>
                Konum: ({item.positionX}, {item.positionY}) · Boyut: {item.width}×{item.height}
              </Text>
              {item.features.length > 0 && (
                <View style={styles.featureRow}>
                  {item.features.map((f) => (
                    <View key={f.id} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{f.icon} {f.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="grid-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Masa bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Edit Modal — yalnızca yönetici */}
      <Modal visible={allowTableEdit && !!editingTable} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Masa {editingTable?.tableNumber} Düzenle</Text>

              {(['positionX', 'positionY', 'width', 'height'] as const).map((field) => (
                <View key={field} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={editForm[field]}
                    onChangeText={(v) => setEditForm((prev) => ({ ...prev, [field]: v }))}
                    keyboardType="numeric"
                  />
                </View>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingTable(null)}>
                  <Text style={styles.modalCancelText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  hallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  hallIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: adminTheme.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  hallInfo: { flex: 1 },
  hallName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  hallSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  backText: { fontSize: 14, fontWeight: '600', color: adminTheme.primary },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  tableCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableNum: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  tableDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  featureText: { fontSize: 11, color: colors.textPrimary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.md },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: adminTheme.primary,
    alignItems: 'center',
  },
  modalSaveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
