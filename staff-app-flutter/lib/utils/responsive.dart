import 'package:flutter/material.dart';

/// Responsive breakpoints for the app
class Breakpoints {
  static const double mobile = 480;
  static const double tablet = 768;
  static const double desktop = 1024;
  static const double largeDesktop = 1280;
  static const double extraLarge = 1536;
}

/// Screen size categories
enum ScreenSize {
  mobile,
  tablet,
  desktop,
  largeDesktop,
}

/// Responsive utility class
class Responsive {

  Responsive(this.context) {
    final size = MediaQuery.of(context).size;
    screenWidth = size.width;
    screenHeight = size.height;
    screenSize = _getScreenSize();
  }
  final BuildContext context;
  late final double screenWidth;
  late final double screenHeight;
  late final ScreenSize screenSize;

  ScreenSize _getScreenSize() {
    if (screenWidth < Breakpoints.tablet) {
      return ScreenSize.mobile;
    } else if (screenWidth < Breakpoints.desktop) {
      return ScreenSize.tablet;
    } else if (screenWidth < Breakpoints.largeDesktop) {
      return ScreenSize.desktop;
    } else {
      return ScreenSize.largeDesktop;
    }
  }

  /// Check screen size
  bool get isMobile => screenSize == ScreenSize.mobile;
  bool get isTablet => screenSize == ScreenSize.tablet;
  bool get isDesktop => screenSize == ScreenSize.desktop;
  bool get isLargeDesktop => screenSize == ScreenSize.largeDesktop;

  /// Combined checks
  bool get isMobileOrTablet => isMobile || isTablet;
  bool get isDesktopOrLarger => isDesktop || isLargeDesktop;
  bool get isTabletOrDesktop => isTablet || isDesktop || isLargeDesktop;

  /// Get value based on screen size
  T value<T>({
    required T mobile,
    T? tablet,
    T? desktop,
    T? largeDesktop,
  }) {
    switch (screenSize) {
      case ScreenSize.mobile:
        return mobile;
      case ScreenSize.tablet:
        return tablet ?? mobile;
      case ScreenSize.desktop:
        return desktop ?? tablet ?? mobile;
      case ScreenSize.largeDesktop:
        return largeDesktop ?? desktop ?? tablet ?? mobile;
    }
  }

  /// Get grid columns based on screen size
  int get gridColumns {
    return value(mobile: 2, tablet: 3, desktop: 4, largeDesktop: 5);
  }

  /// Get sidebar width
  double get sidebarWidth {
    if (isMobile) return 0;
    if (isTablet) return 72;
    return 260;
  }

  /// Should show sidebar
  bool get shouldShowSidebar => !isMobile;

  /// Should collapse sidebar
  bool get shouldCollapseSidebar => isTablet;

  /// POS layout columns
  int get posColumns {
    return value(mobile: 1, tablet: 2, desktop: 3, largeDesktop: 3);
  }

  /// Product grid columns
  int get productGridColumns {
    return value(mobile: 2, tablet: 2, desktop: 3, largeDesktop: 4);
  }

  /// Padding values
  double get pagePadding {
    return value(mobile: 12.0, tablet: 16.0, desktop: 20.0, largeDesktop: 24.0);
  }

  double get cardPadding {
    return value(mobile: 12.0, tablet: 14.0, desktop: 16.0, largeDesktop: 20.0);
  }

  /// Font sizes
  double get titleSize {
    return value(mobile: 18.0, tablet: 20.0, desktop: 22.0, largeDesktop: 24.0);
  }

  double get subtitleSize {
    return value(mobile: 14.0, tablet: 15.0, desktop: 16.0, largeDesktop: 16.0);
  }

  double get bodySize {
    return value(mobile: 12.0, tablet: 13.0, desktop: 14.0, largeDesktop: 14.0);
  }

  /// Get orders table flex values
  List<int> get ordersTableFlex {
    if (isMobile) {
      return [2, 1, 1, 1]; // Compact layout
    } else if (isTablet) {
      return [2, 2, 1, 2, 2, 1]; // Medium layout
    } else {
      return [2, 2, 1, 2, 2, 2, 1, 2]; // Full layout
    }
  }
}

/// Responsive widget that rebuilds based on screen size
class ResponsiveBuilder extends StatelessWidget {

