import { useState, useEffect, createContext, useContext } from 'react';

const PREFS_KEY = 'mortgage_tracker_prefs';

const defaultPreferences = {
    theme: 'dark', // 'dark' | 'light'
    hiddenIndicators: [],
    hiddenStatCards: [],
    statCardOrder: null, // null means use default order
    indicatorOrder: null // null means use default order
};

const UserPreferencesContext = createContext();

export function UserPreferencesProvider({ children }) {
    const [prefs, setPrefs] = useState(() => {
        if (typeof window === 'undefined') return defaultPreferences;
        try {
            const stored = localStorage.getItem(PREFS_KEY);
            return stored ? JSON.parse(stored) : defaultPreferences;
        } catch (e) {
            console.error("Failed to load preferences", e);
            return defaultPreferences;
        }
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        if (prefs.theme) {
            document.documentElement.setAttribute('data-theme', prefs.theme);
        }
        return () => clearTimeout(timer);
    }, [prefs.theme]);

    const updatePreference = (key, value) => {
        setPrefs(prev => {
            const newPrefs = { ...prev, [key]: value };
            try {
                localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
                console.log(`Updated preference ${key} to`, value);
            } catch (e) {
                console.error("Failed to save preference", e);
            }
            return newPrefs;
        });
    };

    // Derived helpers
    const toggleTheme = () => {
        const newTheme = prefs.theme === 'dark' ? 'light' : 'dark';
        updatePreference('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleIndicator = (id) => {
        const hidden = [...(prefs.hiddenIndicators || [])];
        if (hidden.includes(id)) {
            updatePreference('hiddenIndicators', hidden.filter(i => i !== id));
        } else {
            updatePreference('hiddenIndicators', [...hidden, id]);
        }
    };

    const toggleStatCard = (id) => {
        const hidden = [...(prefs.hiddenStatCards || [])];
        if (hidden.includes(id)) {
            updatePreference('hiddenStatCards', hidden.filter(i => i !== id));
        } else {
            updatePreference('hiddenStatCards', [...hidden, id]);
        }
    };

    const isHidden = (id, type) => {
        if (type === 'indicator') {
            return (prefs.hiddenIndicators || []).includes(id);
        }
        if (type === 'statCard') {
            return (prefs.hiddenStatCards || []).includes(id);
        }
        return false;
    };

    return (
        <UserPreferencesContext.Provider value={{
            prefs,
            mounted,
            updatePreference,
            toggleTheme,
            toggleIndicator,
            toggleStatCard,
            isHidden
        }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    return useContext(UserPreferencesContext);
}
