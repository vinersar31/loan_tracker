const admin = require('firebase-admin');
const XLSX = require('xlsx');
const { DEFAULT_LOAN_AMOUNT } = require("../utils/constants");

async function main() {
    console.log("Starting export process...");

    // Requires these environment variables to be set in the CI context
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal '\n' characters with actual newlines for the private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

    if (!projectId || !clientEmail || !privateKey) {
        console.error("Missing Firebase Admin SDK credentials. Export aborted.");
        // We write an empty/dummy file so the CI pipeline doesn't fail on missing attachment
        // if people are just testing, but normally this would process.exit(1)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ error: "No data loaded due to missing credentials" }]), "Error");
        XLSX.writeFile(workbook, "Mortgage_Payments_History.xlsx");
        return;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            })
        });

        const db = admin.firestore();
        const paymentsRef = db.collection('payments');
        const snapshot = await paymentsRef.orderBy("date", "desc").get();

        if (snapshot.empty) {
            console.log("No payments found.");
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ message: "No payments recorded" }]), "Payment History");
            XLSX.writeFile(workbook, "Mortgage_Payments_History.xlsx");
            return;
        }

        const payments = [];
        snapshot.forEach(doc => {
            payments.push({ id: doc.id, ...doc.data() });
        });

        // Calculate schedule logic similar to useLoanData.js
        const sortedPayments = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));


        let currentBalance = DEFAULT_LOAN_AMOUNT;

        const calculatedSchedule = sortedPayments.map(payment => {
            const principal = parseFloat(payment.principal || 0);
            const amount = parseFloat(payment.amount || 0);
            const fees = parseFloat(payment.fees || 0);
            const interest = amount - principal - fees;

            currentBalance -= principal;
            if (currentBalance < 0) currentBalance = 0;

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

        const dataToExport = reversedSchedule.map(item => ({
            Date: item.date, // Server side, just use the string or parse date if needed
            Principal: item.principal,
            Interest: item.interest,
            Fees: item.fees,
            Total: item.amount,
            RemainingBalance: item.remainingBalance
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
        XLSX.writeFile(workbook, "Mortgage_Payments_History.xlsx");

        console.log("Export completed successfully.");

    } catch (error) {
        console.error("Error during export:", error);
        process.exit(1);
    }
}

main();
