/**
 * Loan Tracker Application Logic (Firestore Version)
 */
import { db } from './firebase-config.js';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Constants & Config ---
const DEFAULT_LOAN_AMOUNT = 10000;
const DEFAULT_INTEREST_RATE = 5.0; // 5% Annual
const DEFAULT_START_DATE = new Date().toISOString().split('T')[0];
const COLLECTION_NAME = 'payments';

// --- Data Model ---
class LoanModel {
    constructor(onDataChange) {
        this.data = {
            totalLoan: DEFAULT_LOAN_AMOUNT,
            interestRate: DEFAULT_INTEREST_RATE,
            startDate: DEFAULT_START_DATE,
            payments: []
        };
        this.onDataChange = onDataChange;
        this.initFirestoreListener();
    }

    initFirestoreListener() {
        const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));

        onSnapshot(q, (snapshot) => {
            this.data.payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.onDataChange();
        });
    }

    async addPayment(amount, date) {
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                amount: parseFloat(amount),
                date: date,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving payment. Check console.");
        }
    }

    async deletePayment(id) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (e) {
            console.error("Error deleting document: ", e);
            alert("Error deleting payment. Check console.");
        }
    }

    // Calculate the amortization schedule based on payments made
    calculateSchedule() {
        // Sort payments by date ASCENDING for calculation
        const sortedPayments = [...this.data.payments].sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentBalance = this.data.totalLoan;
        let totalPaid = 0;
        const monthlyRate = (this.data.interestRate / 100) / 12;

        const schedule = sortedPayments.map(payment => {
            const interest = currentBalance * monthlyRate;
            let principal = payment.amount - interest;

            if (principal > currentBalance) {
                principal = currentBalance;
            }

            currentBalance -= principal;
            if (currentBalance < 0) currentBalance = 0;

            totalPaid += payment.amount;

            return {
                ...payment,
                interestPaid: interest,
                principalPaid: principal,
                remainingBalance: currentBalance
            };
        });

        // Reverse for display (newest first)
        return {
            schedule: schedule.reverse(),
            totalPaid: totalPaid,
            remaining: currentBalance,
            percentage: Math.min(100, ((this.data.totalLoan - currentBalance) / this.data.totalLoan) * 100)
        };
    }
}

// --- UI Controller ---
class UIController {
    constructor() {
        // Elements
        this.form = document.getElementById('payment-form');
        this.amountInput = document.getElementById('amount');
        this.dateInput = document.getElementById('date');
        this.historyList = document.getElementById('history-list');

        // Stats Elements
        this.remainingEl = document.getElementById('remaining-amount');
        this.totalPaidEl = document.getElementById('total-paid');
        this.percentageText = document.getElementById('percentage-text');
        this.circularProgress = document.querySelector('.circular-progress');

        // Initialize Model with Callback
        this.model = new LoanModel(() => this.updateUI());

        this.init();
    }

    init() {
        // Set default date to today
        this.dateInput.valueAsDate = new Date();

        // Event Listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.historyList.addEventListener('click', (e) => this.handleDelete(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        const amount = this.amountInput.value;
        const date = this.dateInput.value;

        if (amount && date) {
            this.model.addPayment(amount, date);
            // UI update happens automatically via listener
            this.form.reset();
            this.dateInput.valueAsDate = new Date();
        }
    }

    handleDelete(e) {
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id; // ID is now a string (Firestore ID)
            if (confirm('Are you sure you want to delete this payment?')) {
                this.model.deletePayment(id);
            }
        }
    }

    updateUI() {
        const stats = this.model.calculateSchedule();
        this.renderStats(stats);
        this.renderHistory(stats.schedule);
    }

    renderStats(stats) {
        this.remainingEl.textContent = this.formatCurrency(stats.remaining);
        this.totalPaidEl.textContent = this.formatCurrency(stats.totalPaid);
        this.percentageText.textContent = `${Math.round(stats.percentage)}%`;

        // Update Circular Progress
        const degrees = (stats.percentage / 100) * 360;
        this.circularProgress.style.background = `conic-gradient(var(--primary) ${degrees}deg, #2C2F3A ${degrees}deg)`;
    }

    renderHistory(schedule) {
        this.historyList.innerHTML = '';

        if (schedule.length === 0) {
            this.historyList.innerHTML = '<div class="empty-state">No payments yet. Start tracking!</div>';
            return;
        }

        schedule.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <div class="history-main">
                    <div class="history-header">
                        <span class="history-date">${new Date(item.date).toLocaleDateString()}</span>
                        <span class="history-amount">+${this.formatCurrency(item.amount)}</span>
                    </div>
                    <div class="history-details">
                        <div class="detail-row">
                            <span>Principal</span>
                            <span>${this.formatCurrency(item.principalPaid)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Interest</span>
                            <span>${this.formatCurrency(item.interestPaid)}</span>
                        </div>
                        <div class="detail-row highlight">
                            <span>Remaining</span>
                            <span>${this.formatCurrency(item.remainingBalance)}</span>
                        </div>
                    </div>
                </div>
                <button class="delete-btn" data-id="${item.id}">✕</button>
            `;
            this.historyList.appendChild(el);
        });
    }

    formatCurrency(num) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UIController();
});
