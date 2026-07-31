import { escapeHtml } from "../utils/sanitize";
import { useState, useEffect, useCallback } from 'react';
import { db, storage, auth } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { DEFAULT_LOAN_AMOUNT } from "@/utils/constants";
import { calculateAmortizationSchedule } from "@/utils/calculations";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

let cachedXLSX = null;


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

    const sendEmailNotification = async (updatedPayments, subject, htmlBody) => {
        try {
            if (!auth.currentUser || !auth.currentUser.email) {
                console.warn("No logged in user found to send email to.");
                return;
            }

            // Generate Excel base64
            if (!cachedXLSX) {
                cachedXLSX = await import('xlsx');
            }
            const XLSX = cachedXLSX;

            const { schedule: calculatedSchedule } = calculateAmortizationSchedule(updatedPayments, DEFAULT_LOAN_AMOUNT);

            const reversedSchedule = calculatedSchedule.reverse();

            const dataToExport = reversedSchedule.map(item => ({
                Date: item.date,
                Principal: item.principal,
                Interest: item.interest,
                Fees: item.fees,
                Total: item.amount,
                RemainingBalance: item.remainingBalance
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
            const excelBase64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

            // Add document to 'mail' collection for Firebase Trigger Email extension
            await addDoc(collection(db, 'mail'), {
                to: auth.currentUser.email,
                message: {
                    subject: subject,
                    html: htmlBody,
                    attachments: [
                        {
                            filename: 'Mortgage_Payments_History.xlsx',
                            content: excelBase64,
                            encoding: 'base64'
                        }
                    ]
                }
            });
            console.log("Email queued successfully to " + auth.currentUser.email);
        } catch (err) {
            console.error("Failed to send email notification:", err);
        }
    };


    const calculateSchedule = useCallback((currentPayments) => {
        const { schedule, stats } = calculateAmortizationSchedule(currentPayments, DEFAULT_LOAN_AMOUNT);

        // Reverse for display (newest first)
        const reversedSchedule = schedule.reverse();
        setSchedule(reversedSchedule);

        setStats(stats);
    }, []);

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
    }, [calculateSchedule]);

    const addPayment = async (data, files = []) => {
        // data expects: { date, amount, principal, interest, fees }
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                createdAt: new Date(),
                documents: []
            });
            console.log("Payment saved to Firestore successfully.");
            if (files && files.length > 0) {
                await uploadDocuments(docRef.id, files, []);
            }

            const newPayment = { id: docRef.id, ...data };
            const updatedPayments = [...payments, newPayment];

            const htmlBody = `
                <h2>New Payment Added</h2>
                <p>A new mortgage payment has been recorded with the following details:</p>
                <ul>
                    <li><strong>Date:</strong> ${escapeHtml(data.date)}</li>
                    <li><strong>Total Amount:</strong> ${escapeHtml(data.amount)} RON</li>
                    <li><strong>Principal:</strong> ${escapeHtml(data.principal)} RON</li>
                    <li><strong>Fees:</strong> ${escapeHtml(data.fees || 0)} RON</li>
                </ul>
                <p>Please find the updated payment history attached.</p>
            `;

            await sendEmailNotification(updatedPayments, "New Mortgage Payment Added", htmlBody);

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
                const paymentToDelete = payments.find(p => p.id === id);
                await deleteDoc(doc(db, COLLECTION_NAME, id));

                if (paymentToDelete) {
                    const updatedPayments = payments.filter(p => p.id !== id);

                    const htmlBody = `
                        <h2>Payment Removed</h2>
                        <p>A mortgage payment has been removed with the following details:</p>
                        <ul>
                            <li><strong>Date:</strong> ${escapeHtml(paymentToDelete.date)}</li>
                            <li><strong>Total Amount:</strong> ${escapeHtml(paymentToDelete.amount)} RON</li>
                            <li><strong>Principal:</strong> ${escapeHtml(paymentToDelete.principal)} RON</li>
                        </ul>
                        <p>Please find the updated payment history attached.</p>
                    `;

                    await sendEmailNotification(updatedPayments, "Mortgage Payment Removed", htmlBody);
                }
            } catch (e) {
                console.error("Error deleting document: ", e);
                alert("Error deleting payment.");
            }
        }
    };


    const uploadDocuments = async (paymentId, files, currentDocuments = []) => {
        try {
            const uploadPromises = files.map(async (file) => {
                const refPath = `payments/${paymentId}/${file.name}`;
                const fileRef = ref(storage, refPath);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                return { name: file.name, url, refPath };
            });
            const uploadedDocs = await Promise.all(uploadPromises);

            const docRef = doc(db, COLLECTION_NAME, paymentId);
            const newDocs = [...currentDocuments, ...uploadedDocs];
            await updateDoc(docRef, { documents: newDocs });
            return newDocs;
        } catch (e) {
            console.error("Error uploading documents:", e);
            alert("Error uploading documents.");
            return currentDocuments;
        }
    };

    const deleteDocument = async (paymentId, documentPath, currentDocuments = []) => {
        try {
            const fileRef = ref(storage, documentPath);
            await deleteObject(fileRef);

            const newDocs = currentDocuments.filter(doc => doc.refPath !== documentPath);
            const docRef = doc(db, COLLECTION_NAME, paymentId);
            await updateDoc(docRef, { documents: newDocs });
            return newDocs;
        } catch (e) {
            console.error("Error deleting document:", e);
            alert("Error deleting document.");
            return currentDocuments;
        }
    };

    return { stats, schedule, addPayment, updatePayment, deletePayment, uploadDocuments, deleteDocument };
}
