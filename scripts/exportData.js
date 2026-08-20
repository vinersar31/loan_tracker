const admin = require('firebase-admin');
const XLSX = require('xlsx');
const { DEFAULT_LOAN_AMOUNT, EXPORT_FILE_NAME, EXPORT_SHEET_NAME } = require("../utils/constants");

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
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ error: "No data loaded due to missing credentials" }]), "Error"); // Kept as Error sheet for error case
        XLSX.writeFile(workbook, EXPORT_FILE_NAME);
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
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ message: "No payments recorded" }]), EXPORT_SHEET_NAME);
            XLSX.writeFile(workbook, EXPORT_FILE_NAME);
            return;
        }

        const payments = [];
        snapshot.forEach(doc => {
            payments.push({ id: doc.id, ...doc.data() });
        });

        // Calculate schedule logic similar to useLoanData.js
        const sortedPayments = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));


        let currentBalance = DEFAULT_LOAN_AMOUNT;

        const len = sortedPayments.length;
        const dataToExport = new Array(len);

        for (let i = 0; i < len; i++) {
            const payment = sortedPayments[i];
            const principal = parseFloat(payment.principal || 0);
            const amount = parseFloat(payment.amount || 0);
            const fees = parseFloat(payment.fees || 0);
            const interest = amount - principal - fees;

            currentBalance -= principal;
            if (currentBalance < 0) currentBalance = 0;

            // Reverse for display (newest first) by populating backwards
            dataToExport[len - 1 - i] = {
                Date: payment.date, // Server side, just use the string or parse date if needed
                Principal: principal,
                Interest: interest,
                Fees: fees,
                Total: amount,
                RemainingBalance: currentBalance
            };
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, EXPORT_SHEET_NAME);
        XLSX.writeFile(workbook, EXPORT_FILE_NAME);

        console.log("Export completed successfully.");

    } catch (error) {
        console.error("Error during export:", error);
        process.exit(1);
    }
}

main();
