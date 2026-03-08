import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class PreferencesProvider with ChangeNotifier {
  static const String _themeKey = 'theme_preference';
  static const String _hiddenStatsKey = 'hidden_stats_preference';
  static const String _statCardOrderKey = 'stat_card_order_preference';

  ThemeMode _themeMode = ThemeMode.system;
  List<String> _hiddenStats = [];
  List<String> _statCardOrder = ['remaining', 'totalPrincipal', 'totalInterest', 'totalFees', 'totalPaid'];
  bool _isInitialized = false;

  ThemeMode get themeMode => _themeMode;
  List<String> get hiddenStats => _hiddenStats;
  List<String> get statCardOrder => _statCardOrder;
  bool get isInitialized => _isInitialized;

  PreferencesProvider() {
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();

    // Load theme
    final themeStr = prefs.getString(_themeKey);
    if (themeStr != null) {
      if (themeStr == 'light') _themeMode = ThemeMode.light;
      else if (themeStr == 'dark') _themeMode = ThemeMode.dark;
    }

    // Load hidden stats
    final hiddenStatsJson = prefs.getString(_hiddenStatsKey);
    if (hiddenStatsJson != null) {
      try {
        _hiddenStats = List<String>.from(jsonDecode(hiddenStatsJson));
      } catch (e) {
        print("Error parsing hidden stats: $e");
      }
    }

    // Load stat card order
    final statCardOrderJson = prefs.getString(_statCardOrderKey);
    if (statCardOrderJson != null) {
      try {
        _statCardOrder = List<String>.from(jsonDecode(statCardOrderJson));
      } catch (e) {
        print("Error parsing stat card order: $e");
      }
    }

    _isInitialized = true;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    String themeStr = 'system';
    if (mode == ThemeMode.light) themeStr = 'light';
    else if (mode == ThemeMode.dark) themeStr = 'dark';
    await prefs.setString(_themeKey, themeStr);
  }

  Future<void> toggleTheme() async {
    final currentMode = _themeMode == ThemeMode.system
      ? ThemeMode.light // Default to dark toggle if system, logic can be improved
      : _themeMode;
    await setThemeMode(currentMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light);
  }

  Future<void> updateHiddenStats(List<String> stats) async {
    _hiddenStats = stats;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_hiddenStatsKey, jsonEncode(stats));
  }

  void toggleStatHidden(String id) {
    if (_hiddenStats.contains(id)) {
      _hiddenStats.remove(id);
    } else {
      _hiddenStats.add(id);
    }
    updateHiddenStats(_hiddenStats);
  }

  Future<void> updateStatCardOrder(List<String> order) async {
    _statCardOrder = order;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_statCardOrderKey, jsonEncode(order));
  }
}
