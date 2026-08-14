import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/payment.dart';

class LoanProvider with ChangeNotifier {
  static const double _defaultLoanAmount = 412110.84;
  static const String _collectionName = 'payments';

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  StreamSubscription? _subscription;

  List<Payment> _payments = [];
  List<Payment> _schedule = [];

  // Stats
  double _totalLoan = _defaultLoanAmount;
  double _totalPaid = 0.0;
  double _totalPrincipal = 0.0;
  double _totalInterest = 0.0;
  double _totalFees = 0.0;
  double _remaining = _defaultLoanAmount;
  double _percentage = 0.0;
  bool _isLoading = true;
  String? _errorMessage;

  List<Payment> get schedule => _schedule;

  Map<String, dynamic> get stats => {
    'totalLoan': _totalLoan,
    'totalPaid': _totalPaid,
    'totalPrincipal': _totalPrincipal,
    'totalInterest': _totalInterest,
    'totalFees': _totalFees,
    'remaining': _remaining,
    'percentage': _percentage,
  };

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  LoanProvider() {
    _init();
  }

  void _init() {
    _subscription = _firestore
        .collection(_collectionName)
        .orderBy('date', descending: true)
        .snapshots()
        .listen(
      (snapshot) {
        _payments = snapshot.docs.map((doc) => Payment.fromFirestore(doc)).toList();
        _calculateSchedule();
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
      },
      onError: (error) {
        print("Firestore Error: $error");
        _errorMessage = "Database connection failed. Please check your connection.";
        _isLoading = false;
        notifyListeners();
      },
    );
  }

  void _calculateSchedule() {
    // Sort payments by date ASCENDING for calculation
    List<Payment> sortedPayments = List.from(_payments);
    sortedPayments.sort((a, b) => a.date.compareTo(b.date));

    double currentBalance = _defaultLoanAmount;
    double totalPaid = 0;
    double totalPrincipal = 0;
    double totalInterest = 0;
    double totalFees = 0;

    List<Payment> calculatedSchedule = [];

    for (var payment in sortedPayments) {
      currentBalance -= payment.principal;
      if (currentBalance < 0) currentBalance = 0;

      totalPaid += payment.amount;
      totalPrincipal += payment.principal;
      totalInterest += payment.interest;
      totalFees += payment.fees;

      calculatedSchedule.add(payment.copyWith(
        remainingBalance: currentBalance,
      ));
    }

    // Reverse for display (newest first)
    _schedule = calculatedSchedule.reversed.toList();

    _totalLoan = _defaultLoanAmount;
    _totalPaid = totalPaid;
    _totalPrincipal = totalPrincipal;
    _totalInterest = totalInterest;
    _totalFees = totalFees;
    _remaining = currentBalance;
    _percentage = ((_defaultLoanAmount - currentBalance) / _defaultLoanAmount) * 100;
    if (_percentage > 100) _percentage = 100;
  }

  Future<void> addPayment(Payment payment) async {
    try {
      await _firestore.collection(_collectionName).add(payment.toFirestore());
    } catch (e) {
      print("Error adding document: $e");
      throw Exception("Error saving payment.");
    }
  }

  Future<void> updatePayment(String id, Payment payment) async {
    try {
      await _firestore.collection(_collectionName).doc(id).update(payment.toFirestore());
    } catch (e) {
      print("Error updating document: $e");
      throw Exception("Error updating payment.");
    }
  }

  Future<void> deletePayment(String id) async {
    try {
      await _firestore.collection(_collectionName).doc(id).delete();
    } catch (e) {
      print("Error deleting document: $e");
      throw Exception("Error deleting payment.");
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
