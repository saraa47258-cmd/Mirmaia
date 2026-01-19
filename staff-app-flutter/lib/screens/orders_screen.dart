import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/realtime_database_service.dart';
import '../providers/auth_provider.dart';
import '../utils/responsive.dart';

/// Professional Orders Screen - Shows today's orders with full management
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final RealtimeDatabaseService _dbService = RealtimeDatabaseService();
  final TextEditingController _searchController = TextEditingController();

  List<Map<String, dynamic>> _orders = [];
  bool _isLoading = true;
  bool _showDeleted = false;
  String _searchQuery = '';
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    
    try {
      final orders = await _dbService.getTodayOrders(includeDeleted: _showDeleted);
      
      if (mounted) {
        setState(() {
          _orders = orders;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Map<String, dynamic>> get _filteredOrders {
    return _orders.where((order) {
      if (_statusFilter != 'all' && order['status'] != _statusFilter) {
        return false;
      }

      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final orderId = order['id']?.toString().toLowerCase() ?? '';
        final tableNumber = order['tableNumber']?.toString().toLowerCase() ?? '';
        final roomNumber = order['roomNumber']?.toString().toLowerCase() ?? '';
        final customerName = order['customerName']?.toString().toLowerCase() ?? '';
        
        return orderId.contains(query) ||
            tableNumber.contains(query) ||
            roomNumber.contains(query) ||
            customerName.contains(query);
      }

      return true;
    }).toList();
  }

  // Stats calculations
  int get _totalOrders => _filteredOrders.length;
  int get _pendingOrders => _filteredOrders.where((o) => o['status'] == 'pending').length;
  int get _completedOrders => _filteredOrders.where((o) => o['status'] == 'completed').length;
  double get _totalRevenue => _filteredOrders.fold(0.0, (sum, o) => sum + ((o['total'] ?? 0).toDouble()));

  @override
  Widget build(BuildContext context) {
    final responsive = Responsive(context);
    
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Container(
        color: const Color(0xFFF8FAFC),
        child: Column(
          children: [
            _buildHeader(responsive),
            if (!responsive.isMobile) _buildStatsCards(responsive),
            _buildFiltersBar(responsive),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _filteredOrders.isEmpty
                      ? _buildEmptyState()
                      : responsive.isMobile
                          ? _buildOrdersListMobile()
                          : _buildOrdersList(responsive),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Responsive responsive) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        responsive.pagePadding, 
        responsive.isMobile ? 12 : 20, 
        responsive.pagePadding, 
        responsive.isMobile ? 12 : 16
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: responsive.isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'إدارة الطلبات',
                            style: TextStyle(
                              fontSize: responsive.titleSize,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'طلبات اليوم • $_totalOrders طلب',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: _loadOrders,
                      icon: const Icon(Icons.refresh, color: Color(0xFF6366F1)),
                    ),
                  ],
                ),
              ],
            )
          : Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'إدارة الطلبات',
                        style: TextStyle(
                          fontSize: responsive.titleSize,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF22C55E),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'طلبات اليوم • $_totalOrders طلب',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Show Deleted Toggle (hide on tablet)
                if (responsive.isDesktopOrLarger)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _showDeleted ? const Color(0xFFFEE2E2) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _showDeleted ? Icons.visibility : Icons.visibility_off,
                          size: 16,
                          color: _showDeleted ? const Color(0xFFDC2626) : const Color(0xFF64748B),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'المحذوفة',
                          style: TextStyle(
                            fontSize: 12,
                            color: _showDeleted ? const Color(0xFFDC2626) : const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 20,
                          child: Switch(
                            value: _showDeleted,
                            onChanged: (value) {
                              setState(() => _showDeleted = value);
                              _loadOrders();
                            },
                            activeThumbColor: const Color(0xFFDC2626),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),
                      ],
                    ),
                  ),
                
                const SizedBox(width: 12),
                
                // Refresh Button
                Material(
                  color: const Color(0xFF6366F1),
                  borderRadius: BorderRadius.circular(10),
                  child: InkWell(
                    onTap: _loadOrders,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.refresh, color: Colors.white, size: 18),
                          if (responsive.isDesktopOrLarger) ...[
                            const SizedBox(width: 8),
                            const Text(
                              'تحديث',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStatsCards(Responsive responsive) {
    final stats = [
      ('إجمالي الطلبات', '$_totalOrders', Icons.receipt_long_rounded, const Color(0xFF3B82F6), '+12%', true),
      ('قيد الانتظار', '$_pendingOrders', Icons.hourglass_top_rounded, const Color(0xFFF59E0B), null, false),
      ('مكتملة', '$_completedOrders', Icons.check_circle_rounded, const Color(0xFF22C55E), null, false),
      ('الإيرادات', (_totalRevenue.toStringAsFixed(3)), Icons.payments_rounded, const Color(0xFF8B5CF6), null, false),
    ];

    // Use Wrap instead of GridView for better responsiveness
    return Container(
      padding: EdgeInsets.all(responsive.pagePadding),
      child: Wrap(
        spacing: 16,
        runSpacing: 16,
        children: stats.map((stat) {
          // Calculate card width based on screen size
          final cardWidth = responsive.value(
            mobile: (responsive.screenWidth - 56) / 2,
            tablet: (responsive.screenWidth - 150) / 4,
            desktop: (responsive.screenWidth - 360) / 4,
            largeDesktop: (responsive.screenWidth - 400) / 4,
          );
          return SizedBox(
            width: cardWidth,
            child: _StatCard(
              title: stat.$1,
              value: stat.$2,
              icon: stat.$3,
              color: stat.$4,
              trend: stat.$5,
              trendUp: stat.$6,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFiltersBar(Responsive responsive) {
    return Container(
      padding: EdgeInsets.fromLTRB(responsive.pagePadding, 0, responsive.pagePadding, 16),
      child: responsive.isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Search
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) => setState(() => _searchQuery = value),
                    style: const TextStyle(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'بحث...',
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                      prefixIcon: Icon(Icons.search, color: Colors.grey.shade400, size: 20),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Status Filter Chips - Wrap
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(children: _buildStatusChips()),
                ),
              ],
            )
          : Row(
              children: [
                // Search
                Expanded(
                  flex: 2,
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) => setState(() => _searchQuery = value),
                      style: const TextStyle(fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'بحث برقم الطلب / الطاولة / الغرفة / اسم العميل...',
                        hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                        prefixIcon: Icon(Icons.search, color: Colors.grey.shade400, size: 20),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(width: 12),
                
                // Status Filter Chips
                Flexible(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(children: _buildStatusChips()),
                  ),
                ),
              ],
            ),
    );
  }

  // Mobile Orders List (Card-based)
  Widget _buildOrdersListMobile() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _filteredOrders.length,
      itemBuilder: (context, index) {
        final order = _filteredOrders[index];
        return _OrderCardMobile(
          order: order,
          onView: () => _showOrderDetails(order),
          onStatusChange: () => _showStatusDialog(order),
          onPayment: () => _showPaymentDialog(order),
          onDelete: () => _showDeleteDialog(order),
        );
      },
    );
  }

  Widget _buildOrdersList(Responsive responsive) {
    // For tablet, show fewer columns
    final showFullTable = responsive.isDesktopOrLarger;
    
    return Container(
      margin: EdgeInsets.fromLTRB(responsive.pagePadding, 0, responsive.pagePadding, responsive.pagePadding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          children: [
            // Table Header
            Container(
              padding: EdgeInsets.symmetric(horizontal: responsive.pagePadding, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  const Expanded(flex: 2, child: _TableHeader('الطلب')),
                  const Expanded(flex: 2, child: _TableHeader('الموقع')),
                  if (showFullTable) const Expanded(flex: 1, child: _TableHeader('العناصر')),
                  const Expanded(flex: 2, child: _TableHeader('الإجمالي')),
                  const Expanded(flex: 2, child: _TableHeader('الحالة')),
                  if (showFullTable) const Expanded(flex: 2, child: _TableHeader('الدفع')),
                  if (showFullTable) const Expanded(flex: 1, child: _TableHeader('الوقت')),
                  const Expanded(flex: 2, child: _TableHeader('الإجراءات')),
                ],
              ),
            ),
            
            // Table Body
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.zero,
                itemCount: _filteredOrders.length,
                separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFE2E8F0)),
                itemBuilder: (context, index) {
                  return _OrderRow(
                    order: _filteredOrders[index],
                    showFullRow: showFullTable,
                    onView: () => _showOrderDetails(_filteredOrders[index]),
                    onStatusChange: () => _showStatusDialog(_filteredOrders[index]),
                    onPayment: () => _showPaymentDialog(_filteredOrders[index]),
                    onDelete: () => _showDeleteDialog(_filteredOrders[index]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildStatusChips() {
    final statuses = [
      ('all', 'الكل', const Color(0xFF64748B)),
      ('pending', 'قيد الانتظار', const Color(0xFFF59E0B)),
      ('preparing', 'قيد التحضير', const Color(0xFF3B82F6)),
      ('ready', 'جاهز', const Color(0xFF22C55E)),
      ('completed', 'مكتمل', const Color(0xFF64748B)),
    ];

    return statuses.map((status) {
      final isSelected = _statusFilter == status.$1;
      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: Material(
          color: isSelected ? status.$3 : Colors.white,
          borderRadius: BorderRadius.circular(20),
          child: InkWell(
            onTap: () => setState(() => _statusFilter = status.$1),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? status.$3 : const Color(0xFFE2E8F0),
                ),
              ),
              child: Text(
                status.$2,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                ),
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(60),
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 56,
              color: Colors.grey.shade400,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'لا توجد طلبات',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'الطلبات الجديدة ستظهر هنا تلقائياً',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  void _showOrderDetails(Map<String, dynamic> order) {
    showDialog(
      context: context,
      builder: (context) => _OrderDetailsDialog(order: order),
    );
  }

  void _showStatusDialog(Map<String, dynamic> order) {
    final orderId = order['id']?.toString() ?? '';
    String selectedStatus = order['status']?.toString() ?? 'pending';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.edit_note, color: Color(0xFF6366F1)),
              ),
              const SizedBox(width: 12),
              const Text('تحديث الحالة'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ...[
                ('pending', 'قيد الانتظار', const Color(0xFFF59E0B), Icons.hourglass_top),
                ('preparing', 'قيد التحضير', const Color(0xFF3B82F6), Icons.restaurant),
                ('ready', 'جاهز', const Color(0xFF22C55E), Icons.check_circle),
                ('completed', 'مكتمل', const Color(0xFF64748B), Icons.done_all),
                ('cancelled', 'ملغي', const Color(0xFFDC2626), Icons.cancel),
              ].map((item) => _StatusOption(
                value: item.$1,
                label: item.$2,
                color: item.$3,
                icon: item.$4,
                isSelected: selectedStatus == item.$1,
                onTap: () => setDialogState(() => selectedStatus = item.$1),
              )),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                await _dbService.updateOrderStatus(orderId, selectedStatus);
                _loadOrders();
                _showSnackBar('تم تحديث الحالة بنجاح');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('حفظ'),
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentDialog(Map<String, dynamic> order) {
    final orderId = order['id']?.toString() ?? '';
    String paymentMethod = 'cash';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF22C55E).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.payments, color: Color(0xFF22C55E)),
              ),
              const SizedBox(width: 12),
              const Text('تسجيل الدفع'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${(order['total'] ?? 0).toDouble().toStringAsFixed(3)}',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF22C55E),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'ر.ع',
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF22C55E),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _PaymentMethodCard(
                      icon: Icons.money,
                      label: 'نقداً',
                      isSelected: paymentMethod == 'cash',
                      onTap: () => setDialogState(() => paymentMethod = 'cash'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _PaymentMethodCard(
                      icon: Icons.credit_card,
                      label: 'بطاقة',
                      isSelected: paymentMethod == 'card',
                      onTap: () => setDialogState(() => paymentMethod = 'card'),
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                await _dbService.markOrderAsPaid(orderId, paymentMethod: paymentMethod);
                _loadOrders();
                _showSnackBar('تم تسجيل الدفع بنجاح', isSuccess: true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF22C55E),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('تأكيد الدفع'),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteDialog(Map<String, dynamic> order) {
    final orderId = order['id']?.toString() ?? '';
    final orderNumber = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
    final reasonController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.delete_outline, color: Color(0xFFDC2626)),
            ),
            const SizedBox(width: 12),
            const Text('حذف الطلب'),
          ],
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber, color: Color(0xFFDC2626), size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'طلب #$orderNumber',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFDC2626),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'سبب الحذف (مطلوب):',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: reasonController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'أدخل سبب حذف الطلب...',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'يرجى إدخال سبب الحذف';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.pop(context);
                
                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                final success = await _dbService.softDeleteOrder(
                  orderId: orderId,
                  reason: reasonController.text.trim(),
                  deletedByUserId: authProvider.user?.uid ?? '',
                  deletedByName: authProvider.user?.fullName ?? '',
                );
                
                if (success) {
                  _loadOrders();
                  _showSnackBar('تم حذف الطلب', isError: true);
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(String message, {bool isSuccess = false, bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : isError ? Icons.error : Icons.info,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: isSuccess ? const Color(0xFF22C55E) : isError ? const Color(0xFFDC2626) : const Color(0xFF6366F1),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}

// ==================== Stat Card ====================
class _StatCard extends StatelessWidget {

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.trend,
    this.trendUp = true,
  });
  final String title;
  final String value;
  final String? suffix;
  final IconData icon;
  final Color color;
  final String? trend;
  final bool trendUp;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: trendUp ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trendUp ? Icons.arrow_upward : Icons.arrow_downward,
                        size: 10,
                        color: trendUp ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        trend!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: trendUp ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF64748B),
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: AlignmentDirectional.centerStart,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (suffix != null) ...[
                  const SizedBox(width: 4),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Text(
                      suffix!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
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
}

// ==================== Table Header ====================
class _TableHeader extends StatelessWidget {
  const _TableHeader(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: Color(0xFF64748B),
      ),
    );
  }
}

// ==================== Order Row ====================
// ==================== Mobile Order Card ====================
class _OrderCardMobile extends StatelessWidget {

  const _OrderCardMobile({
    required this.order,
    required this.onView,
    required this.onStatusChange,
    required this.onPayment,
    required this.onDelete,
  });
  final Map<String, dynamic> order;
  final VoidCallback onView;
  final VoidCallback onStatusChange;
  final VoidCallback onPayment;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final orderId = order['id']?.toString() ?? '';
    final orderNumber = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
    final orderType = order['orderType']?.toString() ?? 'table';
    final tableNumber = order['tableNumber']?.toString();
    final roomNumber = order['roomNumber']?.toString();
    final total = (order['total'] ?? 0).toDouble();
    final status = order['status']?.toString() ?? 'pending';
    final paid = order['paid'] == true;
    final createdAt = DateTime.tryParse(order['createdAt']?.toString() ?? '');
    final isDeleted = order['isDeleted'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDeleted ? const Color(0xFFFEF2F2) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onView,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '#$orderNumber',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDeleted ? const Color(0xFFDC2626) : const Color(0xFF6366F1),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildStatusBadgeCompact(status),
                    const Spacer(),
                    Text(
                      createdAt != null 
                          ? '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}'
                          : '',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Location & Total
                Row(
                  children: [
                    Icon(
                      orderType == 'room' ? Icons.meeting_room : Icons.table_restaurant,
                      size: 16,
                      color: const Color(0xFF64748B),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        tableNumber != null 
                            ? 'طاولة $tableNumber'
                            : roomNumber != null
                                ? 'غرفة $roomNumber'
                                : '-',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '${total.toStringAsFixed(3)} ر.ع',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF22C55E),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Actions
                Row(
                  children: [
                    _buildPaymentBadgeCompact(paid),
                    const Spacer(),
                    if (!isDeleted) ...[
                      _MobileActionButton(
                        icon: Icons.edit_outlined,
                        onTap: onStatusChange,
                      ),
                      const SizedBox(width: 8),
                      if (!paid)
                        _MobileActionButton(
                          icon: Icons.payment,
                          onTap: onPayment,
                          color: const Color(0xFF22C55E),
                        ),
                      const SizedBox(width: 8),
                      _MobileActionButton(
                        icon: Icons.delete_outline,
                        onTap: onDelete,
                        color: const Color(0xFFDC2626),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadgeCompact(String status) {
    final config = {
      'pending': ('انتظار', const Color(0xFFF59E0B)),
      'preparing': ('تحضير', const Color(0xFF3B82F6)),
      'ready': ('جاهز', const Color(0xFF22C55E)),
      'completed': ('مكتمل', const Color(0xFF64748B)),
      'cancelled': ('ملغي', const Color(0xFFDC2626)),
    };
    final data = config[status] ?? ('غير معروف', const Color(0xFF64748B));

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        data.$1,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: data.$2),
      ),
    );
  }

  Widget _buildPaymentBadgeCompact(bool paid) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          paid ? Icons.check_circle : Icons.cancel,
          size: 14,
          color: paid ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
        ),
        const SizedBox(width: 4),
        Text(
          paid ? 'مدفوع' : 'غير مدفوع',
          style: TextStyle(
            fontSize: 11,
            color: paid ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
          ),
        ),
      ],
    );
  }
}

class _MobileActionButton extends StatelessWidget {

  const _MobileActionButton({
    required this.icon,
    required this.onTap,
    this.color = const Color(0xFF6366F1),
  });
  final IconData icon;
  final VoidCallback onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withOpacity(0.1),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(icon, size: 18, color: color),
        ),
      ),
    );
  }
}

// ==================== Order Row ====================
class _OrderRow extends StatefulWidget {

  const _OrderRow({
    required this.order,
    this.showFullRow = true,
    required this.onView,
    required this.onStatusChange,
    required this.onPayment,
    required this.onDelete,
  });
  final Map<String, dynamic> order;
  final bool showFullRow;
  final VoidCallback onView;
  final VoidCallback onStatusChange;
  final VoidCallback onPayment;
  final VoidCallback onDelete;

  @override
  State<_OrderRow> createState() => _OrderRowState();
}

class _OrderRowState extends State<_OrderRow> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final orderId = order['id']?.toString() ?? '';
    final orderNumber = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
    final orderType = order['orderType']?.toString() ?? 'table';
    final tableNumber = order['tableNumber']?.toString();
    final roomNumber = order['roomNumber']?.toString();
    final itemsCount = order['itemsCount'] ?? (order['items'] as List?)?.length ?? 0;
    final total = (order['total'] ?? 0).toDouble();
    final status = order['status']?.toString() ?? 'pending';
    final paid = order['paid'] == true;
    final createdAt = DateTime.tryParse(order['createdAt']?.toString() ?? '');
    final isDeleted = order['isDeleted'] == true;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        color: isDeleted 
            ? const Color(0xFFFEF2F2) 
            : _isHovered 
                ? const Color(0xFFF8FAFC) 
                : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            // Order Number
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isDeleted 
                          ? const Color(0xFFFEE2E2)
                          : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '#',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDeleted ? const Color(0xFFDC2626) : const Color(0xFF6366F1),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        orderNumber,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDeleted ? const Color(0xFFDC2626) : const Color(0xFF0F172A),
                          decoration: isDeleted ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      if (isDeleted)
                        const Text(
                          'محذوف',
                          style: TextStyle(fontSize: 10, color: Color(0xFFDC2626)),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            // Location
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  _buildOrderTypeBadge(orderType),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      tableNumber != null 
                          ? 'طاولة $tableNumber'
                          : roomNumber != null
                              ? 'غرفة $roomNumber'
                              : '-',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Items (only on full row)
            if (widget.showFullRow)
              Expanded(
                flex: 1,
                child: Text(
                  '$itemsCount',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                ),
              ),

            // Total
            Expanded(
              flex: 2,
              child: Text(
                '${total.toStringAsFixed(3)} ر.ع',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF22C55E),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),

            // Status
            Expanded(flex: 2, child: _buildStatusBadge(status)),

            // Payment (only on full row)
            if (widget.showFullRow)
              Expanded(flex: 2, child: _buildPaymentBadge(paid)),

            // Time (only on full row)
            if (widget.showFullRow)
              Expanded(
                flex: 1,
                child: Text(
                  createdAt != null 
                      ? '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}'
                      : '-',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                ),
              ),

            // Actions
            Expanded(
              flex: 2,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ActionButton(
                      icon: Icons.visibility_outlined,
                      color: const Color(0xFF6366F1),
                      onTap: widget.onView,
                      tooltip: 'عرض',
                    ),
                    if (!isDeleted) ...[
                      _ActionButton(
                        icon: Icons.edit_outlined,
                        color: const Color(0xFFF59E0B),
                        onTap: widget.onStatusChange,
                        tooltip: 'تحديث',
                      ),
                      if (!paid)
                        _ActionButton(
                          icon: Icons.payments_outlined,
                          color: const Color(0xFF22C55E),
                          onTap: widget.onPayment,
                          tooltip: 'دفع',
                        ),
                      _ActionButton(
                        icon: Icons.delete_outline,
                        color: const Color(0xFFDC2626),
                        onTap: widget.onDelete,
                      tooltip: 'حذف',
                    ),
                  ],
                ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderTypeBadge(String type) {
    final config = {
      'table': (Icons.table_restaurant, const Color(0xFF6366F1)),
      'room': (Icons.meeting_room, const Color(0xFF8B5CF6)),
    };
    final data = config[type] ?? (Icons.shopping_bag, const Color(0xFF22C55E));

    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(data.$1, size: 14, color: data.$2),
    );
  }

  Widget _buildStatusBadge(String status) {
    final config = {
      'pending': ('قيد الانتظار', const Color(0xFFF59E0B)),
      'preparing': ('قيد التحضير', const Color(0xFF3B82F6)),
      'ready': ('جاهز', const Color(0xFF22C55E)),
      'completed': ('مكتمل', const Color(0xFF64748B)),
      'cancelled': ('ملغي', const Color(0xFFDC2626)),
    };
    final data = config[status] ?? ('غير معروف', const Color(0xFF64748B));

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        data.$1,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: data.$2,
        ),
      ),
    );
  }

  Widget _buildPaymentBadge(bool paid) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: paid ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            paid ? Icons.check_circle : Icons.cancel,
            size: 12,
            color: paid ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
          ),
          const SizedBox(width: 4),
          Text(
            paid ? 'مدفوع' : 'غير مدفوع',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: paid ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
            ),
          ),
        ],
      ),
    );
  }
}

