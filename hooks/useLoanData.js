import { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

const DEFAULT_LOAN_AMOUNT = 412110.84; // User's specific amount
const COLLECTION_NAME = 'payments';

export function useLoanData() {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        totalLoan: DEFAULT_LOAN_AMOUNT,
        totalPaid: 0,
        remaining: DEFAULT_LOAN_AMOUNT,
        percentage: 0
    });
    const [schedule, setSchedule] = useState([]);

    // Subscribe to Firestore updates
    useEffect(() => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPayments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPayments(fetchedPayments);
            calculateSchedule(fetchedPayments);
        }, (error) => {
            console.error("Firestore Error:", error);
            // If it's a permission/auth error, alert the user
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                alert("Database connection failed. Please check your Firebase configuration and restart the server.");
            }
        });

        return () => unsubscribe();
    }, []);

    const calculateSchedule = (currentPayments) => {
        // Sort payments by date ASCENDING for calculation
        const sortedPayments = [...currentPayments].sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentBalance = DEFAULT_LOAN_AMOUNT;
        let totalPaid = 0;
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalFees = 0;

        const calculatedSchedule = sortedPayments.map(payment => {
            // New Model: Principal/Interest/Fees are explicit in the payment object
            // If they are missing (legacy data), we default to 0 or calculate roughly

            const principal = parseFloat(payment.principal || 0);
            const interest = parseFloat(payment.interest || 0);
            const fees = parseFloat(payment.fees || 0);
            const amount = parseFloat(payment.amount || 0);

            // Legacy fallback: if principal is 0 but amount > 0, assume old auto-calc logic temporarily
            // or just treat amount as principal reduction? 
            // Better to assume if principal is 0, we trust the user to edit it. 
            // For now, let's subtract whatever valid principal we have.

            currentBalance -= principal;
            if (currentBalance < 0) currentBalance = 0;

            totalPaid += amount;
            totalPrincipal += principal;
            totalInterest += interest;
            totalFees += fees;

            return {
                ...payment,
                amount,
                principal,
                interest,
                fees,
                remainingBalance: currentBalance
            };
        });

        // Reverse for display (newest first)
        const reversedSchedule = calculatedSchedule.reverse();
        setSchedule(reversedSchedule);

        setStats({
            totalLoan: DEFAULT_LOAN_AMOUNT,
            totalPaid,
            totalPrincipal,
            totalInterest,
            totalFees,
            remaining: currentBalance,
            percentage: Math.min(100, ((DEFAULT_LOAN_AMOUNT - currentBalance) / DEFAULT_LOAN_AMOUNT) * 100)
        });
    };

    const addPayment = async (data) => {
        // data expects: { date, amount, principal, interest, fees }
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                createdAt: new Date()
            });
            console.log("Payment saved to Firestore successfully.");
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving payment.");
        }
    };

    const updatePayment = async (id, data) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, data);
        } catch (e) {
            console.error("Error updating document: ", e);
            alert("Error updating payment.");
        }
    };

    const deletePayment = async (id) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            try {
                await deleteDoc(doc(db, COLLECTION_NAME, id));
            } catch (e) {
                console.error("Error deleting document: ", e);
                alert("Error deleting payment.");
            }
        }
    };

    return { stats, schedule, addPayment, updatePayment, deletePayment };
}
