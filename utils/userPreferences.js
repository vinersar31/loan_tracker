/**
 * User Preferences Utilities
 * Manages localStorage for user customization settings
 */

const PREFS_KEY = 'mortgage_tracker_preferences';

const DEFAULT_PREFERENCES = {
    theme: 'dark',
    hiddenStats: [],
    hiddenIndicators: [],
    statCardOrder: ['remaining', 'totalPrincipal', 'totalInterest', 'totalFees', 'totalPaid'],
};

export function getPreferences() {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

    try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (stored) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }

    return DEFAULT_PREFERENCES;
}

export function savePreferences(preferences) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

export function updatePreference(key, value) {
    const current = getPreferences();
    const updated = { ...current, [key]: value };
    savePreferences(updated);
    return updated;
}
