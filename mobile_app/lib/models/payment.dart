import 'package:cloud_firestore/cloud_firestore.dart';

class Payment {
  final String? id;
  final DateTime date;
  final double amount;
  final double principal;
  final double interest;
  final double fees;
  final DateTime? createdAt;

  // Fields for schedule calculation
  double? remainingBalance;

  Payment({
    this.id,
    required this.date,
    required this.amount,
    required this.principal,
    required this.interest,
    required this.fees,
    this.createdAt,
    this.remainingBalance,
  });

  factory Payment.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;

    // Handle potential string values from legacy or web app data
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      if (val is String) return double.tryParse(val) ?? 0.0;
      return 0.0;
    }

    return Payment(
      id: doc.id,
      date: data['date'] != null
          ? (data['date'] is Timestamp ? (data['date'] as Timestamp).toDate() : DateTime.tryParse(data['date'].toString()) ?? DateTime.now())
          : DateTime.now(),
      amount: parseDouble(data['amount']),
      principal: parseDouble(data['principal']),
      interest: parseDouble(data['interest']),
      fees: parseDouble(data['fees']),
      createdAt: data['createdAt'] != null ? (data['createdAt'] as Timestamp).toDate() : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'date': date.toIso8601String().split('T')[0], // YYYY-MM-DD
      'amount': amount,
      'principal': principal,
      'interest': interest,
      'fees': fees,
      'createdAt': createdAt ?? FieldValue.serverTimestamp(),
    };
  }

  Payment copyWith({
    String? id,
    DateTime? date,
    double? amount,
    double? principal,
    double? interest,
    double? fees,
    DateTime? createdAt,
    double? remainingBalance,
  }) {
    return Payment(
      id: id ?? this.id,
      date: date ?? this.date,
      amount: amount ?? this.amount,
      principal: principal ?? this.principal,
      interest: interest ?? this.interest,
      fees: fees ?? this.fees,
      createdAt: createdAt ?? this.createdAt,
      remainingBalance: remainingBalance ?? this.remainingBalance,
    );
  }
}
