import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../layouts/app_shell.dart';
import '../providers/auth_provider.dart';
import '../services/order_service.dart';

/// Modern Dashboard Screen
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final OrderService _orderService = OrderService();
  Map<String, dynamic> _todaySummary = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final summary = await _orderService.getTodaySummary();
      setState(() {
        _todaySummary = summary;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return AppShell(
      currentRoute: '/dashboard',
      pageTitle: 'لوحة التحكم',
      child: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome card
              _WelcomeCard(userName: user?.fullName ?? 'المستخدم'),
              
              const SizedBox(height: 24),
              
              // Stats grid
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _StatsGrid(summary: _todaySummary),
              
              const SizedBox(height: 24),
              
              // Quick actions
              _QuickActionsSection(),
              
              const SizedBox(height: 24),
              
              // Recent activity
              _RecentActivitySection(),
            ],
          ),
        ),
      ),
    );
  }
}

/// Welcome card widget
class _WelcomeCard extends StatelessWidget {

  const _WelcomeCard({required this.userName});
  final String userName;

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$_greeting، $userName 👋',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'أهلاً بك في نظام إدارة قهوة الشام',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.coffee_rounded,
              color: Colors.white,
              size: 40,
            ),
          ),
        ],
      ),
    );
  }
}

/// Stats grid widget
class _StatsGrid extends StatelessWidget {

  const _StatsGrid({required this.summary});
  final Map<String, dynamic> summary;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.4,
      children: [
        _StatCard(
          title: 'إجمالي الطلبات',
          value: '${summary['totalOrders'] ?? 0}',
          subtitle: 'اليوم',
          icon: Icons.receipt_long_rounded,
          color: const Color(0xFF3B82F6),
        ),
        _StatCard(
          title: 'الطلبات المكتملة',
          value: '${summary['completedOrders'] ?? 0}',
          subtitle: 'اليوم',
          icon: Icons.check_circle_rounded,
          color: const Color(0xFF22C55E),
        ),
        _StatCard(
          title: 'قيد الانتظار',
          value: '${summary['pendingOrders'] ?? 0}',
          subtitle: 'طلب',
          icon: Icons.hourglass_top_rounded,
          color: const Color(0xFFF59E0B),
        ),
        _StatCard(
          title: 'إجمالي المبيعات',
          value: '${(summary['totalSales'] ?? 0.0).toStringAsFixed(0)}',
          subtitle: 'ر.س',
          icon: Icons.payments_rounded,
          color: const Color(0xFF8B5CF6),
        ),
      ],
    );
  }
}

/// Individual stat card
class _StatCard extends StatefulWidget {

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  @override
  State<_StatCard> createState() => _StatCardState();
}

class _StatCardState extends State<_StatCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isHovered ? widget.color.withOpacity(0.3) : Colors.transparent,
          ),
          boxShadow: [
            BoxShadow(
              color: _isHovered 
                  ? widget.color.withOpacity(0.15)
                  : Colors.black.withOpacity(0.03),
              blurRadius: _isHovered ? 20 : 10,
              offset: Offset(0, _isHovered ? 8 : 4),
            ),
          ],
        ),
        transform: _isHovered 
            ? (Matrix4.identity()..translate(0.0, -4.0))
            : Matrix4.identity(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    widget.icon,
                    color: widget.color,
                    size: 22,
                  ),
                ),
                const Icon(
                  Icons.trending_up_rounded,
                  color: Color(0xFF22C55E),
                  size: 20,
                ),
              ],
            ),
            const Spacer(),
            Text(
              widget.title,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  widget.value,
                  style: const TextStyle(
                    color: Color(0xFF1A1D21),
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 4),
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    widget.subtitle,
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Quick actions section
class _QuickActionsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'إجراءات سريعة',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1D21),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                title: 'طلب جديد',
                subtitle: 'افتح الكاشير',
                icon: Icons.add_shopping_cart_rounded,
                color: const Color(0xFFD4A574),
                onTap: () => Navigator.pushNamed(context, '/cashier'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _QuickActionCard(
                title: 'الطاولات',
                subtitle: 'إدارة الطاولات',
                icon: Icons.table_restaurant_rounded,
                color: const Color(0xFF3B82F6),
                onTap: () => Navigator.pushNamed(context, '/tables'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _QuickActionCard(
                title: 'طلبات الغرف',
                subtitle: 'متابعة الغرف',
                icon: Icons.meeting_room_rounded,
                color: const Color(0xFF8B5CF6),
                onTap: () => Navigator.pushNamed(context, '/room-orders'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _QuickActionCard(
                title: 'المنيو',
                subtitle: 'قائمة الطعام',
                icon: Icons.restaurant_menu_rounded,
                color: const Color(0xFF22C55E),
                onTap: () => Navigator.pushNamed(context, '/staff-menu'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Quick action card
class _QuickActionCard extends StatefulWidget {

  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  State<_QuickActionCard> createState() => _QuickActionCardState();
}

class _QuickActionCardState extends State<_QuickActionCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: _isHovered ? widget.color : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _isHovered ? widget.color : Colors.grey.shade200,
            ),
            boxShadow: _isHovered
                ? [
                    BoxShadow(
                      color: widget.color.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _isHovered 
                      ? Colors.white.withOpacity(0.2)
                      : widget.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  widget.icon,
                  color: _isHovered ? Colors.white : widget.color,
                  size: 24,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                widget.title,
                style: TextStyle(
                  color: _isHovered ? Colors.white : const Color(0xFF1A1D21),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.subtitle,
                style: TextStyle(
                  color: _isHovered 
                      ? Colors.white.withOpacity(0.8)
                      : Colors.grey.shade500,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Recent activity section
class _RecentActivitySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'النشاط الأخير',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1D21),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/orders'),
              child: const Text('عرض الكل'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: const Column(
            children: [
              _ActivityItem(
                icon: Icons.shopping_cart_rounded,
                color: Color(0xFF22C55E),
                title: 'طلب جديد #1234',
                subtitle: 'طاولة 5 - 3 أصناف',
                time: 'منذ 5 دقائق',
              ),
              Divider(height: 24),
              _ActivityItem(
                icon: Icons.check_circle_rounded,
                color: Color(0xFF3B82F6),
                title: 'تم إكمال طلب #1233',
                subtitle: 'غرفة VIP - 85 ر.س',
                time: 'منذ 15 دقيقة',
              ),
              Divider(height: 24),
              _ActivityItem(
                icon: Icons.payments_rounded,
                color: Color(0xFF8B5CF6),
                title: 'دفع نقدي',
                subtitle: 'طاولة 3 - 120 ر.س',
                time: 'منذ 30 دقيقة',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Activity item
class _ActivityItem extends StatelessWidget {

  const _ActivityItem({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.time,
  });
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String time;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Color(0xFF1A1D21),
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
        ),
        Text(
          time,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade400,
          ),
        ),
      ],
    );
  }
}



