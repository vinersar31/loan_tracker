import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/loan_provider.dart';
import 'package:intl/intl.dart';

class HistoryList extends StatelessWidget {
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_US', symbol: '\$');

  @override
  Widget build(BuildContext context) {
    final loanProvider = Provider.of<LoanProvider>(context);
    final schedule = loanProvider.schedule;

    if (loanProvider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (schedule.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('No payments recorded yet.'),
      );
    }

    return Card(
      margin: const EdgeInsets.all(16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Payment History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: schedule.length,
              itemBuilder: (ctx, index) {
                final payment = schedule[index];
                return Dismissible(
                  key: ValueKey(payment.id),
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.delete, color: Colors.white, size: 40),
                  ),
                  direction: DismissDirection.endToStart,
                  confirmDismiss: (direction) {
                    return showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Are you sure?'),
                        content: const Text('Do you want to remove this payment?'),
                        actions: [
                          TextButton(
                            child: const Text('No'),
                            onPressed: () => Navigator.of(ctx).pop(false),
                          ),
                          TextButton(
                            child: const Text('Yes'),
                            onPressed: () => Navigator.of(ctx).pop(true),
                          ),
                        ],
                      ),
                    );
                  },
                  onDismissed: (direction) {
                    loanProvider.deletePayment(payment.id!);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Payment deleted')),
                    );
                  },
                  child: Card(
                    elevation: 2,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: ListTile(
                      title: Text('Date: ${DateFormat.yMd().format(payment.date)}'),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Amount: ${_currencyFormat.format(payment.amount)}'),
                          Text('Principal: ${_currencyFormat.format(payment.principal)} | Interest: ${_currencyFormat.format(payment.interest)} | Fees: ${_currencyFormat.format(payment.fees)}', style: const TextStyle(fontSize: 12)),
                          Text('Remaining: ${_currencyFormat.format(payment.remainingBalance ?? 0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