  const ResponsiveBuilder({
    super.key,
    required this.builder,
  });
  final Widget Function(BuildContext context, Responsive responsive) builder;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return builder(context, Responsive(context));
      },
    );
  }
}

/// Responsive wrapper for conditional rendering
class ResponsiveVisibility extends StatelessWidget {

  const ResponsiveVisibility({
    super.key,
    required this.child,
    this.visibleOnMobile = true,
    this.visibleOnTablet = true,
    this.visibleOnDesktop = true,
    this.visibleOnLargeDesktop = true,
    this.replacement,
  });
  final Widget child;
  final bool visibleOnMobile;
  final bool visibleOnTablet;
  final bool visibleOnDesktop;
  final bool visibleOnLargeDesktop;
  final Widget? replacement;

  @override
  Widget build(BuildContext context) {
    final responsive = Responsive(context);
    bool isVisible = false;

    switch (responsive.screenSize) {
      case ScreenSize.mobile:
        isVisible = visibleOnMobile;
        break;
      case ScreenSize.tablet:
        isVisible = visibleOnTablet;
        break;
      case ScreenSize.desktop:
        isVisible = visibleOnDesktop;
        break;
      case ScreenSize.largeDesktop:
        isVisible = visibleOnLargeDesktop;
        break;
    }

    return isVisible ? child : (replacement ?? const SizedBox.shrink());
  }
}

/// Responsive row/column that switches based on screen size
class ResponsiveRowColumn extends StatelessWidget {

  const ResponsiveRowColumn({
    super.key,
    required this.children,
    this.rowOnDesktop = true,
    this.rowMainAxisAlignment = MainAxisAlignment.start,
    this.rowCrossAxisAlignment = CrossAxisAlignment.center,
    this.columnMainAxisAlignment = MainAxisAlignment.start,
    this.columnCrossAxisAlignment = CrossAxisAlignment.stretch,
    this.spacing = 16,
  });
  final List<Widget> children;
  final bool rowOnDesktop;
  final MainAxisAlignment rowMainAxisAlignment;
  final CrossAxisAlignment rowCrossAxisAlignment;
  final MainAxisAlignment columnMainAxisAlignment;
  final CrossAxisAlignment columnCrossAxisAlignment;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    final responsive = Responsive(context);
    final useRow = rowOnDesktop && responsive.isDesktopOrLarger;

    if (useRow) {
      return Row(
        mainAxisAlignment: rowMainAxisAlignment,
        crossAxisAlignment: rowCrossAxisAlignment,
        children: _addSpacing(children, isRow: true),
      );
    } else {
      return Column(
        mainAxisAlignment: columnMainAxisAlignment,
        crossAxisAlignment: columnCrossAxisAlignment,
        children: _addSpacing(children, isRow: false),
      );
    }
  }

  List<Widget> _addSpacing(List<Widget> widgets, {required bool isRow}) {
    final result = <Widget>[];
    for (var i = 0; i < widgets.length; i++) {
      result.add(widgets[i]);
      if (i < widgets.length - 1) {
        result.add(SizedBox(
          width: isRow ? spacing : 0,
          height: isRow ? 0 : spacing,
        ));
      }
    }
    return result;
  }
}

/// Responsive grid that adapts columns
class ResponsiveGrid extends StatelessWidget {

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.mobileColumns,
    this.tabletColumns,
    this.desktopColumns,
    this.largeDesktopColumns,
    this.spacing = 16,
    this.runSpacing = 16,
    this.childAspectRatio = 1.0,
  });
  final List<Widget> children;
  final int? mobileColumns;
  final int? tabletColumns;
  final int? desktopColumns;
  final int? largeDesktopColumns;
  final double spacing;
  final double runSpacing;
  final double childAspectRatio;

  @override
  Widget build(BuildContext context) {
    final responsive = Responsive(context);
    final columns = responsive.value(
      mobile: mobileColumns ?? 1,
      tablet: tabletColumns ?? mobileColumns ?? 2,
      desktop: desktopColumns ?? tabletColumns ?? mobileColumns ?? 3,
      largeDesktop: largeDesktopColumns ?? desktopColumns ?? tabletColumns ?? mobileColumns ?? 4,
    );

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        crossAxisSpacing: spacing,
        mainAxisSpacing: runSpacing,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
    );
  }
}



