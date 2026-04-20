import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:library_reservation_flutter/src/features/auth/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _studentController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _error;

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (next.hasError) {
        setState(() => _error = next.error.toString());
      }
      final user = next.valueOrNull;
      if (user != null) {
        if (user.role == 'admin') context.go('/admin');
        if (user.role == 'staff') context.go('/staff');
        if (user.role != 'admin' && user.role != 'staff') context.go('/student');
      }
    });
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Selcuk Kutuphane', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _studentController,
                    decoration: const InputDecoration(labelText: 'Ogrenci no / kullanici adi'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Sifre'),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ],
                  const SizedBox(height: 12),
                  const Text(
                    'Test hesaplari:\nOgrenci: 200000001 / Student123!\nAdmin: admin001 / Admin123!\nPersonel: staff001 / Staff123!',
                    style: TextStyle(fontSize: 12, color: Colors.black54),
                  ),
                  const SizedBox(height: 18),
                  FilledButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            if (_studentController.text.trim().isEmpty || _passwordController.text.isEmpty) {
                              setState(() => _error = 'Kullanici adi ve sifre zorunludur.');
                              return;
                            }
                            setState(() => _error = null);
                            ref
                                .read(authControllerProvider.notifier)
                                .login(_studentController.text.trim(), _passwordController.text);
                          },
                    child: isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Giris Yap'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
