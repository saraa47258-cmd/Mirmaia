import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mirmaia Worker Web',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          primary: const Color(0xFF6366F1),
        ),
        useMaterial3: true,
      ),
      home: const WorkerWebViewApp(),
    );
  }
}

class WorkerWebViewApp extends StatefulWidget {
  const WorkerWebViewApp({super.key});

  @override
  State<WorkerWebViewApp> createState() => _WorkerWebViewAppState();
}

class _WorkerWebViewAppState extends State<WorkerWebViewApp> {
  int _selectedIndex = 0;
  late final List<WebViewController> _controllers;
  late final List<String> _urls;
  final List<bool> _isLoading = List.generate(5, (_) => true);

  // Base URL - يمكن تغييره حسب بيئة التطوير/الإنتاج
  static const String baseUrl = 'http://localhost:3000';
  // للإنتاج: 'https://your-domain.com'
  // للجوال: 'http://192.168.1.100:3000' (استبدل بـ IP جهازك)

  @override
  void initState() {
    super.initState();

    // URLs للصفحات المختلفة
    _urls = [
      '$baseUrl/worker', // الرئيسية
      '$baseUrl/worker/menu', // المنيو
      '$baseUrl/worker/orders', // الطلبات
      '$baseUrl/worker/cashier', // الكاشير
      '$baseUrl/worker/tables', // الطاولات
    ];

    // إنشاء WebView controllers لكل صفحة
    _controllers = _urls.asMap().entries.map((entry) {
      final index = entry.key;
      final url = entry.value;
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onProgress: (int progress) {
              // يمكن إضافة progress indicator هنا
            },
            onPageStarted: (String url) {
              if (mounted) {
                setState(() {
                  _isLoading[index] = true;
                });
              }
            },
            onPageFinished: (String url) {
              if (mounted) {
                setState(() {
                  _isLoading[index] = false;
                });
              }
            },
            onWebResourceError: (WebResourceError error) {
              // معالجة الأخطاء
              print('WebView error: ${error.description}');
              if (mounted) {
                setState(() {
                  _isLoading[index] = false;
                });
              }
            },
          ),
        )
        ..loadRequest(Uri.parse(url));

      return controller;
    }).toList();
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _reloadCurrentPage() {
    _controllers[_selectedIndex].reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Mirmaia Worker',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _reloadCurrentPage,
            tooltip: 'إعادة تحميل',
          ),
        ],
      ),
      body: Stack(
        children: [
          IndexedStack(
            index: _selectedIndex,
            children: _controllers.map((controller) {
              return WebViewWidget(controller: controller);
            }).toList(),
          ),
          if (_isLoading[_selectedIndex])
            Container(
              color: Colors.white,
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFF6366F1),
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      'جاري التحميل...',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            height: 72,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, '🏠', 'الرئيسية'),
                _buildNavItem(1, '🍽️', 'المنيو'),
                _buildNavItem(2, '📋', 'الطلبات'),
                _buildNavItem(3, '💰', 'الكاشير'),
                _buildNavItem(4, '🪑', 'الطاولات'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, String icon, String label) {
    final isSelected = _selectedIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Container(
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF6366F1).withOpacity(0.08)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                icon,
                style: TextStyle(
                  fontSize: 22,
                  color: isSelected
                      ? const Color(0xFF6366F1)
                      : const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? const Color(0xFF6366F1)
                      : const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
