import 'package:flutter/material.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';

class TablesScreen extends StatefulWidget {
  const TablesScreen({super.key});

  @override
  State<TablesScreen> createState() => _TablesScreenState();
}

class _TablesScreenState extends State<TablesScreen> {
  final FirestoreService _firestoreService = FirestoreService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightBackground,
      appBar: AppBar(
        title: const Text('الطاولات'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _firestoreService.tablesStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('خطأ: ${snapshot.error}'),
            );
          }

          final tables = snapshot.data ?? [];

          if (tables.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.table_restaurant, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'لا توجد طاولات',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1,
            ),
            itemCount: tables.length,
            itemBuilder: (context, index) {
              final table = tables[index];
              return _TableCard(table: table);
            },
          );
        },
      ),
    );
  }
}

class _TableCard extends StatelessWidget {
  final Map<String, dynamic> table;

  const _TableCard({required this.table});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'available':
        return AppTheme.successColor;
      case 'occupied':
        return AppTheme.errorColor;
      case 'reserved':
        return AppTheme.warningColor;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'occupied':
        return 'مشغولة';
      case 'reserved':
        return 'محجوزة';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = table['status'] ?? 'available';
    final statusColor = _getStatusColor(status);
    final tableNumber = table['tableNumber'] ?? table['name'] ?? '?';
    final capacity = table['capacity'] ?? 4;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: statusColor.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Table Icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              Icons.table_restaurant,
              size: 28,
              color: statusColor,
            ),
          ),
          const SizedBox(height: 12),
          
          // Table Number
          Text(
            'طاولة $tableNumber',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.lightText,
            ),
          ),
          const SizedBox(height: 4),
          
          // Capacity
          Text(
            '$capacity أشخاص',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          
          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _getStatusLabel(status),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

