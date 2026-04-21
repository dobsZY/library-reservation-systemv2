import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:library_reservation_flutter/src/features/student/student_screens.dart';

void main() {
  testWidgets('help support screen renders title', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: HelpSupportScreen(),
      ),
    );

    expect(find.text('Yardim & Destek'), findsAtLeastNWidgets(1));
  });
}
