import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';

class ShamCoffeeApp extends StatelessWidget {
  const ShamCoffeeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'قهوة الشام - الموظفين',
      debugShowCheckedModeBanner: false,
      
      // RTL & Arabic Support
      locale: const Locale('ar', 'SA'),
      supportedLocales: const [
        Locale('ar', 'SA'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      
      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      
      // Routes
      initialRoute: '/',
      onGenerateRoute: (settings) {
        return _generateRoute(settings, context);
      },
    );
  }

  Route<dynamic>? _generateRoute(RouteSettings settings, BuildContext context) {
    // Protected routes - require authentication
    final protectedRoutes = {
      '/home',
      '/dashboard',
      '/main',
    };

    // Check authentication for protected routes
    if (protectedRoutes.contains(settings.name)) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      // If not initialized yet, show splash
      if (!authProvider.isInitialized) {
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      }
      
      // If not authenticated, redirect to login
      if (!authProvider.isAuthenticated) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          Navigator.of(context).pushReplacementNamed('/login');
        });
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      }
      
      // Verify user is still active
      if (authProvider.user != null && !authProvider.user!.isActive) {
        WidgetsBinding.instance.addPostFrameCallback((_) async {
          await authProvider.logout();
          Navigator.of(context).pushReplacementNamed('/login');
        });
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      }
    }

    // Public routes
    if (settings.name == '/login') {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      // If already authenticated, redirect to main
      if (authProvider.isAuthenticated) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          Navigator.of(context).pushReplacementNamed('/main');
        });
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      }
    }

    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/home':
      case '/dashboard':
      case '/main':
        // Main layout with persistent sidebar
        final args = settings.arguments as Map<String, dynamic>?;
        final initialPage = args?['page'] as String? ?? 'dashboard';
        return MaterialPageRoute(
          builder: (_) => MainLayout(initialPage: initialPage),
        );
      default:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
  }
}
