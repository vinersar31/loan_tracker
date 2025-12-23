"use client";
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function ThemeToggle() {
    const { prefs, updatePrefs, mounted } = useUserPreferences();

    const toggleTheme = () => {
        const newTheme = prefs.theme === 'dark' ? 'light' : 'dark';
        updatePrefs({ theme: newTheme });
    };

    // Prevent hydration mismatch
    if (!mounted) return <div style={{ width: 48, height: 48 }} />;

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {prefs.theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
