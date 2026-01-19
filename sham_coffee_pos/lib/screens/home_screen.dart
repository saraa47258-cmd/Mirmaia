import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _webviewController = WebviewController();
  bool _isLoading = true;
  bool _webviewReady = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    try {
      await _webviewController.initialize();
      
      // الاستماع للتحميل
      _webviewController.loadingState.listen((state) async {
        if (mounted) {
          setState(() {
            _isLoading = state == LoadingState.loading;
          });
        }
      });

      // تحميل صفحة تسجيل الدخول مباشرة
      await _webviewController.loadUrl('${AuthService.baseUrl}/login');

      setState(() {
        _webviewReady = true;
      });
    } catch (e) {
      setState(() {
        _error = 'خطأ في تهيئة WebView: $e';
        _isLoading = false;
      });
    }
  }

  void _reload() async {
    if (!_webviewReady) return;
    setState(() => _isLoading = true);
    await _webviewController.reload();
  }

  @override
  void dispose() {
    _webviewController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(fontSize: 16)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _error = null;
                    _isLoading = true;
                  });
                  _initWebView();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          // WebView يأخذ كامل الشاشة
          _webviewReady
              ? Webview(_webviewController)
              : const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('جاري تحميل التطبيق...'),
                    ],
                  ),
                ),
          
          // شريط التحميل العلوي
          if (_isLoading)
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: LinearProgressIndicator(),
            ),
          
          // زر التحديث
          Positioned(
            top: 8,
            left: 8,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: IconButton(
                onPressed: _reload,
                icon: const Icon(Icons.refresh, size: 20),
                tooltip: 'تحديث',
                padding: const EdgeInsets.all(8),
                constraints: const BoxConstraints(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
