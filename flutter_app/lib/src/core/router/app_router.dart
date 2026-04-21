import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:library_reservation_flutter/src/features/admin/admin_screens.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_controller.dart';
import 'package:library_reservation_flutter/src/features/auth/login_screen.dart';
import 'package:library_reservation_flutter/src/features/staff/staff_screens.dart';
import 'package:library_reservation_flutter/src/features/student/student_screens.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/bootstrap',
    refreshListenable: RouterRefreshListenable(ref),
    routes: [
      GoRoute(
        path: '/bootstrap',
        builder: (context, state) => const _BootstrapScreen(),
      ),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/student', builder: (_, __) => const StudentHomeScreen()),
      GoRoute(path: '/student/halls', builder: (_, __) => const StudentHallsScreen()),
      GoRoute(path: '/student/hall/:id', builder: (_, s) => StudentHallDetailScreen(hallId: s.pathParameters['id']!)),
      GoRoute(path: '/student/reservation', builder: (_, __) => const StudentReservationScreen()),
      GoRoute(path: '/student/reservation-history', builder: (_, __) => const StudentReservationHistoryScreen()),
      GoRoute(path: '/student/profile', builder: (_, __) => const StudentProfileScreen()),
      GoRoute(path: '/student/notification-settings', builder: (_, __) => const NotificationSettingsScreen()),
      GoRoute(path: '/student/help-support', builder: (_, __) => const HelpSupportScreen()),
      GoRoute(path: '/student/qr-scan', builder: (_, __) => const QrScanScreen()),
      GoRoute(path: '/admin', builder: (_, __) => const AdminHomeScreen()),
      GoRoute(path: '/admin/reservations', builder: (_, s) => AdminReservationsScreen(status: s.uri.queryParameters['status'])),
      GoRoute(path: '/admin/halls', builder: (_, __) => const AdminHallsScreen()),
      GoRoute(path: '/admin/halls/:id', builder: (_, s) => AdminHallTablesScreen(hallId: s.pathParameters['id']!)),
      GoRoute(path: '/admin/users', builder: (_, __) => const AdminUsersScreen()),
      GoRoute(path: '/admin/special-periods', builder: (_, __) => const AdminSpecialPeriodsScreen()),
      GoRoute(path: '/admin/qr-desk', builder: (_, __) => const TableQrDeskScreen(homePath: '/admin')),
      GoRoute(path: '/staff', builder: (_, __) => const StaffHomeScreen()),
      GoRoute(path: '/staff/reservations', builder: (_, __) => const StaffReservationsScreen()),
      GoRoute(path: '/staff/halls', builder: (_, __) => const StaffHallsScreen()),
      GoRoute(path: '/staff/masa-kontrol', builder: (_, __) => const StaffMasaKontrolScreen()),
      GoRoute(path: '/staff/qr-desk', builder: (_, __) => const TableQrDeskScreen(homePath: '/staff')),
    ],
    redirect: (context, state) {
      final authState = ref.read(authControllerProvider);
      if (state.uri.path == '/bootstrap') return null;
      if (authState.isLoading) return '/bootstrap';
      final user = authState.valueOrNull;
      if (user == null && state.uri.path != '/login') return '/login';
      if (user != null && state.uri.path == '/login') {
        if (user.role == 'admin') return '/admin';
        if (user.role == 'staff') return '/staff';
        return '/student';
      }
      return null;
    },
  );
});

class RouterRefreshListenable extends ChangeNotifier {
  RouterRefreshListenable(this.ref) {
    ref.listen(authControllerProvider, (previous, next) => notifyListeners());
  }

  final Ref ref;
}

class _BootstrapScreen extends ConsumerWidget {
  const _BootstrapScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authControllerProvider);
    if (state.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final user = state.valueOrNull;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) return;
      if (user == null) {
        context.go('/login');
      } else if (user.role == 'admin') {
        context.go('/admin');
      } else if (user.role == 'staff') {
        context.go('/staff');
      } else {
        context.go('/student');
      }
    });
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
