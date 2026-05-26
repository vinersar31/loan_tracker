import { db as firebaseDb } from './firebase';
/**
 * BNR (Banca Națională a României) Data Utilities
 * Fetches economic indicators from BNR API and Firestore
 */

// Fetch EUR/RON exchange rate via Next.js API route (bypasses CORS)
export async function fetchEURRON() {
    try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/loan_tracker';
        const response = await fetch(`${basePath}/api/bnr`);
        const data = await response.json();

        if (data.success) {
            return data.eurRon;
        }

        console.error('Error fetching EUR/RON:', data.error);
        return null;
    } catch (error) {
        console.error('Error fetching EUR/RON from API:', error);
        return null;
    }
}

// Fetch other indicators from Firestore
export async function getStoredIndicators(db = firebaseDb) {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db || firebaseDb, 'indicators', 'latest');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }

        // Return defaults if no data exists
        return {
            policyRate: null,
            inflation: null,
            robor3m: null,
            robor6m: null,
            ircc: null,
            lastUpdated: null
        };
    } catch (error) {
        console.error('Error fetching stored indicators:', error);
        return null;
    }
}

// Combine all indicators
export async function getAllIndicators(db = firebaseDb) {
    const [eurRon, stored] = await Promise.all([
        fetchEURRON(),
        getStoredIndicators(db || firebaseDb)
    ]);

    return {
        eurRon,
        ...stored
    };
}
