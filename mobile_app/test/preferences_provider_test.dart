import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/providers/preferences_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('PreferencesProvider', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('should initialize with default values', () async {
      final provider = PreferencesProvider();

      // Wait for async initialization
      await Future.delayed(Duration.zero);

      expect(provider.themeMode, ThemeMode.system);
      expect(provider.hiddenStats, isEmpty);
      expect(provider.statCardOrder, ['remaining', 'totalPrincipal', 'totalInterest', 'totalFees', 'totalPaid']);
      expect(provider.isInitialized, isTrue);
    });

    test('should load theme from shared preferences', () async {
      SharedPreferences.setMockInitialValues({'theme_preference': 'dark'});
      final provider = PreferencesProvider();

      await Future.delayed(Duration.zero);

      expect(provider.themeMode, ThemeMode.dark);
    });

    test('setThemeMode should update theme and save to preferences', () async {
      final provider = PreferencesProvider();
      await Future.delayed(Duration.zero);

      await provider.setThemeMode(ThemeMode.light);

      expect(provider.themeMode, ThemeMode.light);
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('theme_preference'), 'light');
    });

    test('toggleTheme should switch between dark and light', () async {
      SharedPreferences.setMockInitialValues({'theme_preference': 'light'});
      final provider = PreferencesProvider();
      await Future.delayed(Duration.zero);

      await provider.toggleTheme();
      expect(provider.themeMode, ThemeMode.dark);

      await provider.toggleTheme();
      expect(provider.themeMode, ThemeMode.light);
    });

    test('updateHiddenStats should update and save', () async {
      final provider = PreferencesProvider();
      await Future.delayed(Duration.zero);

      await provider.updateHiddenStats(['totalFees']);

      expect(provider.hiddenStats, ['totalFees']);
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('hidden_stats_preference'), '["totalFees"]');
    });

    test('toggleStatHidden should add or remove stat', () async {
      final provider = PreferencesProvider();
      await Future.delayed(Duration.zero);

      provider.toggleStatHidden('totalFees');
      expect(provider.hiddenStats, ['totalFees']);

      provider.toggleStatHidden('totalFees');
      expect(provider.hiddenStats, isEmpty);
    });

    test('updateStatCardOrder should update and save', () async {
      final provider = PreferencesProvider();
      await Future.delayed(Duration.zero);

      final newOrder = ['totalPaid', 'remaining'];
      await provider.updateStatCardOrder(newOrder);

      expect(provider.statCardOrder, newOrder);
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('stat_card_order_preference'), '["totalPaid","remaining"]');
    });
  });
}
