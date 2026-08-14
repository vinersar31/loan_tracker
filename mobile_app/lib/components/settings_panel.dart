import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/preferences_provider.dart';

class SettingsPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final prefsProvider = Provider.of<PreferencesProvider>(context);

    if (!prefsProvider.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }

    final hiddenStats = prefsProvider.hiddenStats;
    final allStats = [
      {'id': 'remaining', 'label': 'Remaining Balance'},
      {'id': 'totalPrincipal', 'label': 'Total Principal'},
      {'id': 'totalInterest', 'label': 'Total Interest'},
      {'id': 'totalFees', 'label': 'Total Fees'},
      {'id': 'totalPaid', 'label': 'Total Paid'},
    ];

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Settings', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ),
            const Divider(),
            ListTile(
              title: const Text('Theme'),
              trailing: Switch(
                value: prefsProvider.themeMode == ThemeMode.dark,
                onChanged: (value) {
                  prefsProvider.toggleTheme();
                },
              ),
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Visible Stat Cards', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: allStats.length,
                itemBuilder: (ctx, index) {
                  final stat = allStats[index];
                  final isHidden = hiddenStats.contains(stat['id']);
                  return CheckboxListTile(
                    title: Text(stat['label']!),
                    value: !isHidden,
                    onChanged: (value) {
                      prefsProvider.toggleStatHidden(stat['id']!);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
