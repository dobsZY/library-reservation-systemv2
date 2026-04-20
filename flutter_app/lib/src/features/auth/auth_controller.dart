import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:library_reservation_flutter/src/core/storage/session_storage.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_api.dart';
import 'package:library_reservation_flutter/src/features/shared/models.dart';

final authControllerProvider =
    AsyncNotifierProvider<AuthController, AppUser?>(AuthController.new);

class AuthController extends AsyncNotifier<AppUser?> {
  @override
  Future<AppUser?> build() async {
    final storage = ref.watch(sessionStorageProvider);
    final token = await storage.getToken();
    if (token == null || token.isEmpty) return null;
    return ref.read(authApiProvider).verifySession();
  }

  Future<void> login(String studentNumber, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final result = await ref.read(authApiProvider).login(studentNumber, password);
      return result.user;
    });
  }

  Future<void> logout() async {
    await ref.read(authApiProvider).logout();
    state = const AsyncData(null);
  }
}