// ==================== Action Button ====================
class _ActionButton extends StatefulWidget {

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.onTap,
    required this.tooltip,
  });
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final String tooltip;

  @override
  State<_ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<_ActionButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Tooltip(
          message: widget.tooltip,
          child: GestureDetector(
            onTap: widget.onTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _isHovered ? widget.color.withOpacity(0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(widget.icon, size: 16, color: widget.color),
            ),
          ),
        ),
      ),
    );
  }
}

// ==================== Status Option ====================
class _StatusOption extends StatelessWidget {

  const _StatusOption({
    required this.value,
    required this.label,
    required this.color,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });
  final String value;
  final String label;
  final Color color;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: isSelected ? color.withOpacity(0.1) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected ? color : const Color(0xFFE2E8F0),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(icon, size: 20, color: color),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected ? color : const Color(0xFF64748B),
                  ),
                ),
                const Spacer(),
                if (isSelected)
                  Icon(Icons.check_circle, size: 20, color: color),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ==================== Payment Method Card ====================
class _PaymentMethodCard extends StatelessWidget {

  const _PaymentMethodCard({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSelected ? const Color(0xFF22C55E).withOpacity(0.1) : const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF22C55E) : const Color(0xFFE2E8F0),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 32,
                color: isSelected ? const Color(0xFF22C55E) : const Color(0xFF64748B),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? const Color(0xFF22C55E) : const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ==================== Order Details Dialog ====================
class _OrderDetailsDialog extends StatelessWidget {

  const _OrderDetailsDialog({required this.order});
  final Map<String, dynamic> order;

  @override
  Widget build(BuildContext context) {
    final orderId = order['id']?.toString() ?? '';
    final orderNumber = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
    final orderType = order['orderType']?.toString() ?? 'table';
    final tableNumber = order['tableNumber']?.toString();
    final roomNumber = order['roomNumber']?.toString();
    final items = order['items'] as List? ?? [];
    final subtotal = (order['subtotal'] ?? order['total'] ?? 0).toDouble();
    final total = (order['total'] ?? 0).toDouble();
    final status = order['status']?.toString() ?? 'pending';
    final paid = order['paid'] == true;
    final createdAt = DateTime.tryParse(order['createdAt']?.toString() ?? '');
    final isDeleted = order['isDeleted'] == true;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          width: 500,
          constraints: const BoxConstraints(maxHeight: 600),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDeleted ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: isDeleted ? const Color(0xFFFEE2E2) : const Color(0xFF6366F1).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isDeleted ? Icons.delete : Icons.receipt_long,
                        color: isDeleted ? const Color(0xFFDC2626) : const Color(0xFF6366F1),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'طلب #$orderNumber',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isDeleted ? const Color(0xFFDC2626) : const Color(0xFF0F172A),
                            ),
                          ),
                          if (createdAt != null)
                            Text(
                              '${createdAt.day}/${createdAt.month}/${createdAt.year} - ${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}',
                              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),

              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Info Cards
                      Row(
                        children: [
                          Expanded(
                            child: _InfoCard(
                              icon: orderType == 'room' ? Icons.meeting_room : Icons.table_restaurant,
                              label: orderType == 'room' ? 'الغرفة' : 'الطاولة',
                              value: tableNumber ?? roomNumber ?? '-',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _InfoCard(
                              icon: Icons.receipt,
                              label: 'الحالة',
                              value: _getStatusLabel(status),
                              valueColor: _getStatusColor(status),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _InfoCard(
                              icon: Icons.payments,
                              label: 'الدفع',
                              value: paid ? 'مدفوع' : 'غير مدفوع',
                              valueColor: paid ? const Color(0xFF22C55E) : const Color(0xFFDC2626),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Items
                      const Text(
                        'المنتجات',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...items.map((item) => _buildItemRow(item)),

                      const SizedBox(height: 20),
                      const Divider(),
                      const SizedBox(height: 12),

                      // Totals
                      _buildTotalRow('المجموع الفرعي', subtotal),
                      const SizedBox(height: 8),
                      _buildTotalRow('الإجمالي', total, isTotal: true),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemRow(dynamic item) {
    if (item is! Map) return const SizedBox.shrink();
    
    final name = item['productName']?.toString() ?? item['name']?.toString() ?? '';
    final quantity = item['quantity'] ?? 1;
    final price = (item['unitPrice'] ?? item['price'] ?? 0).toDouble();
    final total = (item['totalPrice'] ?? (price * quantity)).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text('☕', style: TextStyle(fontSize: 16)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
          Text(
            '$quantity × ${price.toStringAsFixed(3)}',
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(width: 16),
          Text(
            '${total.toStringAsFixed(3)} ر.ع',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: const Color(0xFF64748B),
          ),
        ),
        Text(
          '${amount.toStringAsFixed(3)} ر.ع',
          style: TextStyle(
            fontSize: isTotal ? 20 : 14,
            fontWeight: FontWeight.bold,
            color: isTotal ? const Color(0xFF22C55E) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'preparing': return 'قيد التحضير';
      case 'ready': return 'جاهز';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return const Color(0xFFF59E0B);
      case 'preparing': return const Color(0xFF3B82F6);
      case 'ready': return const Color(0xFF22C55E);
      case 'completed': return const Color(0xFF64748B);
      case 'cancelled': return const Color(0xFFDC2626);
      default: return const Color(0xFF64748B);
    }
  }
}

// ==================== Info Card ====================
class _InfoCard extends StatelessWidget {

  const _InfoCard({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF64748B)),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: valueColor ?? const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
