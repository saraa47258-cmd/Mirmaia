import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/staff_menu_screen.dart';
import 'screens/cashier_screen.dart';
import 'screens/tables_screen.dart';
import 'screens/room_orders_screen.dart';

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
    // Protected routes
    final protectedRoutes = {
      '/staff-menu': 'staffMenu',
      '/cashier': 'cashier',
      '/tables': 'tables',
      '/room-orders': 'roomOrders',
    };

    // Check permission for protected routes
    if (protectedRoutes.containsKey(settings.name)) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final permission = protectedRoutes[settings.name]!;
      
      if (!authProvider.hasPermission(permission)) {
        return MaterialPageRoute(
          builder: (_) => const _AccessDeniedScreen(),
        );
      }
    }

    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/staff-menu':
        return MaterialPageRoute(builder: (_) => const StaffMenuScreen());
      case '/cashier':
        return MaterialPageRoute(builder: (_) => const CashierScreen());
      case '/tables':
        return MaterialPageRoute(builder: (_) => const TablesScreen());
      case '/room-orders':
        return MaterialPageRoute(builder: (_) => const RoomOrdersScreen());
      default:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
  }
}

class _AccessDeniedScreen extends StatelessWidget {
  const _AccessDeniedScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.block,
              size: 80,
              color: Colors.red.shade400,
            ),
            const SizedBox(height: 24),
            Text(
              'غير مصرح بالوصول',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'ليس لديك صلاحية للوصول لهذه الصفحة',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
              icon: const Icon(Icons.home),
              label: const Text('العودة للرئيسية'),
            ),
          ],
        ),
      ),
    );
  }
}

