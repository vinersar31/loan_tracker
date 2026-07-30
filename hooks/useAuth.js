import { useState, useEffect } from 'react';
import { auth } from '@/utils/firebase';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';

// Helper to hash email client-side
async function hashEmail(email) {
    if (!email) return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if the logged-in user is the allowed user
                if (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_HASH) {
                    const hashedEmail = await hashEmail(user.email);
                    if (hashedEmail !== process.env.NEXT_PUBLIC_ALLOWED_EMAIL_HASH) {
                        firebaseSignOut(auth);
                        setError("Unauthorized email address.");
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                }

                setUser(user);
                setError(null);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            if (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_HASH) {
                const hashedEmail = await hashEmail(email);
                if (hashedEmail !== process.env.NEXT_PUBLIC_ALLOWED_EMAIL_HASH) {
                    throw new Error("Unauthorized email address.");
                }
            }
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, login, logout };
}
