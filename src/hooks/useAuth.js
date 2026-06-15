import { useState, useEffect } from 'react';
import { auth } from '@/utils/firebase';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check if the logged-in user is the allowed user
                if (process.env.NEXT_PUBLIC_ALLOWED_EMAIL && user.email !== process.env.NEXT_PUBLIC_ALLOWED_EMAIL) {
                    firebaseSignOut(auth);
                    setError("Unauthorized email address.");
                    setUser(null);
                } else {
                    setUser(user);
                    setError(null);
                }
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
            if (process.env.NEXT_PUBLIC_ALLOWED_EMAIL && email !== process.env.NEXT_PUBLIC_ALLOWED_EMAIL) {
                throw new Error("Unauthorized email address.");
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
