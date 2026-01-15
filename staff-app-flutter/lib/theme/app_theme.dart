import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const Color primaryColor = Color(0xFF6366F1);
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color secondaryColor = Color(0xFF8B5CF6);
  static const Color accentColor = Color(0xFFF59E0B);
  static const Color successColor = Color(0xFF16A34A);
  static const Color errorColor = Color(0xFFDC2626);
  static const Color warningColor = Color(0xFFF59E0B);
  
  // Light Theme Colors
  static const Color lightBackground = Color(0xFFF1F5F9);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightText = Color(0xFF0F172A);
  static const Color lightTextSecondary = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFE2E8F0);
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkText = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: lightBackground,
      fontFamily: 'IBMPlexSansArabic',
      
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: lightSurface,
        background: lightBackground,
        error: errorColor,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: lightText,
        onBackground: lightText,
        onError: Colors.white,
      ),
      
      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: lightSurface,
        foregroundColor: lightText,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
      ),
      
      // Card
      cardTheme: CardTheme(
        color: lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: lightBorder),
        ),
      ),
      
      // Input
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightBackground,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: errorColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: lightTextSecondary),
      ),
      
      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          side: const BorderSide(color: primaryColor),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      
      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
      
      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: lightBackground,
        selectedColor: primaryColor.withOpacity(0.1),
        labelStyle: const TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 14,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      
      // Divider
      dividerTheme: const DividerThemeData(
        color: lightBorder,
        thickness: 1,
        space: 1,
      ),
      
      // Text Theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: lightText,
        ),
        displayMedium: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: lightText,
        ),
        displaySmall: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
        headlineSmall: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
        titleLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
        titleMedium: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: lightText,
        ),
        bodyLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: lightText,
        ),
        bodyMedium: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: lightText,
        ),
        bodySmall: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: lightTextSecondary,
        ),
        labelLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: lightText,
        ),
      ),
    );
  }

  // Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: darkBackground,
      fontFamily: 'IBMPlexSansArabic',
      
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: darkSurface,
        background: darkBackground,
        error: errorColor,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: darkText,
        onBackground: darkText,
        onError: Colors.white,
      ),
      
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: darkText,
        elevation: 0,
        centerTitle: true,
      ),
      
      cardTheme: CardTheme(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: darkBorder),
        ),
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: darkTextSecondary),
      ),
      
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: darkText,
        ),
        bodyLarge: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: darkText,
        ),
        bodySmall: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: darkTextSecondary,
        ),
      ),
    );
  }
}

