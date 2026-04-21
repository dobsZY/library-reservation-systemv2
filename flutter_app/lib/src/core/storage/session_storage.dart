import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return SessionStorage(const FlutterSecureStorage());
});

class SessionStorage {
  SessionStorage(this._secureStorage);

  static const _tokenKey = 'authToken';
  static const _userKey = 'authUser';
  final FlutterSecureStorage _secureStorage;

  Future<void> saveSession(String token, Map<String, dynamic> user) async {
    await _secureStorage.write(key: _tokenKey, value: token);
    await _secureStorage.write(key: _userKey, value: jsonEncode(user));
  }

  Future<String?> getToken() => _secureStorage.read(key: _tokenKey);

  Future<Map<String, dynamic>?> getUser() async {
    final raw = await _secureStorage.read(key: _userKey);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokenKey);
    await _secureStorage.delete(key: _userKey);
  }
}
