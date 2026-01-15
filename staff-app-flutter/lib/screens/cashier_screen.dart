import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CashierScreen extends StatelessWidget {
  const CashierScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightBackground,
      appBar: AppBar(
        title: const Text('الكاشير'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.successColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.point_of_sale,
                size: 50,
                color: AppTheme.successColor,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'الكاشير',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppTheme.lightText,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'سيتم تفعيل هذه الصفحة قريباً',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

