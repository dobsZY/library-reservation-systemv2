import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:library_reservation_flutter/src/core/config/brand_theme.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_controller.dart';
import 'package:library_reservation_flutter/src/features/shared/api_services.dart';

final adminOverviewProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.watch(adminServiceProvider).getOverview(),
);

final adminReservationsProvider = FutureProvider.family<List<Map<String, dynamic>>, String?>(
  (ref, status) => ref.watch(adminServiceProvider).getReservations(status: status),
);

final adminUsersProvider = FutureProvider<List<Map<String, dynamic>>>(
  (ref) => ref.watch(adminServiceProvider).getUsers(),
);

class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overview = ref.watch(adminOverviewProvider);
    return Scaffold(
      body: overview.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Istatistik yuklenemedi: $e')),
        data: (o) {
          final cards = <_AdminDashboardCardData>[
            _AdminDashboardCardData(
              title: 'Toplam Kullanici',
              value: '${o['totalUsers'] ?? 0}',
              icon: Icons.people,
              color: BrandTheme.charcoal,
              route: '/admin/users',
            ),
            _AdminDashboardCardData(
              title: 'Aktif Rezervasyon',
              value: '${o['activeReservations'] ?? 0}',
              icon: Icons.schedule,
              color: const Color(0xFF2B8A3E),
              route: '/admin/reservations?status=active',
            ),
            _AdminDashboardCardData(
              title: 'Doluluk Orani',
              value: '%${((o['occupancyRate'] as num?)?.toStringAsFixed(1) ?? '0.0')}',
              icon: Icons.pie_chart,
              color: BrandTheme.yellowDark,
              route: '/admin/halls',
            ),
            _AdminDashboardCardData(
              title: 'Masa QR Tara',
              value: '',
              icon: Icons.qr_code_scanner,
              color: BrandTheme.yellowDark,
              route: '/admin/qr-desk',
            ),
            _AdminDashboardCardData(
              title: 'Rezervasyonlar',
              value: '',
              icon: Icons.event_note,
              color: BrandTheme.charcoalSoft,
              route: '/admin/reservations',
            ),
            _AdminDashboardCardData(
              title: 'Ozel Takvim',
              value: '',
              icon: Icons.calendar_month,
              color: BrandTheme.yellowDark,
              route: '/admin/special-periods',
            ),
          ];
          return Stack(
            children: [
              GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.05,
                ),
                itemCount: cards.length,
                itemBuilder: (_, i) {
                  final c = cards[i];
                  return InkWell(
                    onTap: () => context.push(c.route),
                    borderRadius: BorderRadius.circular(18),
                    child: Ink(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: BrandTheme.surface,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x12000000),
                            blurRadius: 10,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: c.color.withValues(alpha: 0.16),
                            child: Icon(c.icon, color: c.color),
                          ),
                          const Spacer(),
                          if (c.value.isNotEmpty)
                            Text(
                              c.value,
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.4,
                              ),
                            )
                          else
                            const SizedBox(height: 34),
                          const SizedBox(height: 4),
                          Text(
                            c.title,
                            style: const TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              Positioned(
                right: 16,
                bottom: 16,
                child: FloatingActionButton(
                  heroTag: 'adminLogout',
                  onPressed: () async {
                    await ref.read(authControllerProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                  child: const Icon(Icons.logout),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _AdminDashboardCardData {
  _AdminDashboardCardData({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.route,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String route;
}

class AdminReservationsScreen extends ConsumerStatefulWidget {
  const AdminReservationsScreen({super.key, this.status, this.allowCancelReservation = true});
  final String? status;
  final bool allowCancelReservation;

  @override
  ConsumerState<AdminReservationsScreen> createState() => _AdminReservationsScreenState();
}

class _AdminReservationsScreenState extends ConsumerState<AdminReservationsScreen> {
  static const _filters = <MapEntry<String, String>>[
    MapEntry('', 'Tumu'),
    MapEntry('active', 'Aktif'),
    MapEntry('completed', 'Tamamlanan'),
    MapEntry('cancelled', 'Iptal'),
    MapEntry('expired', 'Suresi dolmus'),
  ];

  late String _selectedFilter;
  String _studentSearch = '';
  String _nameSearch = '';
  String _dateSearch = '';
  final _studentController = TextEditingController();
  final _nameController = TextEditingController();
  final _dateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedFilter = widget.status ?? '';
  }

  @override
  void dispose() {
    _studentController.dispose();
    _nameController.dispose();
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final initial = DateTime.tryParse(_dateSearch) ?? DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      initialDate: initial,
    );
    if (date == null) return;
    final ymd = DateFormat('yyyy-MM-dd').format(date);
    setState(() {
      _dateSearch = ymd;
      _dateController.text = ymd;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasSearch = _studentSearch.isNotEmpty || _nameSearch.isNotEmpty || _dateSearch.isNotEmpty;
    final reservations = ref.watch(adminReservationsProvider(hasSearch ? null : _selectedFilter));
    return Scaffold(
      appBar: AppBar(title: const Text('Rezervasyon Yonetimi')),
      floatingActionButton: FloatingActionButton(
        heroTag: 'adminReservationSearch',
        onPressed: () async {
          await showModalBottomSheet<void>(
            context: context,
            isScrollControlled: true,
            builder: (ctx) => Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 18,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Filtreleme / Arama', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _studentController,
                    decoration: const InputDecoration(labelText: 'Ogrenci no', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Ad soyad', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _dateController,
                    readOnly: true,
                    onTap: _pickDate,
                    decoration: InputDecoration(
                      labelText: 'Tarih',
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        onPressed: _pickDate,
                        icon: const Icon(Icons.calendar_month),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            setState(() {
                              _studentSearch = '';
                              _nameSearch = '';
                              _dateSearch = '';
                              _studentController.clear();
                              _nameController.clear();
                              _dateController.clear();
                            });
                          },
                          icon: const Icon(Icons.clear),
                          label: const Text('Temizle'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () {
                            setState(() {
                              _studentSearch = _studentController.text.trim().toLowerCase();
                              _nameSearch = _nameController.text.trim().toLowerCase();
                              _dateSearch = _dateController.text.trim().toLowerCase();
                            });
                            Navigator.pop(ctx);
                          },
                          icon: const Icon(Icons.check),
                          label: const Text('Uygula'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
        child: const Icon(Icons.search),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              children: _filters.map((f) {
                final selected = _selectedFilter == f.key;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(f.value),
                    selected: selected,
                    onSelected: (_) {
                      setState(() => _selectedFilter = f.key);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: reservations.when(
              data: (items) {
                final filtered = items.where((item) {
                  final studentNo = item['user']?['studentNumber']?.toString().toLowerCase() ?? '';
                  final fullName = item['user']?['fullName']?.toString().toLowerCase() ?? '';
                  final start = item['startTime']?.toString() ?? '';
                  final dateText = _formatDate(start).toLowerCase();
                  final isoDate = start.length >= 10 ? start.substring(0, 10).toLowerCase() : '';
                  final studentOk = _studentSearch.isEmpty || studentNo.contains(_studentSearch);
                  final nameOk = _nameSearch.isEmpty || fullName.contains(_nameSearch);
                  final dateOk = _dateSearch.isEmpty || dateText.contains(_dateSearch) || isoDate.contains(_dateSearch);
                  return studentOk && nameOk && dateOk;
                }).toList();
                if (filtered.isEmpty) {
                  return const Center(child: Text('Rezervasyon bulunamadi'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (_, i) {
                    final item = filtered[i];
                    final status = item['status']?.toString() ?? '';
                    final badge = _statusBadge(status);
                    final start = item['startTime']?.toString() ?? '';
                    final end = item['endTime']?.toString() ?? '';
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['user']?['fullName']?.toString() ?? 'Kullanici',
                                        style: const TextStyle(fontWeight: FontWeight.w700),
                                      ),
                                      Text(
                                        item['user']?['studentNumber']?.toString() ?? '',
                                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(color: badge.bg, borderRadius: BorderRadius.circular(20)),
                                  child: Text(
                                    badge.label,
                                    style: TextStyle(color: badge.fg, fontSize: 11, fontWeight: FontWeight.w700),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 15, color: Colors.black54),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${item['hall']?['name'] ?? '-'} · Masa ${item['table']?['tableNumber'] ?? '-'}',
                                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                const Icon(Icons.access_time, size: 15, color: Colors.black54),
                                const SizedBox(width: 4),
                                Text(
                                  '${_formatDate(start)} ${_formatTime(start)}-${_formatTime(end)}',
                                  style: const TextStyle(fontSize: 13, color: Colors.black54),
                                ),
                              ],
                            ),
                            if (widget.allowCancelReservation && (status == 'reserved' || status == 'checked_in'))
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton.icon(
                                  onPressed: () async {
                                    await ref.read(adminServiceProvider).cancelReservation(item['id'].toString());
                                    ref.invalidate(adminReservationsProvider(hasSearch ? null : _selectedFilter));
                                  },
                                  icon: const Icon(Icons.cancel_outlined, color: Color(0xFF8B1A1A)),
                                  label: const Text('Iptal Et', style: TextStyle(color: Color(0xFF8B1A1A))),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Hata: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

({String label, Color bg, Color fg}) _statusBadge(String status) {
  switch (status) {
    case 'reserved':
      return (label: 'Rezerve', bg: const Color(0xFFDBEAFE), fg: const Color(0xFF1D4ED8));
    case 'checked_in':
      return (label: 'Check-in', bg: const Color(0xFFDCFCE7), fg: const Color(0xFF166534));
    case 'completed':
      return (label: 'Tamamlandi', bg: const Color(0xFFD1FAE5), fg: const Color(0xFF065F46));
    case 'cancelled':
      return (label: 'Iptal edildi', bg: const Color(0xFFF5E8E8), fg: const Color(0xFF8B1A1A));
    case 'expired':
      return (label: 'Suresi doldu', bg: const Color(0xFFF1F5F9), fg: const Color(0xFF64748B));
    case 'no_show':
      return (label: 'Gelmedi', bg: const Color(0xFFFEF3C7), fg: const Color(0xFFB45309));
    default:
      return (label: status, bg: const Color(0xFFF3F4F6), fg: const Color(0xFF374151));
  }
}

String _formatTime(String iso) {
  final dt = DateTime.tryParse(iso);
  if (dt == null) return '--:--';
  return DateFormat('HH:mm').format(dt.toLocal());
}

String _formatDate(String iso) {
  final dt = DateTime.tryParse(iso);
  if (dt == null) return '-';
  return DateFormat('dd.MM.yyyy').format(dt.toLocal());
}

class AdminHallsScreen extends ConsumerStatefulWidget {
  const AdminHallsScreen({super.key, this.allowEdit = true});
  final bool allowEdit;

  @override
  ConsumerState<AdminHallsScreen> createState() => _AdminHallsScreenState();
}

class _AdminHallsScreenState extends ConsumerState<AdminHallsScreen> {
  String? selectedHallId;

  @override
  Widget build(BuildContext context) {
    final hallsFuture = ref.watch(
      FutureProvider((ref) => ref.watch(adminServiceProvider).getAdminHalls()),
    );
    return Scaffold(
      appBar: AppBar(title: const Text('Salon ve Masa Yonetimi')),
      body: hallsFuture.when(
        data: (halls) {
          final total = halls.fold<int>(0, (sum, h) => sum + ((h['totalTables'] as num?)?.toInt() ?? 0));
          final occupied = halls.fold<int>(0, (sum, h) => sum + ((h['occupiedTables'] as num?)?.toInt() ?? 0));
          final rate = total == 0 ? 0 : (occupied / total) * 100;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 8, offset: Offset(0, 2))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Salon Doluluk Dashboard', style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Toplam $total masanin $occupied tanesi dolu'),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(value: (rate / 100).clamp(0, 1)),
                    const SizedBox(height: 6),
                    Text('Genel Doluluk: %${rate.toStringAsFixed(1)}'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              ...halls.map(
                (hall) {
                  final hallRate = ((hall['occupancyRate'] as num?)?.toDouble() ?? 0).clamp(0, 100);
                  return Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFFF5E8E8),
                        child: const Icon(Icons.business_outlined, color: Color(0xFF8B1A1A)),
                      ),
                      title: Text(hall['name']?.toString() ?? ''),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Kat ${hall['floor']}'),
                          const SizedBox(height: 4),
                          Text('%${hallRate.toStringAsFixed(1)} doluluk · ${hall['occupiedTables'] ?? 0}/${hall['totalTables'] ?? 0} masa'),
                        ],
                      ),
                      onTap: () => setState(() => selectedHallId = hall['id'].toString()),
                      trailing: selectedHallId == hall['id'] ? const Icon(Icons.check_circle, color: Colors.green) : const Icon(Icons.chevron_right),
                    ),
                  );
                },
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
      ),
      floatingActionButton: widget.allowEdit && selectedHallId != null
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/admin/halls/$selectedHallId'),
              label: const Text('Masalari Duzenle'),
              icon: const Icon(Icons.edit),
            )
          : null,
    );
  }
}

class AdminHallTablesScreen extends ConsumerStatefulWidget {
  const AdminHallTablesScreen({super.key, required this.hallId, this.allowEdit = true});
  final String hallId;
  final bool allowEdit;

  @override
  ConsumerState<AdminHallTablesScreen> createState() => _AdminHallTablesScreenState();
}

class _AdminHallTablesScreenState extends ConsumerState<AdminHallTablesScreen> {
  String? _editingTableId;
  final _xController = TextEditingController();
  final _yController = TextEditingController();
  final _widthController = TextEditingController();
  final _heightController = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _xController.dispose();
    _yController.dispose();
    _widthController.dispose();
    _heightController.dispose();
    super.dispose();
  }

  void _openEdit(Map<String, dynamic> item) {
    setState(() {
      _editingTableId = item['id']?.toString();
      _xController.text = '${item['positionX'] ?? 0}';
      _yController.text = '${item['positionY'] ?? 0}';
      _widthController.text = '${item['width'] ?? 50}';
      _heightController.text = '${item['height'] ?? 50}';
    });
  }

  Future<void> _saveEdit() async {
    if (_editingTableId == null) return;
    final x = double.tryParse(_xController.text.trim());
    final y = double.tryParse(_yController.text.trim());
    final w = double.tryParse(_widthController.text.trim());
    final h = double.tryParse(_heightController.text.trim());
    if (x == null || y == null || w == null || h == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tum alanlar sayisal olmalidir.')),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await ref.read(adminServiceProvider).updateTable(
            _editingTableId!,
            {
              'positionX': x,
              'positionY': y,
              'width': w,
              'height': h,
              'featureIds': const <String>[],
            },
          );
      if (!mounted) return;
      setState(() => _editingTableId = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masa guncellendi.')),
      );
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final tablesFuture = FutureProvider(
      (r) => r.watch(adminServiceProvider).getHallTables(widget.hallId),
    );
    final tables = ref.watch(tablesFuture);
    return Scaffold(
      appBar: AppBar(title: Text('Salon ${widget.hallId} Masalari')),
      body: Stack(
        children: [
          tables.when(
            data: (items) => ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (_, i) => Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: ListTile(
                  title: Text('Masa ${items[i]['tableNumber']}'),
                  subtitle: Text(
                    'Konum: (${items[i]['positionX']}, ${items[i]['positionY']}) · Boyut: ${items[i]['width']}x${items[i]['height']}',
                  ),
                  trailing: widget.allowEdit
                      ? IconButton(
                          icon: const Icon(Icons.edit_outlined, color: Color(0xFF3B82F6)),
                          onPressed: () => _openEdit(items[i]),
                        )
                      : null,
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Hata: $e')),
          ),
          if (_editingTableId != null)
            Container(
              color: const Color(0x66000000),
              alignment: Alignment.bottomCenter,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Masa Duzenle', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: _xController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'positionX'))),
                        const SizedBox(width: 8),
                        Expanded(child: TextField(controller: _yController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'positionY'))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: _widthController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'width'))),
                        const SizedBox(width: 8),
                        Expanded(child: TextField(controller: _heightController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'height'))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _saving ? null : () => setState(() => _editingTableId = null),
                            child: const Text('Vazgec'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: FilledButton(
                            onPressed: _saving ? null : _saveEdit,
                            child: Text(_saving ? 'Kaydediliyor...' : 'Kaydet'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  final _searchController = TextEditingController();
  String _search = '';
  Map<String, dynamic>? _rolePickerUser;
  String? _actionLoadingUserId;
  String? _roleUpdatingUserId;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final users = ref.watch(adminUsersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Kullanici Yonetimi')),
      body: users.when(
        data: (items) {
          final filtered = items.where((u) {
            final q = _search.toLowerCase();
            if (q.isEmpty) return true;
            final name = u['fullName']?.toString().toLowerCase() ?? '';
            final no = u['studentNumber']?.toString().toLowerCase() ?? '';
            return name.contains(q) || no.contains(q);
          }).toList();
          final adminUsers = filtered.where((u) => (u['role']?.toString().toLowerCase() ?? '') == 'admin').toList();
          final staffUsers = filtered.where((u) => (u['role']?.toString().toLowerCase() ?? '') == 'staff').toList();
          final studentUsers = filtered.where((u) => (u['role']?.toString().toLowerCase() ?? 'student') == 'student').toList();

          Widget section(String title, List<Map<String, dynamic>> list) {
            if (list.isEmpty) return const SizedBox.shrink();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 12, bottom: 6),
                  child: Row(
                    children: [
                      Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF8B1A1A))),
                      const SizedBox(width: 8),
                      Text('${list.length}', style: const TextStyle(color: Colors.black45)),
                    ],
                  ),
                ),
                ...list.map((user) => Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          children: [
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: CircleAvatar(
                                backgroundColor: (user['role']?.toString() == 'admin')
                                    ? const Color(0xFFF5E8E8)
                                    : const Color(0xFFE1F5FE),
                                child: Icon(
                                  (user['role']?.toString() == 'admin') ? Icons.shield_outlined : Icons.person_outline,
                                  color: (user['role']?.toString() == 'admin') ? const Color(0xFF8B1A1A) : const Color(0xFF0277BD),
                                ),
                              ),
                              title: Text(user['fullName']?.toString() ?? ''),
                              subtitle: Text('${user['studentNumber'] ?? ''} · ${user['role'] ?? ''}'),
                              trailing: (user['hasActiveSession'] == true)
                                  ? Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Text(
                                        'Aktif',
                                        style: TextStyle(fontSize: 11, color: Color(0xFF16A34A), fontWeight: FontWeight.w700),
                                      ),
                                    )
                                  : null,
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: (_roleUpdatingUserId == user['id']?.toString() || _actionLoadingUserId == user['id']?.toString())
                                        ? null
                                        : () => setState(() => _rolePickerUser = user),
                                    icon: (_roleUpdatingUserId == user['id']?.toString())
                                        ? const SizedBox(
                                            width: 16,
                                            height: 16,
                                            child: CircularProgressIndicator(strokeWidth: 2),
                                          )
                                        : const Icon(Icons.key_outlined, color: Color(0xFF0277BD)),
                                    label: const Text(
                                      'Rolu Degistir',
                                      style: TextStyle(color: Color(0xFF0277BD)),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                if (user['hasActiveSession'] == true)
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: (_actionLoadingUserId == user['id']?.toString() || _roleUpdatingUserId == user['id']?.toString())
                                          ? null
                                          : () async {
                                              setState(() => _actionLoadingUserId = user['id']?.toString());
                                              final messenger = ScaffoldMessenger.of(context);
                                              try {
                                                await ref.read(adminServiceProvider).forceLogout(user['id'].toString());
                                                if (mounted) {
                                                  messenger.showSnackBar(
                                                    const SnackBar(content: Text('Kullanici oturumu sonlandirildi.')),
                                                  );
                                                }
                                                ref.invalidate(adminUsersProvider);
                                              } finally {
                                                if (mounted) setState(() => _actionLoadingUserId = null);
                                              }
                                            },
                                      icon: (_actionLoadingUserId == user['id']?.toString())
                                          ? const SizedBox(
                                              width: 16,
                                              height: 16,
                                              child: CircularProgressIndicator(strokeWidth: 2),
                                            )
                                          : const Icon(Icons.logout, color: Color(0xFF8B1A1A)),
                                      label: const Text(
                                        'Oturumu Sonlandir',
                                        style: TextStyle(color: Color(0xFF8B1A1A)),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    )),
              ],
            );
          }

          return Stack(
            children: [
              ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: (value) => setState(() => _search = value.trim()),
                    decoration: InputDecoration(
                      hintText: 'Isim veya ogrenci no ara',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _search.isEmpty
                          ? null
                          : IconButton(
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _search = '');
                              },
                              icon: const Icon(Icons.clear),
                            ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  section('Yoneticiler', adminUsers),
                  section('Personeller', staffUsers),
                  section('Ogrenciler', studentUsers),
                ],
              ),
              if (_rolePickerUser != null)
                Container(
                  color: const Color(0x66000000),
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Expanded(
                              child: Text('Rol Secimi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                            ),
                            IconButton(
                              onPressed: () => setState(() => _rolePickerUser = null),
                              icon: const Icon(Icons.close),
                            ),
                          ],
                        ),
                        Text(
                          '${_rolePickerUser!['fullName'] ?? '-'} · su an: ${_rolePickerUser!['role'] ?? '-'}',
                          style: const TextStyle(color: Colors.black54),
                        ),
                        const SizedBox(height: 10),
                        ...[
                          ('student', 'Ogrenci', 'Rezervasyon ve ogrenci ekranlari'),
                          ('staff', 'Personel', 'Kutuphane personeli'),
                          ('admin', 'Yonetici', 'Tam yetki'),
                        ].map((role) {
                          final current = (_rolePickerUser!['role']?.toString().toLowerCase() ?? '') == role.$1;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(14),
                              onTap: current
                                  ? null
                                  : () async {
                                      final userId = _rolePickerUser!['id']?.toString() ?? '';
                                      setState(() => _roleUpdatingUserId = userId);
                                      final messenger = ScaffoldMessenger.of(context);
                                      try {
                                        await ref.read(adminServiceProvider).updateUserRole(userId, role.$1);
                                        if (mounted) {
                                          messenger.showSnackBar(
                                            const SnackBar(content: Text('Rol guncellendi. Kullanici yeniden giris yapmalidir.')),
                                          );
                                        }
                                        setState(() => _rolePickerUser = null);
                                        ref.invalidate(adminUsersProvider);
                                      } finally {
                                        if (mounted) setState(() => _roleUpdatingUserId = null);
                                      }
                                    },
                              child: Ink(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: current ? const Color(0xFFF5E8E8) : Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: current ? const Color(0xFF8B1A1A) : const Color(0xFFE5E7EB),
                                    width: current ? 2 : 1,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(role.$2, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: current ? const Color(0xFF8B1A1A) : Colors.black87)),
                                    const SizedBox(height: 4),
                                    Text(role.$3, style: TextStyle(color: current ? const Color(0xFF8B1A1A) : Colors.black54, fontSize: 12)),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
      ),
    );
  }
}

class AdminSpecialPeriodsScreen extends ConsumerStatefulWidget {
  const AdminSpecialPeriodsScreen({super.key});

  @override
  ConsumerState<AdminSpecialPeriodsScreen> createState() => _AdminSpecialPeriodsScreenState();
}

class _AdminSpecialPeriodsScreenState extends ConsumerState<AdminSpecialPeriodsScreen> {
  final _nameController = TextEditingController();
  final _startController = TextEditingController();
  final _endController = TextEditingController();

  Future<void> _pickDate(TextEditingController controller) async {
    final initial = DateTime.tryParse(controller.text) ?? DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      initialDate: initial,
    );
    if (date == null) return;
    controller.text = DateFormat('yyyy-MM-dd').format(date);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final periodsProvider = FutureProvider(
      (r) => r.watch(adminServiceProvider).getSpecialPeriods(),
    );
    final periodsFuture = ref.watch(periodsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Ozel Takvim')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Donem Adi')),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _startController,
                    readOnly: true,
                    onTap: () => _pickDate(_startController),
                    decoration: const InputDecoration(
                      labelText: 'Baslangic YYYY-MM-DD',
                      suffixIcon: Icon(Icons.calendar_month),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _endController,
                    readOnly: true,
                    onTap: () => _pickDate(_endController),
                    decoration: const InputDecoration(
                      labelText: 'Bitis YYYY-MM-DD',
                      suffixIcon: Icon(Icons.calendar_month),
                    ),
                  ),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: () async {
                      if (_nameController.text.trim().isEmpty ||
                          _startController.text.trim().isEmpty ||
                          _endController.text.trim().isEmpty) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Donem adi, baslangic ve bitis tarihi zorunludur.')),
                        );
                        return;
                      }
                      if (_endController.text.trim().compareTo(_startController.text.trim()) < 0) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Bitis tarihi baslangictan once olamaz.')),
                        );
                        return;
                      }
                      await ref.read(adminServiceProvider).createSpecialPeriod({
                        'name': _nameController.text.trim(),
                        'startDate': _startController.text.trim(),
                        'endDate': _endController.text.trim(),
                        'is24h': true,
                        'openingTime': '00:00',
                        'closingTime': '23:59',
                        'priority': 100,
                        'rules': {
                          'allowAdvanceBooking': true,
                          'maxAdvanceDays': 1,
                        },
                      });
                      _nameController.clear();
                      _startController.clear();
                      _endController.clear();
                      ref.invalidate(periodsProvider);
                    },
                    child: const Text('Takvim Ekle'),
                  ),
                ],
              ),
            ),
          ),
          periodsFuture.when(
            data: (items) => Column(
              children: items
                  .map(
                    (p) => Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(p['name']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.w700)),
                                      Text('${p['startDate']} - ${p['endDate']}', style: const TextStyle(color: Colors.black54)),
                                      Text(
                                        '7/24 · Ileri rezervasyon: ${p['rules']?['maxAdvanceDays'] ?? 1} gun',
                                        style: const TextStyle(fontSize: 12, color: Colors.black45),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: p['isActive'] == true ? const Color(0xFFDCFCE7) : const Color(0xFFF5E8E8),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    p['isActive'] == true ? 'Aktif' : 'Pasif',
                                    style: TextStyle(
                                      color: p['isActive'] == true ? const Color(0xFF166534) : const Color(0xFF8B1A1A),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: FilledButton.tonalIcon(
                                    onPressed: () async {
                                      await ref.read(adminServiceProvider).toggleSpecialPeriodStatus(
                                            p['id'].toString(),
                                            !(p['isActive'] == true),
                                          );
                                      ref.invalidate(periodsProvider);
                                    },
                                    icon: Icon(p['isActive'] == true ? Icons.pause_circle_outline : Icons.check_circle_outline),
                                    label: Text(p['isActive'] == true ? 'Pasife Al' : 'Aktif Et'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                OutlinedButton(
                                  onPressed: () async {
                                    await ref.read(adminServiceProvider).deleteSpecialPeriod(p['id'].toString());
                                    ref.invalidate(periodsProvider);
                                  },
                                  child: const Icon(Icons.delete_outline, color: Colors.red),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Hata: $e')),
          ),
        ],
      ),
    );
  }
}

class TableQrDeskScreen extends ConsumerStatefulWidget {
  const TableQrDeskScreen({super.key, required this.homePath});
  final String homePath;

  @override
  ConsumerState<TableQrDeskScreen> createState() => _TableQrDeskScreenState();
}

class _TableQrDeskScreenState extends ConsumerState<TableQrDeskScreen> {
  final _qrController = TextEditingController();
  Map<String, dynamic>? snapshot;
  String? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Table QR Snapshot'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              context.go(widget.homePath);
            }
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _qrController, decoration: const InputDecoration(labelText: 'QR Code')),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () async {
                try {
                  final data = await ref.read(deskServiceProvider).getTableSnapshot(_qrController.text.trim());
                  setState(() {
                    snapshot = data;
                    error = null;
                  });
                } catch (e) {
                  setState(() {
                    error = e.toString();
                    snapshot = null;
                  });
                }
              },
              child: const Text('Snapshot Getir'),
            ),
            if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
            if (snapshot != null)
              Expanded(
                child: ListView(
                  children: [
                    ListTile(
                      title: Text('Masa: ${snapshot!['table']?['tableNumber'] ?? '-'}'),
                      subtitle: Text('Salon: ${snapshot!['table']?['hall']?['name'] ?? '-'}'),
                    ),
                    ...((snapshot!['todayReservations'] as List<dynamic>? ?? const [])
                        .map((e) => ListTile(
                              title: Text(e['user']?['fullName']?.toString() ?? ''),
                              subtitle: Text('${e['startTime']} - ${e['endTime']} (${e['status']})'),
                            ))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
