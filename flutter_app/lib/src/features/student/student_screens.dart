import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:library_reservation_flutter/src/core/config/brand_theme.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_controller.dart';
import 'package:library_reservation_flutter/src/features/shared/api_services.dart';
import 'package:library_reservation_flutter/src/features/shared/models.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

final studentHallsProvider = FutureProvider<List<Hall>>(
  (ref) => ref.watch(hallServiceProvider).getHalls(),
);
final studentStatusProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.watch(reservationServiceProvider).getStatus(),
);
final reservationHistoryProvider = FutureProvider<List<Reservation>>(
  (ref) => ref.watch(reservationServiceProvider).getHistory(),
);
final studentOccupancyProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.watch(hallServiceProvider).getOverallOccupancy(),
);
final hallAvailabilityProvider = FutureProvider.family<Map<String, dynamic>, ({String hallId, String date})>(
  (ref, params) => ref.watch(hallServiceProvider).getHallAvailability(params.hallId, params.date),
);
final hallSlotsProvider = FutureProvider.family<Map<String, dynamic>, ({String hallId, String date})>(
  (ref, params) => ref.watch(hallServiceProvider).getHallSlots(params.hallId, params.date),
);

class StudentHomeScreen extends ConsumerWidget {
  const StudentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final halls = ref.watch(studentHallsProvider);
    final status = ref.watch(studentStatusProvider);
    final occupancy = ref.watch(studentOccupancyProvider);
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentHallsProvider);
          ref.invalidate(studentStatusProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [BrandTheme.charcoal, BrandTheme.charcoalSoft],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ogrenci Paneli',
                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Rezervasyonunu yonet, salona hizli eris ve check-in yap.',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.qr_code_scanner,
                    title: 'QR Check-in',
                    subtitle: 'Kamerayi ac',
                    onTap: () => context.push('/student/qr-scan'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.history,
                    title: 'Gecmis',
                    subtitle: 'Tum kayitlar',
                    onTap: () => context.push('/student/reservation-history'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            occupancy.when(
              data: (o) {
                final available = (o['availableTables'] as num?)?.toInt() ?? 0;
                final activeReservations = (o['activeReservations'] as num?)?.toInt() ?? 0;
                final occupancyRate = (o['overallOccupancyRate'] as num?)?.toDouble() ?? 0;
                return Row(
                  children: [
                    Expanded(child: _StatCard(label: 'Bos Masa', value: '$available', color: const Color(0xFF2B8A3E))),
                    const SizedBox(width: 10),
                    Expanded(child: _StatCard(label: 'Rezervasyon', value: '$activeReservations', color: BrandTheme.charcoal)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatCard(
                        label: 'Doluluk',
                        value: '%${occupancyRate.round()}',
                        color: BrandTheme.yellowDark,
                      ),
                    ),
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 12),
            status.when(
              data: (s) => Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(14),
                  leading: CircleAvatar(
                    backgroundColor: s['hasActiveReservation'] == true ? const Color(0xFFEAF7EE) : const Color(0xFFF1F2F4),
                    child: Icon(
                      s['hasActiveReservation'] == true ? Icons.event_available : Icons.event_busy,
                      color: s['hasActiveReservation'] == true ? const Color(0xFF2B8A3E) : BrandTheme.charcoalSoft,
                    ),
                  ),
                  title: const Text('Rezervasyon Durumu'),
                  subtitle: Text(s['hasActiveReservation'] == true ? 'Aktif rezervasyon var' : 'Aktif rezervasyon yok'),
                  trailing: FilledButton(
                    onPressed: () => context.push('/student/reservation'),
                    child: const Text('Detay'),
                  ),
                ),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Durum yuklenemedi: $e'),
            ),
            const SizedBox(height: 12),
            const Text('Salonlar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            halls.when(
              data: (list) => Column(
                children: list
                    .map(
                      (h) => Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        child: ListTile(
                          title: Text(h.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('Kat ${h.floor}'),
                          trailing: FilledButton(
                            onPressed: () => context.push('/student/hall/${h.id}'),
                            child: const Text('Masa Sec'),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Salonlar yuklenemedi: $e'),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: Colors.black54)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class StudentHallsScreen extends ConsumerWidget {
  const StudentHallsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final halls = ref.watch(studentHallsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Salonlar')),
      body: halls.when(
        data: (list) => ListView.builder(
          itemCount: list.length,
          itemBuilder: (_, i) => Card(
            child: ListTile(
              title: Text(list[i].name),
              subtitle: Text('Kat ${list[i].floor}'),
              onTap: () => context.push('/student/hall/${list[i].id}'),
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
      ),
    );
  }
}

class StudentHallDetailScreen extends ConsumerStatefulWidget {
  const StudentHallDetailScreen({super.key, required this.hallId});
  final String hallId;

  @override
  ConsumerState<StudentHallDetailScreen> createState() => _StudentHallDetailScreenState();
}

class _StudentHallDetailScreenState extends ConsumerState<StudentHallDetailScreen> {
  String _selectedDate = _todayYmd();
  bool _allowTomorrow = false;
  String? _selectedTableId;
  Map<String, dynamic>? _selectedSlot;
  String? _message;
  bool _reserving = false;

  static String _todayYmd() {
    final now = DateTime.now();
    return '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  static String _addDaysYmd(String ymd, int days) {
    final parts = ymd.split('-').map(int.parse).toList();
    final date = DateTime(parts[0], parts[1], parts[2]).add(Duration(days: days));
    return '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  static String _displayTime(String value) {
    if (value.length >= 16) return value.substring(11, 16);
    return value;
  }

  Future<void> _createReservation() async {
    if (_selectedTableId == null || _selectedSlot == null) {
      setState(() => _message = 'Lutfen masa ve uygun saat secin.');
      return;
    }
    setState(() {
      _reserving = true;
      _message = null;
    });
    try {
      await ref.read(reservationServiceProvider).createReservation(
            _selectedTableId!,
            _selectedSlot!['startTime'].toString(),
          );
      if (!mounted) return;
      setState(() {
        _message = 'Rezervasyon olusturuldu.';
        _selectedTableId = null;
        _selectedSlot = null;
      });
      ref.invalidate(studentStatusProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() => _message = e.toString());
    } finally {
      if (mounted) {
        setState(() => _reserving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final today = _todayYmd();
    final tomorrow = _addDaysYmd(today, 1);
    final availability = ref.watch(hallAvailabilityProvider((hallId: widget.hallId, date: _selectedDate)));
    final slots = ref.watch(hallSlotsProvider((hallId: widget.hallId, date: _selectedDate)));

    return Scaffold(
      appBar: AppBar(title: Text('Salon ${widget.hallId}')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              ChoiceChip(
                label: const Text('Bugun'),
                selected: _selectedDate == today,
                onSelected: (_) => setState(() {
                  _selectedDate = today;
                  _selectedTableId = null;
                  _selectedSlot = null;
                }),
              ),
              const SizedBox(width: 8),
              if (_allowTomorrow)
                ChoiceChip(
                  label: const Text('Yarin'),
                  selected: _selectedDate == tomorrow,
                  onSelected: (_) => setState(() {
                    _selectedDate = tomorrow;
                    _selectedTableId = null;
                    _selectedSlot = null;
                  }),
                ),
            ],
          ),
          const SizedBox(height: 12),
          availability.when(
            data: (data) {
              final stats = data['statistics'] as Map<String, dynamic>? ?? {};
              final tables = (data['tables'] as List<dynamic>? ?? const []);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bos: ${stats['available'] ?? 0} | Dolu: ${stats['occupied'] ?? 0} | Doluluk: %${((stats['occupancyRate'] as num?)?.round() ?? 0)}',
                  ),
                  const SizedBox(height: 8),
                  const Text('Masa Sec', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: tables.map((item) {
                      final table = item['table'] as Map<String, dynamic>? ?? {};
                      final tableId = table['id']?.toString() ?? '';
                      final tableNumber = table['tableNumber']?.toString() ?? tableId;
                      final isAvailable = item['isAvailable'] == true;
                      final selected = _selectedTableId == tableId;
                      return ChoiceChip(
                        selectedColor: Colors.blue.shade100,
                        disabledColor: Colors.red.shade100,
                        label: Text('Masa $tableNumber'),
                        selected: selected,
                        onSelected: isAvailable
                            ? (_) {
                                setState(() {
                                  _selectedTableId = tableId;
                                  _selectedSlot = null;
                                });
                              }
                            : null,
                      );
                    }).toList(),
                  ),
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Masa bilgisi yuklenemedi: $e'),
          ),
          const SizedBox(height: 14),
          const Text('Saat Slotlari', style: TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          slots.when(
            data: (data) {
              final datePolicy = data['datePolicy'] as Map<String, dynamic>?;
              final periodKind = datePolicy?['periodKind']?.toString();
              final allowAdvanceBooking = datePolicy?['allowAdvanceBooking'] == true;
              final maxAdvanceDays = (datePolicy?['maxAdvanceDays'] as num?)?.toInt() ?? 0;
              final allowTomorrow = periodKind == 'special' && allowAdvanceBooking && maxAdvanceDays >= 1;
              if (_allowTomorrow != allowTomorrow) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (!mounted) return;
                  setState(() {
                    _allowTomorrow = allowTomorrow;
                    if (!_allowTomorrow && _selectedDate != today) {
                      _selectedDate = today;
                      _selectedTableId = null;
                      _selectedSlot = null;
                    }
                  });
                });
              }
              final tables = (data['tables'] as List<dynamic>? ?? const []);
              Map<String, dynamic>? selectedTableSlots;
              if (_selectedTableId != null) {
                for (final t in tables) {
                  if (t['tableId']?.toString() == _selectedTableId) {
                    selectedTableSlots = t as Map<String, dynamic>;
                    break;
                  }
                }
              }
              final slotList = (selectedTableSlots?['slots'] as List<dynamic>? ?? const []);
              if (_selectedTableId == null) {
                return const Text('Once bir masa secin.');
              }
              if (slotList.isEmpty) {
                return const Text('Secili masa icin uygun slot bulunamadi.');
              }
              return Wrap(
                spacing: 8,
                runSpacing: 8,
                children: slotList.map((slot) {
                  final s = slot as Map<String, dynamic>;
                  final isAvailable = s['isAvailable'] == true;
                  final start = s['startTime']?.toString() ?? '';
                  final end = s['endTime']?.toString() ?? '';
                  final selected = _selectedSlot?['startTime']?.toString() == start;
                  return ChoiceChip(
                    selectedColor: Colors.green.shade100,
                    disabledColor: Colors.grey.shade200,
                    label: Text('${_displayTime(start)} - ${_displayTime(end)}'),
                    selected: selected,
                    onSelected: isAvailable ? (_) => setState(() => _selectedSlot = s) : null,
                  );
                }).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Slot bilgisi yuklenemedi: $e'),
          ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: _reserving ? null : _createReservation,
            child: Text(_reserving ? 'Olusturuluyor...' : 'Rezervasyon Yap'),
          ),
          if (_message != null) ...[
            const SizedBox(height: 10),
            Text(
              _message!,
              style: TextStyle(
                color: _message!.contains('olusturuldu') ? Colors.green : Colors.red,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class StudentReservationScreen extends ConsumerStatefulWidget {
  const StudentReservationScreen({super.key});

  @override
  ConsumerState<StudentReservationScreen> createState() => _StudentReservationScreenState();
}

class _StudentReservationScreenState extends ConsumerState<StudentReservationScreen> {
  Timer? _ticker;
  int _tick = 0;

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _tick++);
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  ({Duration remaining, bool active, bool started}) _computeCountdown(Reservation reservation, {String? qrDeadline}) {
    if (reservation.status == 'reserved') {
      final start = DateTime.tryParse(reservation.startTime ?? '');
      if (start == null) return (remaining: Duration.zero, active: false, started: false);
      final now = DateTime.now();
      if (now.isBefore(start.toLocal())) {
        final diff = start.toLocal().difference(now);
        return (remaining: diff, active: true, started: false);
      }
      final qd = DateTime.tryParse(qrDeadline ?? '');
      if (qd != null && now.isBefore(qd.toLocal())) {
        final diff = qd.toLocal().difference(now);
        return (remaining: diff, active: true, started: true);
      }
      return (remaining: Duration.zero, active: false, started: true);
    }
    final end = DateTime.tryParse(reservation.endTime ?? '');
    if (end == null) {
      return (remaining: Duration.zero, active: false, started: false);
    }
    final diff = end.toLocal().difference(DateTime.now());
    return (remaining: diff.isNegative ? Duration.zero : diff, active: !diff.isNegative, started: false);
  }

  String _fmtCountdown(Duration d) {
    final h = d.inHours.toString().padLeft(2, '0');
    final m = (d.inMinutes % 60).toString().padLeft(2, '0');
    final s = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  String _statusText(String status) {
    switch (status) {
      case 'reserved':
        return 'QR Bekleniyor';
      case 'checked_in':
        return 'Check-in Yapildi';
      case 'completed':
        return 'Tamamlandi';
      case 'cancelled':
        return 'Iptal Edildi';
      case 'expired':
        return 'Suresi Doldu';
      case 'no_show':
        return 'Gelmedi';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'reserved':
        return Colors.orange;
      case 'checked_in':
        return Colors.green;
      case 'completed':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      case 'expired':
        return Colors.blueGrey;
      case 'no_show':
        return Colors.deepOrange;
      default:
        return Colors.black54;
    }
  }

  String _formatIsoTime(String? value) {
    if (value == null || value.isEmpty) return '-';
    final dt = DateTime.tryParse(value);
    if (dt == null) return value;
    final local = dt.toLocal();
    final hh = local.hour.toString().padLeft(2, '0');
    final mm = local.minute.toString().padLeft(2, '0');
    return '$hh:$mm';
  }

  String _formatIsoDate(String? value) {
    if (value == null || value.isEmpty) return '-';
    final dt = DateTime.tryParse(value);
    if (dt == null) return value;
    final local = dt.toLocal();
    final dd = local.day.toString().padLeft(2, '0');
    final mm = local.month.toString().padLeft(2, '0');
    final yyyy = local.year.toString();
    return '$dd.$mm.$yyyy';
  }

  @override
  Widget build(BuildContext context) {
    final _ = _tick;
    final status = ref.watch(studentStatusProvider);
    final history = ref.watch(reservationHistoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Rezervasyonlarim')),
      body: status.when(
        data: (s) {
          final active = s['activeReservation'] as Map<String, dynamic>?;
          if (active == null) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 10, offset: Offset(0, 2))],
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.calendar_month_outlined, size: 64, color: Colors.black45),
                      const SizedBox(height: 8),
                      const Text('Aktif Rezervasyon Yok', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      const Text('Henuz aktif bir rezervasyonunuz bulunmuyor.', textAlign: TextAlign.center),
                      const SizedBox(height: 14),
                      FilledButton.icon(
                        onPressed: () => context.push('/student/halls'),
                        icon: const Icon(Icons.add_circle_outline),
                        label: const Text('Rezervasyon Yap'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                history.when(
                  data: (items) {
                    final past = items.where((e) => e.status != 'reserved' && e.status != 'checked_in').take(3).toList();
                    if (past.isEmpty) return const Text('Gecmis rezervasyon bulunmuyor.');
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Gecmis Rezervasyonlarim', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        ...past.map(
                          (r) => Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              title: Text('${_formatIsoDate(r.startTime)} · ${_formatIsoTime(r.startTime)}-${_formatIsoTime(r.endTime)}'),
                              subtitle: Text('Durum: ${_statusText(r.status)}'),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusColor(r.status).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  _statusText(r.status),
                                  style: TextStyle(
                                    color: _statusColor(r.status),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ],
            );
          }
          final reservation = Reservation.fromJson(active);
          final qrDeadline = active['qrDeadline']?.toString();
          final countdown = _computeCountdown(reservation, qrDeadline: qrDeadline);
          final qrRemaining = () {
            if (reservation.status != 'reserved') return null;
            if (qrDeadline == null || qrDeadline.isEmpty) return null;
            final qd = DateTime.tryParse(qrDeadline);
            if (qd == null) return null;
            final diff = qd.toLocal().difference(DateTime.now());
            if (diff.isNegative) return Duration.zero;
            return diff;
          }();
          final progress = reservation.startTime != null && reservation.endTime != null
              ? (() {
                  final start = DateTime.tryParse(reservation.startTime!)?.toLocal();
                  final end = DateTime.tryParse(reservation.endTime!)?.toLocal();
                  if (start == null || end == null) return 0.0;
                  final total = end.difference(start).inSeconds;
                  if (total <= 0) return 0.0;
                  final elapsed = DateTime.now().difference(start).inSeconds;
                  return (elapsed / total).clamp(0, 1).toDouble();
                })()
              : 0.0;
          final canExtend = s['canExtend'] == true;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_statusText(reservation.status), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Text(
                        'Baslangic: ${reservation.startTime ?? '-'}\nBitis: ${reservation.endTime ?? '-'}',
                        style: const TextStyle(color: Colors.black54),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                child: Column(
                  children: [
                    Text(countdown.active ? _fmtCountdown(countdown.remaining) : 'SURE DOLDU', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700)),
                    if (countdown.started && reservation.status == 'reserved')
                      const Padding(
                        padding: EdgeInsets.only(top: 6),
                        child: Text(
                          'Rezervasyon basladi, QR check-in bekleniyor',
                          style: TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w600),
                        ),
                      ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(value: progress),
                    if (qrRemaining != null) ...[
                      const SizedBox(height: 10),
                      const Divider(),
                      const SizedBox(height: 6),
                      const Text(
                        'QR ile check-in yapmak icin kalan sure',
                        style: TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _fmtCountdown(qrRemaining),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: qrRemaining <= const Duration(minutes: 5) ? Colors.red : Colors.black87,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 10),
              if (reservation.status == 'reserved')
                FilledButton.icon(
                  onPressed: () => context.push('/student/qr-scan'),
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('QR Kod Tara'),
                ),
              if (reservation.status == 'checked_in' && canExtend)
                FilledButton.icon(
                  onPressed: () async {
                    await ref.read(reservationServiceProvider).extendReservation(reservation.id);
                    ref.invalidate(studentStatusProvider);
                  },
                  icon: const Icon(Icons.add_circle_outline),
                  label: const Text('Sure Uzat'),
                ),
              OutlinedButton.icon(
                onPressed: () async {
                  await ref.read(reservationServiceProvider).cancelReservation(reservation.id);
                  ref.invalidate(studentStatusProvider);
                },
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Iptal Et'),
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

class StudentReservationHistoryScreen extends ConsumerStatefulWidget {
  const StudentReservationHistoryScreen({super.key});

  @override
  ConsumerState<StudentReservationHistoryScreen> createState() => _StudentReservationHistoryScreenState();
}

class _StudentReservationHistoryScreenState extends ConsumerState<StudentReservationHistoryScreen> {
  String _filterDate = '';
  final _dateController = TextEditingController();

  @override
  void dispose() {
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final initial = DateTime.tryParse(_filterDate) ?? DateTime.now();
    final selected = await showDatePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      initialDate: initial,
    );
    if (selected == null) return;
    final ymd = '${selected.year.toString().padLeft(4, '0')}-${selected.month.toString().padLeft(2, '0')}-${selected.day.toString().padLeft(2, '0')}';
    setState(() {
      _filterDate = ymd;
      _dateController.text = ymd;
    });
  }

  String _formatDate(String? value) {
    if (value == null || value.isEmpty) return '-';
    final dt = DateTime.tryParse(value);
    if (dt == null) return value;
    final l = dt.toLocal();
    return '${l.day.toString().padLeft(2, '0')}.${l.month.toString().padLeft(2, '0')}.${l.year}';
  }

  String _formatTime(String? value) {
    if (value == null || value.isEmpty) return '--:--';
    final dt = DateTime.tryParse(value);
    if (dt == null) return value;
    final l = dt.toLocal();
    return '${l.hour.toString().padLeft(2, '0')}:${l.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final history = ref.watch(reservationHistoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Gecmis Rezervasyonlar')),
      body: history.when(
        data: (items) {
          final filtered = _filterDate.isEmpty
              ? items
              : items.where((r) {
                  final raw = r.startTime ?? '';
                  if (raw.length < 10) return false;
                  return raw.substring(0, 10) == _filterDate;
                }).toList();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      TextField(
                        controller: _dateController,
                        readOnly: true,
                        onTap: _pickDate,
                        decoration: InputDecoration(
                          labelText: 'Tarih ile filtrele',
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            onPressed: _pickDate,
                            icon: const Icon(Icons.calendar_month),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                setState(() {
                                  _filterDate = '';
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
                              onPressed: _pickDate,
                              icon: const Icon(Icons.filter_alt_outlined),
                              label: const Text('Filtrele'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              if (filtered.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 12),
                  child: Center(child: Text('Filtreye uygun rezervasyon yok.')),
                )
              else
                ...filtered.map(
                  (r) => Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      title: Text('${_formatDate(r.startTime)} · ${_formatTime(r.startTime)}-${_formatTime(r.endTime)}'),
                      subtitle: Text('Durum: ${r.status}'),
                      trailing: Text(r.id, style: const TextStyle(fontSize: 11, color: Colors.black45)),
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

class StudentProfileScreen extends ConsumerWidget {
  const StudentProfileScreen({super.key});

  String _statusText(String status) {
    switch (status) {
      case 'completed':
        return 'Tamamlandi';
      case 'cancelled':
        return 'Iptal';
      case 'expired':
        return 'Suresi Doldu';
      case 'no_show':
        return 'Gelmedi';
      case 'checked_in':
        return 'Check-in';
      case 'reserved':
        return 'Aktif';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final history = ref.watch(reservationHistoryProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Hesabim')),
      body: ListView(
        children: [
          Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 10, offset: Offset(0, 2))],
            ),
            child: auth.when(
              data: (user) => Column(
                children: [
                  const CircleAvatar(radius: 44, child: Icon(Icons.person, size: 44)),
                  const SizedBox(height: 10),
                  Text(user?.fullName ?? 'Ogrenci', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text('Ogrenci No: ${user?.studentNumber ?? '-'}', style: const TextStyle(color: Colors.black54)),
                ],
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Profil yuklenemedi: $e'),
            ),
          ),
          history.when(
            data: (items) {
              final total = items.length;
              final completed = items.where((e) => e.status == 'completed').length;
              final cancelled = items.where((e) => e.status == 'cancelled').length;
              final participation = total == 0 ? 0 : ((completed / total) * 100).round();
              final past = items.where((e) => e.status != 'reserved' && e.status != 'checked_in').toList()
                ..sort((a, b) => (DateTime.tryParse(b.startTime ?? '') ?? DateTime(1970))
                    .compareTo(DateTime.tryParse(a.startTime ?? '') ?? DateTime(1970)));
              return Column(
                children: [
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Expanded(child: _StatCard(label: 'Toplam', value: '$total', color: Colors.blue)),
                        const SizedBox(width: 8),
                        Expanded(child: _StatCard(label: 'Tamamlanan', value: '$completed', color: Colors.green)),
                        const SizedBox(width: 8),
                        Expanded(child: _StatCard(label: 'Iptal', value: '$cancelled', color: Colors.redAccent)),
                        const SizedBox(width: 8),
                        Expanded(child: _StatCard(label: 'Katilim', value: '%$participation', color: Colors.indigo)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (past.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 8, offset: Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Gecmis Rezervasyonlarim', style: TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          ...past.take(5).map((r) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text('${r.startTime?.substring(0, 10) ?? '-'} · ${r.startTime?.substring(11, 16) ?? '--:--'}-${r.endTime?.substring(11, 16) ?? '--:--'}'),
                                subtitle: Text('Durum: ${_statusText(r.status)}'),
                              )),
                        ],
                      ),
                    ),
                ],
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: 16),
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Bildirim Ayarlari'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/student/notification-settings'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.help_outline),
                  title: const Text('Yardim & Destek'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/student/help-support'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.red),
                  title: const Text('Cikis Yap', style: TextStyle(color: Colors.red)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    final result = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Cikis Yap'),
                        content: const Text('Hesabinizdan cikmak istediginize emin misiniz?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hayir')),
                          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Evet, Cikis Yap')),
                        ],
                      ),
                    );
                    if (result == true) {
                      await ref.read(authControllerProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  static const _qrKey = 'notif.qr.warning.enabled';
  static const _extendKey = 'notif.extend.reminder.enabled';
  static const _endKey = 'notif.end.warning.enabled';

  bool _pushEnabled = false;
  bool _qrWarningEnabled = true;
  bool _extendReminderEnabled = true;
  bool _endWarningEnabled = true;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final status = await Permission.notification.status;
    if (!mounted) return;
    setState(() {
      _pushEnabled = status.isGranted;
      _qrWarningEnabled = prefs.getBool(_qrKey) ?? true;
      _extendReminderEnabled = prefs.getBool(_extendKey) ?? true;
      _endWarningEnabled = prefs.getBool(_endKey) ?? true;
      _loading = false;
    });
  }

  Future<void> _requestNotificationPermission() async {
    final result = await Permission.notification.request();
    if (!mounted) return;
    setState(() => _pushEnabled = result.isGranted);
    final messenger = ScaffoldMessenger.of(context);
    messenger.showSnackBar(
      SnackBar(content: Text(result.isGranted ? 'Bildirim izni verildi.' : 'Bildirim izni reddedildi.')),
    );
  }

  Future<void> _savePreference(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Bildirim Ayarlari')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: Icon(_pushEnabled ? Icons.notifications_active : Icons.notifications_off),
              title: const Text('Sistem Bildirim Izni'),
              subtitle: Text(_pushEnabled ? 'Izin acik' : 'Izin kapali'),
              trailing: FilledButton(
                onPressed: _requestNotificationPermission,
                child: const Text('Izin Ver'),
              ),
            ),
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            value: _qrWarningEnabled,
            onChanged: (value) {
              setState(() => _qrWarningEnabled = value);
              _savePreference(_qrKey, value);
            },
            title: const Text('QR sure uyarisi'),
            subtitle: const Text('Check-in son dakikada hatirlatma goster'),
          ),
          SwitchListTile(
            value: _extendReminderEnabled,
            onChanged: (value) {
              setState(() => _extendReminderEnabled = value);
              _savePreference(_extendKey, value);
            },
            title: const Text('Sure uzatma hatirlatmasi'),
            subtitle: const Text('Rezervasyon bitmeden uzatma bildirimini ac'),
          ),
          SwitchListTile(
            value: _endWarningEnabled,
            onChanged: (value) {
              setState(() => _endWarningEnabled = value);
              _savePreference(_endKey, value);
            },
            title: const Text('Bitis uyarisi'),
            subtitle: const Text('Rezervasyon bitimine yakin uyari goster'),
          ),
        ],
      ),
    );
  }
}

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  Future<void> _openUrl(BuildContext context, String rawUrl) async {
    final messenger = ScaffoldMessenger.of(context);
    final uri = Uri.parse(rawUrl);
    final canOpen = await canLaunchUrl(uri);
    if (!canOpen) {
      if (!context.mounted) return;
      messenger.showSnackBar(
        const SnackBar(content: Text('Baglanti acilamadi.')),
      );
      return;
    }
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yardim & Destek')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Destek Kanallari',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.email_outlined),
              title: const Text('E-posta'),
              subtitle: const Text('bilgiislem@selcuk.edu.tr'),
              onTap: () => _openUrl(context, 'mailto:bilgiislem@selcuk.edu.tr'),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.phone_outlined),
              title: const Text('Telefon'),
              subtitle: const Text('+90 332 223 80 00'),
              onTap: () => _openUrl(context, 'tel:+903322238000'),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.language_outlined),
              title: const Text('SSS / Web'),
              subtitle: const Text('https://www.selcuk.edu.tr'),
              onTap: () => _openUrl(context, 'https://www.selcuk.edu.tr'),
            ),
          ),
        ],
      ),
    );
  }
}

class QrScanScreen extends ConsumerStatefulWidget {
  const QrScanScreen({super.key});

  @override
  ConsumerState<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends ConsumerState<QrScanScreen> {
  final _manualController = TextEditingController();
  final MobileScannerController _scannerController = MobileScannerController();
  bool _cameraGranted = false;
  bool _locationGranted = false;
  bool _isProcessing = false;
  String? _result;

  @override
  void initState() {
    super.initState();
    _refreshPermissionState();
  }

  @override
  void dispose() {
    _manualController.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _refreshPermissionState() async {
    final camera = await Permission.camera.status;
    final location = await Permission.locationWhenInUse.status;
    if (!mounted) return;
    setState(() {
      _cameraGranted = camera.isGranted;
      _locationGranted = location.isGranted;
    });
  }

  Future<void> _requestCameraPermission() async {
    final camera = await Permission.camera.request();
    if (!mounted) return;
    setState(() => _cameraGranted = camera.isGranted);
  }

  Future<void> _requestLocationPermission() async {
    final location = await Permission.locationWhenInUse.request();
    if (!mounted) return;
    setState(() => _locationGranted = location.isGranted);
  }

  Future<void> _handleQrInput(String qrCode) async {
    if (_isProcessing || qrCode.isEmpty) return;
    setState(() {
      _isProcessing = true;
      _result = null;
    });
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      await ref.read(reservationServiceProvider).validateQr(qrCode);
      await ref.read(reservationServiceProvider).checkIn(
            qrCode: qrCode,
            latitude: position.latitude,
            longitude: position.longitude,
          );
      if (!mounted) return;
      setState(() => _result = 'Check-in basarili.');
    } catch (e) {
      if (!mounted) return;
      setState(() => _result = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR Check-in')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Kamera ve konum izni ile QR okut, rezervasyona check-in yap.'),
            const SizedBox(height: 12),
            if (!_cameraGranted)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.videocam_off),
                title: const Text('Kamera izni gerekli'),
                trailing: FilledButton(
                  onPressed: _requestCameraPermission,
                  child: const Text('Izin Ver'),
                ),
              ),
            if (!_locationGranted)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.location_off),
                title: const Text('Konum izni gerekli'),
                trailing: FilledButton(
                  onPressed: _requestLocationPermission,
                  child: const Text('Izin Ver'),
                ),
              ),
            if (_cameraGranted && _locationGranted)
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: MobileScanner(
                    controller: _scannerController,
                    onDetect: (capture) {
                      final barcode = capture.barcodes.isNotEmpty ? capture.barcodes.first.rawValue : null;
                      if (barcode != null) {
                        _handleQrInput(barcode);
                      }
                    },
                  ),
                ),
              ),
            const SizedBox(height: 12),
            TextField(
              controller: _manualController,
              decoration: const InputDecoration(
                labelText: 'QR Code (manuel test)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _isProcessing
                  ? null
                  : () => _handleQrInput(_manualController.text.trim()),
              child: Text(_isProcessing ? 'Isleniyor...' : 'Manuel Check-in'),
            ),
            if (_result != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  _result!,
                  style: TextStyle(
                    color: _result!.contains('basarili') ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
