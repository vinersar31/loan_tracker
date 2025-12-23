"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { getPreferences, savePreferences } from '@/utils/userPreferences';

const UserPreferencesContext = createContext();

export function UserPreferencesProvider({ children }) {
    const [prefs, setPrefs] = useState(() => ({
        theme: 'dark',
        hiddenStats: [],
        hiddenIndicators: [],
        statCardOrder: ['remaining', 'totalPrincipal', 'totalInterest', 'totalFees', 'totalPaid'],
    }));
    const [mounted, setMounted] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        // Load preferences only on client
        const loadedPrefs = getPreferences();
        console.log('UserPreferencesProvider: Loaded prefs from localStorage:', loadedPrefs);
        setPrefs(loadedPrefs);
        setMounted(true);

        // Apply theme
        document.documentElement.setAttribute('data-theme', loadedPrefs.theme);
    }, []);

    const updatePrefs = (updates) => {
        console.log('UserPreferencesProvider: updatePrefs called with:', updates);
        setPrefs(current => {
            const newPrefs = { ...current, ...updates };
            console.log('UserPreferencesProvider: New prefs:', newPrefs);
            savePreferences(newPrefs);
            return newPrefs;
        });
        setVersion(v => {
            const newVersion = v + 1;
            console.log('UserPreferencesProvider: Version incremented to:', newVersion);
            return newVersion;
        });

        // Apply theme immediately
        if (updates.theme) {
            document.documentElement.setAttribute('data-theme', updates.theme);
        }
    };

    return (
        <UserPreferencesContext.Provider value={{ prefs, updatePrefs, mounted, version }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within UserPreferencesProvider');
    }
    return context;
}
