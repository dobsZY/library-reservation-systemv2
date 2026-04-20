import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:library_reservation_flutter/src/core/network/api_client.dart';
import 'package:library_reservation_flutter/src/features/shared/models.dart';

final reservationServiceProvider = Provider<ReservationService>(
  (ref) => ReservationService(ref.watch(dioProvider)),
);
final hallServiceProvider = Provider<HallService>(
  (ref) => HallService(ref.watch(dioProvider)),
);
final adminServiceProvider = Provider<AdminService>(
  (ref) => AdminService(ref.watch(dioProvider)),
);
final deskServiceProvider = Provider<DeskService>(
  (ref) => DeskService(ref.watch(dioProvider)),
);

class ReservationService {
  ReservationService(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getStatus() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/reservations/my/status');
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Reservation>> getHistory() async {
    try {
      final res = await _dio.get<List<dynamic>>('/reservations/my/history');
      return (res.data ?? [])
          .map((e) => Reservation.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<Reservation?> getActive() async {
    try {
      final res = await _dio.get('/reservations/my/active');
      if (res.data == null) return null;
      return Reservation.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> createReservation(String tableId, String startTime) async {
    try {
      await _dio.post('/reservations', data: {
        'tableId': tableId,
        'startTime': startTime,
      });
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> cancelReservation(String id, {String? reason}) async {
    try {
      await _dio.delete('/reservations/$id', data: reason == null ? {} : {'reason': reason});
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> extendReservation(String id) async {
    try {
      await _dio.put('/reservations/$id/extend');
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<Map<String, dynamic>> validateQr(String qrCode) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/reservations/validate-qr',
        data: {'qrCode': qrCode},
      );
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> checkIn({
    required String qrCode,
    required double latitude,
    required double longitude,
  }) async {
    try {
      await _dio.post('/reservations/check-in', data: {
        'qrCode': qrCode,
        'latitude': latitude,
        'longitude': longitude,
      });
    } catch (e) {
      throwApiError(e);
    }
  }
}

class HallService {
  HallService(this._dio);
  final Dio _dio;

  Future<List<Hall>> getHalls() async {
    try {
      final res = await _dio.get<List<dynamic>>('/halls');
      return (res.data ?? [])
          .map((e) => Hall.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<Map<String, dynamic>> getHallSlots(String hallId, String date) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/halls/$hallId/slots',
        queryParameters: {'date': date},
      );
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<Map<String, dynamic>> getHallAvailability(String hallId, String date) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/halls/$hallId/availability',
        queryParameters: {'date': date},
      );
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<Map<String, dynamic>> getOverallOccupancy() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/statistics/occupancy');
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }
}

class AdminService {
  AdminService(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getOverview() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/admin/statistics/overview');
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getReservations({String? status}) async {
    try {
      final res = await _dio.get<List<dynamic>>(
        '/admin/reservations',
        queryParameters: status == null ? null : {'status': status},
      );
      return (res.data ?? []).map((e) => (e as Map<String, dynamic>)).toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> cancelReservation(String id) async {
    try {
      await _dio.delete('/admin/reservations/$id');
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getUsers() async {
    try {
      final res = await _dio.get<List<dynamic>>('/admin/users');
      return (res.data ?? []).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> updateUserRole(String userId, String role) async {
    try {
      await _dio.patch('/admin/users/$userId/role', data: {'role': role});
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> forceLogout(String userId) async {
    try {
      await _dio.post('/admin/users/$userId/force-logout', data: {});
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getAdminHalls() async {
    try {
      final res = await _dio.get<List<dynamic>>('/admin/halls');
      return (res.data ?? []).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getHallTables(String hallId) async {
    try {
      final res = await _dio.get<List<dynamic>>('/admin/halls/$hallId/tables');
      return (res.data ?? []).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> updateTable(String tableId, Map<String, dynamic> payload) async {
    try {
      await _dio.patch('/admin/tables/$tableId', data: payload);
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getSpecialPeriods() async {
    try {
      final res = await _dio.get<List<dynamic>>('/admin/special-periods');
      return (res.data ?? []).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> createSpecialPeriod(Map<String, dynamic> payload) async {
    try {
      await _dio.post('/admin/special-periods', data: payload);
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> toggleSpecialPeriodStatus(String id, bool isActive) async {
    try {
      await _dio.patch('/admin/special-periods/$id/status', data: {'isActive': isActive});
    } catch (e) {
      throwApiError(e);
    }
  }

  Future<void> deleteSpecialPeriod(String id) async {
    try {
      await _dio.delete('/admin/special-periods/$id');
    } catch (e) {
      throwApiError(e);
    }
  }
}

class DeskService {
  DeskService(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getTableSnapshot(String qrCode) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/desk/table-snapshot',
        data: {'qrCode': qrCode},
      );
      return res.data ?? <String, dynamic>{};
    } catch (e) {
      throwApiError(e);
    }
  }
}
