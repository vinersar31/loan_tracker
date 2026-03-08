import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/models/payment.dart';

void main() {
  group('Payment Model', () {
    test('should create a Payment instance', () {
      final date = DateTime(2023, 10, 1);
      final payment = Payment(
        id: '1',
        date: date,
        amount: 1000.0,
        principal: 800.0,
        interest: 150.0,
        fees: 50.0,
      );

      expect(payment.id, '1');
      expect(payment.date, date);
      expect(payment.amount, 1000.0);
      expect(payment.principal, 800.0);
      expect(payment.interest, 150.0);
      expect(payment.fees, 50.0);
    });

    test('copyWith should update fields correctly', () {
      final date = DateTime(2023, 10, 1);
      final payment = Payment(
        id: '1',
        date: date,
        amount: 1000.0,
        principal: 800.0,
        interest: 150.0,
        fees: 50.0,
      );

      final newDate = DateTime(2023, 11, 1);
      final updatedPayment = payment.copyWith(
        amount: 1200.0,
        date: newDate,
        remainingBalance: 50000.0,
      );

      expect(updatedPayment.id, '1');
      expect(updatedPayment.date, newDate);
      expect(updatedPayment.amount, 1200.0);
      expect(updatedPayment.principal, 800.0);
      expect(updatedPayment.interest, 150.0);
      expect(updatedPayment.fees, 50.0);
      expect(updatedPayment.remainingBalance, 50000.0);
    });

    test('toFirestore should convert to map correctly', () {
      final date = DateTime(2023, 10, 1);
      final payment = Payment(
        id: '1',
        date: date,
        amount: 1000.0,
        principal: 800.0,
        interest: 150.0,
        fees: 50.0,
      );

      final map = payment.toFirestore();

      expect(map['date'], '2023-10-01');
      expect(map['amount'], 1000.0);
      expect(map['principal'], 800.0);
      expect(map['interest'], 150.0);
      expect(map['fees'], 50.0);
    });
  });
}
