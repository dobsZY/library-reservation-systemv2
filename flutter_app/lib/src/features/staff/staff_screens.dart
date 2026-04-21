import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:library_reservation_flutter/src/core/config/brand_theme.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_controller.dart';
import 'package:library_reservation_flutter/src/features/admin/admin_screens.dart';
import 'package:library_reservation_flutter/src/features/shared/api_services.dart';

final _staffOverviewProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.watch(adminServiceProvider).getOverview(),
);

class StaffHomeScreen extends ConsumerWidget {
  const StaffHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overview = ref.watch(_staffOverviewProvider);
    return Scaffold(
      body: overview.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Dashboard yuklenemedi: $e')),
        data: (o) {
          final cards = [
            _StaffCard('Doluluk Orani', '%${((o['occupancyRate'] as num?)?.toStringAsFixed(1) ?? '0.0')}', Icons.pie_chart, BrandTheme.yellowDark, '/staff/halls'),
            _StaffCard('Aktif Rezervasyon', '${o['activeReservations'] ?? 0}', Icons.schedule, const Color(0xFF2B8A3E), '/staff/reservations'),
            _StaffCard('Iptal Edilen', '${o['cancelledReservations'] ?? 0}', Icons.cancel_outlined, BrandTheme.charcoalSoft, '/staff/reservations'),
            _StaffCard('Suresi Dolmus', '${o['noShowCount'] ?? 0}', Icons.warning_amber_outlined, const Color(0xFFB91C1C), '/staff/reservations'),
            _StaffCard('Masa QR Tara', '', Icons.qr_code_scanner, BrandTheme.yellowDark, '/staff/qr-desk'),
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
                        boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 10, offset: Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: c.color.withValues(alpha: 0.14),
                            child: Icon(c.icon, color: c.color),
                          ),
                          const Spacer(),
                          if (c.value.isNotEmpty)
                            Text(c.value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800))
                          else
                            const SizedBox(height: 34),
                          const SizedBox(height: 4),
                          Text(c.title, style: const TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w600)),
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
                  heroTag: 'staffLogout',
                  onPressed: () async {
                    await ref.read(authControllerProvider.notifier).logout();
                    if (context.mounted) context.go('/login');
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

class _StaffCard {
  _StaffCard(this.title, this.value, this.icon, this.color, this.route);
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String route;
}

class StaffReservationsScreen extends StatelessWidget {
  const StaffReservationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AdminReservationsScreen(allowCancelReservation: false);
  }
}

class StaffHallsScreen extends StatelessWidget {
  const StaffHallsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AdminHallsScreen(allowEdit: false);
  }
}

class StaffMasaKontrolScreen extends StatelessWidget {
  const StaffMasaKontrolScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Masa Kontrol')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Salonlar'),
            onTap: () => context.push('/staff/halls'),
          ),
          ListTile(
            title: const Text('Rezervasyonlar'),
            onTap: () => context.push('/staff/reservations'),
          ),
        ],
      ),
    );
  }
}
