import 'package:flutter/material.dart';
import '../screens/splash_screen.dart';

class ShamCoffeePOS extends StatelessWidget {
  const ShamCoffeePOS({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'قهوة الشام',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366f1),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Segoe UI',
      ),
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
      home: const SplashScreen(),
    );
  }
}
