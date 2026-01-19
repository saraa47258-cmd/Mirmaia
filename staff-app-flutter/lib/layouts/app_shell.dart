import 'package:flutter/material.dart';
import 'sidebar.dart';
import 'topbar.dart';

/// Modern app shell with sidebar and topbar
/// Inspired by ClickUp, Monday, Notion style
class AppShell extends StatefulWidget {

  const AppShell({
    super.key,
    required this.child,
    required this.currentRoute,
    required this.pageTitle,
    this.actions,
  });
  final Widget child;
  final String currentRoute;
  final String pageTitle;
  final List<Widget>? actions;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  bool _sidebarCollapsed = false;

  void _toggleSidebar() {
    setState(() {
      _sidebarCollapsed = !_sidebarCollapsed;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: Row(
          children: [
            // Sidebar (Right side in RTL)
            AppSidebar(
              currentRoute: widget.currentRoute,
              isCollapsed: _sidebarCollapsed,
              onToggleCollapse: _toggleSidebar,
            ),
            
            // Main content area
            Expanded(
              child: Column(
                children: [
                  // Topbar
                  AppTopbar(
                    pageTitle: widget.pageTitle,
                    actions: widget.actions,
                    onMenuToggle: _toggleSidebar,
                    isSidebarCollapsed: _sidebarCollapsed,
                  ),
                  
                  // Page content
                  Expanded(
                    child: widget.child,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

