import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class WebViewScreen extends StatefulWidget {
  final String url;
  final String title;
  final String? workerId;
  final String? workerName;
  final String? workerUsername;

  const WebViewScreen({
    super.key,
    required this.url,
    this.title = 'موقع قهوة الشام',
    this.workerId,
    this.workerName,
    this.workerUsername,
  });

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    
    // بناء URL مع معلومات العامل
    String finalUrl = widget.url;
    if (widget.workerId != null || widget.workerUsername != null) {
      final uri = Uri.parse(widget.url);
      final queryParams = Map<String, String>.from(uri.queryParameters);
      
      if (widget.workerId != null) {
        queryParams['workerId'] = widget.workerId!;
      }
      if (widget.workerUsername != null) {
        queryParams['workerUsername'] = widget.workerUsername!;
      }
      if (widget.workerName != null) {
        queryParams['workerName'] = widget.workerName!;
      }
      queryParams['autoLogin'] = 'true';
      queryParams['source'] = 'worker-app';
      
      finalUrl = uri.replace(queryParameters: queryParams).toString();
    }
    
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _errorMessage = null;
            });
          },
          onPageFinished: (String url) async {
            // حقن JavaScript لتسجيل الدخول التلقائي
            if (widget.workerId != null || widget.workerUsername != null) {
              await _injectAutoLogin();
            }
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _isLoading = false;
              _errorMessage = 'خطأ في تحميل الصفحة: ${error.description}';
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(finalUrl));
  }
  
  // حقن JavaScript لتسجيل الدخول التلقائي
  Future<void> _injectAutoLogin() async {
    if (widget.workerId == null && widget.workerUsername == null) return;
    
    final jsCode = '''
      (function() {
        try {
          // محاولة تسجيل الدخول التلقائي
          const workerId = '${widget.workerId ?? ''}';
          const workerUsername = '${widget.workerUsername ?? ''}';
          const workerName = '${widget.workerName ?? ''}';
          
          // حفظ معلومات العامل في localStorage
          if (workerId) {
            localStorage.setItem('worker_id', workerId);
          }
          if (workerUsername) {
            localStorage.setItem('worker_username', workerUsername);
          }
          if (workerName) {
            localStorage.setItem('worker_name', workerName);
          }
          localStorage.setItem('worker_logged_in', 'true');
          localStorage.setItem('login_source', 'worker-app');
          
          // إرسال حدث مخصص للموقع
          window.dispatchEvent(new CustomEvent('workerAutoLogin', {
            detail: {
              workerId: workerId,
              workerUsername: workerUsername,
              workerName: workerName
            }
          }));
          
          // محاولة العثور على نموذج تسجيل الدخول وملؤه تلقائياً
          const usernameInput = document.querySelector('input[name="username"], input[type="text"][placeholder*="اسم"], input[type="text"][placeholder*="username"], #username, .username-input');
          const passwordInput = document.querySelector('input[name="password"], input[type="password"], #password, .password-input');
          const loginButton = document.querySelector('button[type="submit"], button:contains("تسجيل"), .login-button, #login-btn');
          
          if (usernameInput && workerUsername) {
            usernameInput.value = workerUsername;
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          // إذا كان هناك زر تسجيل دخول، اضغط عليه بعد 500ms
          if (loginButton && usernameInput && passwordInput) {
            setTimeout(() => {
              loginButton.click();
            }, 500);
          }
          
          console.log('Worker auto-login attempted:', { workerId, workerUsername, workerName });
        } catch (e) {
          console.error('Auto-login error:', e);
        }
      })();
    ''';
    
    await _controller.runJavaScript(jsCode);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161f),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              _controller.reload();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Container(
              color: const Color(0xFF0a0a0f),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      color: Color(0xFF8B5CF6),
                    ),
                    SizedBox(height: 16),
                    Text(
                      'جاري التحميل...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (_errorMessage != null && !_isLoading)
            Container(
              color: const Color(0xFF0a0a0f),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        _controller.reload();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 12,
                        ),
                      ),
                      child: const Text(
                        'إعادة المحاولة',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
