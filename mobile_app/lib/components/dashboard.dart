import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/loan_provider.dart';
import '../providers/preferences_provider.dart';

class Dashboard extends StatefulWidget {
  @override
  _DashboardState createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  bool _collapsed = false;
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_US', symbol: '\$'); // Using generic formatting

  String _formatCurrency(double amount) {
    return _currencyFormat.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final loanProvider = Provider.of<LoanProvider>(context);
    final prefsProvider = Provider.of<PreferencesProvider>(context);

    if (loanProvider.isLoading || !prefsProvider.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }

    final stats = loanProvider.stats;
    final cardOrder = prefsProvider.statCardOrder;
    final hiddenStats = prefsProvider.hiddenStats;

    List<String> visibleCards = cardOrder.where((id) => !hiddenStats.contains(id)).toList();

    Map<String, Map<String, dynamic>> statCardData = {
      'remaining': {'label': 'Remaining', 'value': stats['remaining'], 'color': Colors.blue},
      'totalPrincipal': {'label': 'Total Principal', 'value': stats['totalPrincipal'], 'color': Colors.green},
      'totalInterest': {'label': 'Total Interest', 'value': stats['totalInterest'], 'color': Colors.red},
      'totalFees': {'label': 'Fees', 'value': stats['totalFees'], 'color': Colors.orange},
      'totalPaid': {'label': 'Total Paid', 'value': stats['totalPaid'], 'color': Theme.of(context).textTheme.bodyLarge?.color},
    };

    return Card(
      margin: const EdgeInsets.all(16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () => setState(() => _collapsed = !_collapsed),
                  child: Text(_collapsed ? 'Expand ▼' : 'Collapse ▲'),
                ),
              ],
            ),
            if (!_collapsed) ...[
              const SizedBox(height: 20),
              _buildProgressCircle(stats['percentage']),
              const SizedBox(height: 20),
              _buildStatCardsList(visibleCards, statCardData, prefsProvider),
              const SizedBox(height: 20),
              _buildPaymentBreakdownChart(stats),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildProgressCircle(double percentage) {
    return Center(
      child: SizedBox(
        height: 150,
        width: 150,
        child: Stack(
          fit: StackFit.expand,
          children: [
            CircularProgressIndicator(
              value: percentage / 100,
              strokeWidth: 15,
              backgroundColor: Colors.grey.shade300,
              color: Colors.blue,
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('${percentage.round()}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const Text('Paid Off', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCardsList(List<String> visibleCards, Map<String, Map<String, dynamic>> data, PreferencesProvider prefs) {
    return ReorderableListView(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      onReorder: (oldIndex, newIndex) {
        if (newIndex > oldIndex) {
          newIndex -= 1;
        }
        final order = List<String>.from(prefs.statCardOrder);
        // Find actual indices in the full order list
        final item = visibleCards[oldIndex];
        order.remove(item);

        // Find insert position
        int insertIndex = 0;
        if (newIndex < visibleCards.length) {
            String targetItem = visibleCards[newIndex];
            insertIndex = order.indexOf(targetItem);
            if (insertIndex == -1) insertIndex = order.length;
        } else {
            insertIndex = order.length;
        }

        order.insert(insertIndex, item);
        prefs.updateStatCardOrder(order);
      },
      children: visibleCards.map((id) {
        final card = data[id]!;
        return Card(
          key: ValueKey(id),
          child: ListTile(
            title: Text(card['label']),
            trailing: Text(
              _formatCurrency(card['value']),
              style: TextStyle(color: card['color'], fontWeight: FontWeight.bold, fontSize: 16),
            ),
            leading: const Icon(Icons.drag_handle),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentBreakdownChart(Map<String, dynamic> stats) {
    final principal = stats['totalPrincipal'] as double;
    final interest = stats['totalInterest'] as double;
    final fees = stats['totalFees'] as double;
    final total = principal + interest + fees;

    if (total == 0) return const SizedBox.shrink();

    return SizedBox(
      height: 200,
      child: PieChart(
        PieChartData(
          sectionsSpace: 0,
          centerSpaceRadius: 40,
          sections: [
            PieChartSectionData(
              color: Colors.green,
              value: principal,
              title: '${((principal / total) * 100).round()}%',
              radius: 50,
              titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            PieChartSectionData(
              color: Colors.red,
              value: interest,
              title: '${((interest / total) * 100).round()}%',
              radius: 50,
              titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            PieChartSectionData(
              color: Colors.orange,
              value: fees,
              title: '${((fees / total) * 100).round()}%',
              radius: 50,
              titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
