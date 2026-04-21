import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:library_reservation_flutter/src/core/config/brand_theme.dart';
import 'package:library_reservation_flutter/src/core/router/app_router.dart';

class LibraryReservationApp extends ConsumerWidget {
  const LibraryReservationApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Selcuk Kutuphane',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: const ColorScheme.light(
          primary: BrandTheme.charcoal,
          secondary: BrandTheme.yellow,
          surface: BrandTheme.surface,
          onPrimary: Colors.white,
          onSecondary: BrandTheme.charcoal,
          onSurface: BrandTheme.charcoal,
        ),
        scaffoldBackgroundColor: BrandTheme.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: BrandTheme.surface,
          foregroundColor: BrandTheme.charcoal,
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: BrandTheme.surface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: BrandTheme.border),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: BrandTheme.yellow,
            foregroundColor: BrandTheme.charcoal,
            textStyle: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: BrandTheme.charcoal,
            side: const BorderSide(color: BrandTheme.border),
          ),
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
