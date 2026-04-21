import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:library_reservation_flutter/src/core/network/api_client.dart';
import 'package:library_reservation_flutter/src/core/storage/session_storage.dart';
import 'package:library_reservation_flutter/src/features/shared/models.dart';

final authApiProvider = Provider<AuthApi>((ref) {
  return AuthApi(
    ref.watch(dioProvider),
    ref.watch(sessionStorageProvider),
  );
});

class LoginResult {
  LoginResult({required this.accessToken, required this.user});

  final String accessToken;
  final AppUser user;
}

class AuthApi {
  AuthApi(this._dio, this._storage);
  final Dio _dio;
  final SessionStorage _storage;

  Future<LoginResult> login(String studentNumber, String password) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'studentNumber': studentNumber,
          'password': password,
        },
      );
      final data = response.data ?? <String, dynamic>{};
      final token = data['accessToken']?.toString() ?? '';
      final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
      await _storage.saveSession(token, user.toJson());
      return LoginResult(accessToken: token, user: user);
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<AppUser?> verifySession() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/auth/me');
      final user = AppUser.fromJson(response.data ?? <String, dynamic>{});
      final token = await _storage.getToken() ?? '';
      await _storage.saveSession(token, user.toJson());
      return user;
    } catch (_) {
      await _storage.clear();
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {
      // local clear is still mandatory
    } finally {
      await _storage.clear();
    }
  }
}
