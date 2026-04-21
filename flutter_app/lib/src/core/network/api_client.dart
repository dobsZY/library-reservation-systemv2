import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:library_reservation_flutter/src/core/config/app_config.dart';
import 'package:library_reservation_flutter/src/core/storage/session_storage.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(sessionStorageProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      sendTimeout: const Duration(seconds: 12),
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        options.headers['Content-Type'] = 'application/json';
        handler.next(options);
      },
      onError: (error, handler) async {
        final status = error.response?.statusCode;
        if (status == 401 && error.requestOptions.path != '/auth/login') {
          await storage.clear();
        }
        handler.next(error);
      },
    ),
  );
  return dio;
});

Never throwApiError(Object error) {
  if (error is DioException) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String message = 'Bir hata olustu';
    if (data is Map<String, dynamic> && data['message'] != null) {
      message = data['message'].toString();
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      message = 'Sunucuya baglanma zaman asimina ugradi.';
    } else if (error.type == DioExceptionType.connectionError) {
      message = 'Sunucuya baglanilamadi. Backend calisiyor mu kontrol edin.';
    } else if (error.message != null) {
      message = error.message!;
    }
    throw ApiException(message, statusCode: status);
  }
  throw ApiException(error.toString());
}
