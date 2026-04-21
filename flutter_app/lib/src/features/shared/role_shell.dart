import 'package:flutter/material.dart';

class RoleShell extends StatelessWidget {
  const RoleShell({
    super.key,
    required this.title,
    required this.tabs,
    required this.body,
    this.onLogout,
  });

  final String title;
  final List<Widget> tabs;
  final Widget body;
  final VoidCallback? onLogout;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          if (onLogout != null)
            IconButton(
              onPressed: onLogout,
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: body,
      bottomNavigationBar: tabs.isEmpty ? null : NavigationBar(destinations: tabs),
    );
  }
}
