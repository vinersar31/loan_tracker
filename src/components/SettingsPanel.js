"use client";
import { useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function SettingsPanel() {
    const { prefs, updatePrefs, mounted } = useUserPreferences();
    const [isOpen, setIsOpen] = useState(false);

    const statCards = [
        { id: 'remaining', name: 'Remaining' },
        { id: 'totalPrincipal', name: 'Total Principal' },
        { id: 'totalInterest', name: 'Total Interest' },
        { id: 'totalFees', name: 'Fees' },
        { id: 'totalPaid', name: 'Total Paid' }
    ];

    const indicators = [
        { id: 'eurRon', name: 'EUR/RON' },
        { id: 'policyRate', name: 'Policy Rate' },
        { id: 'inflation', name: 'Inflation' },
        { id: 'robor3m', name: 'ROBOR 3M' },
        { id: 'robor6m', name: 'ROBOR 6M' },
        { id: 'ircc', name: 'IRCC' }
    ];

    const toggleStatCard = (id) => {
        console.log('Toggle stat card:', id);
        const current = prefs.hiddenStats || [];
        const updated = current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id];
        console.log('Updated hidden stats:', updated);
        updatePrefs({ hiddenStats: updated });
    };

    const toggleIndicator = (id) => {
        console.log('Toggle indicator:', id);
        const current = prefs.hiddenIndicators || [];
        const updated = current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id];
        console.log('Updated hidden indicators:', updated);
        updatePrefs({ hiddenIndicators: updated });
    };

    const isStatHidden = (id) => (prefs.hiddenStats || []).includes(id);
    const isIndicatorHidden = (id) => (prefs.hiddenIndicators || []).includes(id);

    return (
        <div className="settings-panel-container">
            <button
                className="settings-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="Customize Dashboard"
            >
                ⚙️
            </button>

            {isOpen && (
                <>
                    <div className="settings-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="settings-panel">
                        <div className="settings-header">
                            <h3>Customize Dashboard</h3>
                            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                        </div>

                        {!mounted ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                Loading preferences...
                            </div>
                        ) : (
                            <>
                                <div className="settings-section">
                                    <h4>Stat Cards</h4>
                                    <div className="checkbox-grid">
                                        {statCards.map(card => (
                                            <label
                                                key={card.id}
                                                className="checkbox-label"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleStatCard(card.id);
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!isStatHidden(card.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatCard(card.id);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span>{card.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h4>Economic Indicators</h4>
                                    <div className="checkbox-grid">
                                        {indicators.map(indicator => (
                                            <label
                                                key={indicator.id}
                                                className="checkbox-label"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleIndicator(indicator.id);
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!isIndicatorHidden(indicator.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleIndicator(indicator.id);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span>{indicator.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="settings-footer">
                                    <p className="settings-hint">💡 Drag stat cards to reorder them</p>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
