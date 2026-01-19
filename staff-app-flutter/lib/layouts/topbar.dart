import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// Modern topbar widget
class AppTopbar extends StatelessWidget {

  const AppTopbar({
    super.key,
    required this.pageTitle,
    this.actions,
    required this.onMenuToggle,
    required this.isSidebarCollapsed,
  });
  final String pageTitle;
  final List<Widget>? actions;
  final VoidCallback onMenuToggle;
  final bool isSidebarCollapsed;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Page title
          Expanded(
            child: Row(
              children: [
                Text(
                  pageTitle,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1D21),
                  ),
                ),
              ],
            ),
          ),
          
          // Actions
          if (actions != null) ...actions!,
          
          const SizedBox(width: 16),
          
          // Search button
          _TopbarButton(
            icon: Icons.search_rounded,
            tooltip: 'بحث',
            onTap: () {
              // TODO: Show search dialog
            },
          ),
          
          const SizedBox(width: 8),
          
          // Notifications button
          _TopbarButton(
            icon: Icons.notifications_none_rounded,
            tooltip: 'الإشعارات',
            badge: '3',
            onTap: () {
              // TODO: Show notifications
            },
          ),
          
          const SizedBox(width: 16),
          
          // Divider
          Container(
            width: 1,
            height: 32,
            color: Colors.grey.shade200,
          ),
          
          const SizedBox(width: 16),
          
          // User dropdown
          _UserDropdown(),
        ],
      ),
    );
  }
}

/// Topbar action button
class _TopbarButton extends StatefulWidget {

  const _TopbarButton({
    required this.icon,
    required this.tooltip,
    this.badge,
    required this.onTap,
  });
  final IconData icon;
  final String tooltip;
  final String? badge;
  final VoidCallback onTap;

  @override
  State<_TopbarButton> createState() => _TopbarButtonState();
}

class _TopbarButtonState extends State<_TopbarButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Tooltip(
        message: widget.tooltip,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.onTap,
            borderRadius: BorderRadius.circular(10),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _isHovered 
                    ? const Color(0xFFF1F5F9) 
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      widget.icon,
                      size: 22,
                      color: _isHovered 
                          ? const Color(0xFF1A1D21)
                          : const Color(0xFF64748B),
                    ),
                  ),
                  if (widget.badge != null)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            widget.badge!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
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

/// User dropdown menu
class _UserDropdown extends StatefulWidget {
  @override
  State<_UserDropdown> createState() => _UserDropdownState();
}

class _UserDropdownState extends State<_UserDropdown> {
  bool _isHovered = false;
  bool _isOpen = false;
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _toggleDropdown() {
    if (_isOpen) {
      _removeOverlay();
    } else {
      _showOverlay();
    }
  }

  void _showOverlay() {
    final overlay = Overlay.of(context);
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        width: 220,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(-140, size.height + 8),
          child: Material(
            color: Colors.transparent,
            child: _DropdownMenu(
              onClose: _removeOverlay,
            ),
          ),
        ),
      ),
    );

    overlay.insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _isOpen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return CompositedTransformTarget(
      link: _layerLink,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _toggleDropdown,
            borderRadius: BorderRadius.circular(12),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: _isHovered || _isOpen
                    ? const Color(0xFFF1F5F9)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  // Avatar
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        user?.fullName.isNotEmpty == true
                            ? user!.fullName[0].toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  
                  // Name
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        user?.fullName ?? 'المستخدم',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1D21),
                        ),
                      ),
                      Text(
                        user?.role ?? 'موظف',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  
                  // Arrow
                  Icon(
                    _isOpen 
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    size: 18,
                    color: Colors.grey.shade500,
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

/// Dropdown menu content
class _DropdownMenu extends StatelessWidget {

  const _DropdownMenu({required this.onClose});
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _DropdownMenuItem(
            icon: Icons.person_outline_rounded,
            label: 'الملف الشخصي',
            onTap: () {
              onClose();
              // TODO: Navigate to profile
            },
          ),
          _DropdownMenuItem(
            icon: Icons.settings_outlined,
            label: 'الإعدادات',
            onTap: () {
              onClose();
              Navigator.pushNamed(context, '/settings');
            },
          ),
          const Divider(height: 1),
          _DropdownMenuItem(
            icon: Icons.logout_rounded,
            label: 'تسجيل الخروج',
            isDestructive: true,
            onTap: () async {
              onClose();
              final authProvider = Provider.of<AuthProvider>(context, listen: false);
              await authProvider.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
    );
  }
}

/// Dropdown menu item
class _DropdownMenuItem extends StatefulWidget {

  const _DropdownMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDestructive = false,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isDestructive;

  @override
  State<_DropdownMenuItem> createState() => _DropdownMenuItemState();
}

class _DropdownMenuItemState extends State<_DropdownMenuItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final color = widget.isDestructive
        ? const Color(0xFFEF4444)
        : _isHovered
            ? const Color(0xFF1A1D21)
            : const Color(0xFF64748B);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: _isHovered ? const Color(0xFFF8FAFC) : Colors.transparent,
            child: Row(
              children: [
                Icon(widget.icon, size: 18, color: color),
                const SizedBox(width: 12),
                Text(
                  widget.label,
                  style: TextStyle(
                    fontSize: 13,
                    color: color,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}



