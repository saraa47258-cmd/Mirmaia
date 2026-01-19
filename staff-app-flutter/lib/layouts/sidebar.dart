import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// Navigation item model
class NavItem {

  const NavItem({
    required this.id,
    required this.label,
    required this.icon,
    required this.route,
    this.badge,
    this.badgeColor,
  });
  final String id;
  final String label;
  final IconData icon;
  final String route;
  final String? badge;
  final Color? badgeColor;
}

/// Navigation section model
class NavSection {

  const NavSection({
    this.title,
    required this.items,
  });
  final String? title;
  final List<NavItem> items;
}

/// Professional sidebar widget
class AppSidebar extends StatefulWidget {

  const AppSidebar({
    super.key,
    required this.currentRoute,
    required this.isCollapsed,
    required this.onToggleCollapse,
  });
  final String currentRoute;
  final bool isCollapsed;
  final VoidCallback onToggleCollapse;

  @override
  State<AppSidebar> createState() => _AppSidebarState();
}

class _AppSidebarState extends State<AppSidebar> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _widthAnimation;

  static const double _expandedWidth = 260;
  static const double _collapsedWidth = 72;

  // Navigation sections
  static const List<NavSection> _sections = [
    NavSection(
      items: [
        NavItem(
          id: 'dashboard',
          label: 'لوحة التحكم',
          icon: Icons.dashboard_rounded,
          route: '/dashboard',
        ),
      ],
    ),
    NavSection(
      title: 'الطلبات',
      items: [
        NavItem(
          id: 'cashier',
          label: 'الكاشير',
          icon: Icons.point_of_sale_rounded,
          route: '/cashier',
        ),
        NavItem(
          id: 'orders',
          label: 'الطلبات',
          icon: Icons.receipt_long_rounded,
          route: '/orders',
        ),
        NavItem(
          id: 'tables',
          label: 'الطاولات',
          icon: Icons.table_restaurant_rounded,
          route: '/tables',
        ),
        NavItem(
          id: 'rooms',
          label: 'الغرف',
          icon: Icons.meeting_room_rounded,
          route: '/room-orders',
        ),
      ],
    ),
    NavSection(
      title: 'المنيو',
      items: [
        NavItem(
          id: 'menu',
          label: 'قائمة الطعام',
          icon: Icons.restaurant_menu_rounded,
          route: '/staff-menu',
        ),
        NavItem(
          id: 'inventory',
          label: 'المخزون',
          icon: Icons.inventory_2_rounded,
          route: '/inventory',
        ),
      ],
    ),
    NavSection(
      title: 'التقارير',
      items: [
        NavItem(
          id: 'reports',
          label: 'التقارير',
          icon: Icons.analytics_rounded,
          route: '/reports',
        ),
        NavItem(
          id: 'settings',
          label: 'الإعدادات',
          icon: Icons.settings_rounded,
          route: '/settings',
        ),
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _widthAnimation = Tween<double>(
      begin: _expandedWidth,
      end: _collapsedWidth,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    if (widget.isCollapsed) {
      _animationController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(AppSidebar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isCollapsed != oldWidget.isCollapsed) {
      if (widget.isCollapsed) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _widthAnimation,
      builder: (context, child) {
        return Container(
          width: _widthAnimation.value,
          decoration: BoxDecoration(
            color: const Color(0xFF1A1D21),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(-4, 0),
              ),
            ],
          ),
          child: Column(
            children: [
              // Logo area
              _buildLogoArea(),
              
              // Navigation
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _buildNavSections(),
                  ),
                ),
              ),
              
              // Bottom section - User profile
              _buildUserSection(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLogoArea() {
    final isCollapsed = _widthAnimation.value < 150;
    
    return Container(
      height: 64,
      padding: EdgeInsets.symmetric(
        horizontal: isCollapsed ? 16 : 20,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
      ),
      child: Row(
        children: [
          // Logo icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFD4A574), Color(0xFFB8956E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.coffee_rounded,
              color: Colors.white,
              size: 22,
            ),
          ),
          
          // App name
          if (!isCollapsed) ...[
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'قهوة الشام',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'نظام الموظفين',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildNavSections() {
    final List<Widget> sections = [];
    final isCollapsed = _widthAnimation.value < 150;

    for (final section in _sections) {
      // Section title
      if (section.title != null && !isCollapsed) {
        sections.add(
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
            child: Text(
              section.title!,
              style: TextStyle(
                color: Colors.white.withOpacity(0.4),
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
        );
      } else if (section.title != null && isCollapsed) {
        sections.add(const SizedBox(height: 16));
      }

      // Section items
      for (final item in section.items) {
        sections.add(
          _NavItemWidget(
            item: item,
            isActive: widget.currentRoute == item.route,
            isCollapsed: isCollapsed,
            onTap: () => _navigateTo(item.route),
          ),
        );
      }
    }

    return sections;
  }

  Widget _buildUserSection() {
    final isCollapsed = _widthAnimation.value < 150;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
      ),
      child: Column(
        children: [
          // Collapse toggle
          _NavItemWidget(
            item: NavItem(
              id: 'collapse',
              label: isCollapsed ? 'توسيع' : 'طي',
              icon: isCollapsed 
                  ? Icons.keyboard_double_arrow_left_rounded
                  : Icons.keyboard_double_arrow_right_rounded,
              route: '',
            ),
            isActive: false,
            isCollapsed: isCollapsed,
            onTap: widget.onToggleCollapse,
          ),
          
          const SizedBox(height: 8),
          
          // User info
          if (user != null)
            Container(
              padding: EdgeInsets.all(isCollapsed ? 8 : 12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  // Avatar
                  Container(
                    width: isCollapsed ? 40 : 36,
                    height: isCollapsed ? 40 : 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF6366F1),
                          Color(0xFF8B5CF6),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        user.fullName.isNotEmpty 
                            ? user.fullName[0].toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  
                  if (!isCollapsed) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.fullName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            user.role,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _navigateTo(String route) {
    if (route.isNotEmpty && route != widget.currentRoute) {
      Navigator.pushReplacementNamed(context, route);
    }
  }
}

/// Individual navigation item widget
class _NavItemWidget extends StatefulWidget {

  const _NavItemWidget({
    required this.item,
    required this.isActive,
    required this.isCollapsed,
    required this.onTap,
  });
  final NavItem item;
  final bool isActive;
  final bool isCollapsed;
  final VoidCallback onTap;

  @override
  State<_NavItemWidget> createState() => _NavItemWidgetState();
}

class _NavItemWidgetState extends State<_NavItemWidget> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final isActive = widget.isActive;
    final isHovered = _isHovered;

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: widget.isCollapsed ? 12 : 12,
        vertical: 2,
      ),
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Tooltip(
          message: widget.isCollapsed ? widget.item.label : '',
          preferBelow: false,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(10),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: EdgeInsets.symmetric(
                  horizontal: widget.isCollapsed ? 12 : 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: isActive
                      ? const Color(0xFFD4A574).withOpacity(0.15)
                      : isHovered
                          ? Colors.white.withOpacity(0.05)
                          : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  border: isActive
                      ? Border.all(
                          color: const Color(0xFFD4A574).withOpacity(0.3),
                          width: 1,
                        )
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: widget.isCollapsed
                      ? MainAxisAlignment.center
                      : MainAxisAlignment.start,
                  children: [
                    // Icon
                    Icon(
                      widget.item.icon,
                      size: 20,
                      color: isActive
                          ? const Color(0xFFD4A574)
                          : isHovered
                              ? Colors.white
                              : Colors.white.withOpacity(0.6),
                    ),
                    
                    // Label
                    if (!widget.isCollapsed) ...[
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          widget.item.label,
                          style: TextStyle(
                            color: isActive
                                ? const Color(0xFFD4A574)
                                : isHovered
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.7),
                            fontSize: 13,
                            fontWeight: isActive 
                                ? FontWeight.w600 
                                : FontWeight.w500,
                          ),
                        ),
                      ),
                      
                      // Badge
                      if (widget.item.badge != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: widget.item.badgeColor ?? const Color(0xFFEF4444),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            widget.item.badge!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}



