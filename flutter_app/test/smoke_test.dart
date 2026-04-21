import 'package:flutter_test/flutter_test.dart';
import 'package:library_reservation_flutter/src/core/config/app_config.dart';

void main() {
  test('api base url is configured', () {
    expect(AppConfig.apiBaseUrl, isNotEmpty);
    expect(AppConfig.apiBaseUrl.contains('/api/v1'), isTrue);
  });
}
