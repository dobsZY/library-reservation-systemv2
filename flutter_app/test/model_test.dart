import 'package:flutter_test/flutter_test.dart';
import 'package:library_reservation_flutter/src/features/shared/models.dart';

void main() {
  test('app user from json parses role', () {
    final user = AppUser.fromJson({
      'id': '1',
      'studentNumber': '123',
      'fullName': 'Test User',
      'role': 'admin',
    });
    expect(user.role, 'admin');
    expect(user.fullName, 'Test User');
  });

  test('reservation from json has id', () {
    final reservation = Reservation.fromJson({'id': 'r1', 'status': 'reserved'});
    expect(reservation.id, 'r1');
    expect(reservation.status, 'reserved');
  });
}
