import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from "@/utils/format";
import { getAllIndicators } from '@/utils/bnrData';
import { db } from '@/utils/firebase';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function EconomicIndicators() {
    const [collapsed, setCollapsed] = useState(false);
    const [indicators, setIndicators] = useState(null);
    const [loading, setLoading] = useState(true);
    const { prefs, version } = useUserPreferences();

    console.log('EconomicIndicators render - version:', version, 'hiddenIndicators:', prefs.hiddenIndicators);

    useEffect(() => {
        const loadIndicators = async () => {
            setLoading(true);
            const data = await getAllIndicators(db);
            setIndicators(data);
            setLoading(false);
        };

        loadIndicators();
    }, []);

    const formatPercent = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return `${value.toFixed(2)}%`;
    };

    const formatRate = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return value.toFixed(4);
    };

    const isHidden = (id) => {
        const hidden = (prefs.hiddenIndicators || []).includes(id);
        console.log(`Indicator isHidden(${id}):`, hidden, 'hiddenIndicators:', prefs.hiddenIndicators);
        return hidden;
    };

    const indicatorCards = [
        { id: 'eurRon', label: 'EUR/RON', value: indicators?.eurRon, formatter: formatRate, style: { color: 'var(--primary)' } },
        { id: 'policyRate', label: 'Policy Rate', value: indicators?.policyRate, formatter: formatPercent },
        { id: 'inflation', label: 'Inflation', value: indicators?.inflation, formatter: formatPercent, className: 'text-danger' },
        { id: 'robor3m', label: 'ROBOR 3M', value: indicators?.robor3m, formatter: formatPercent },
        { id: 'robor6m', label: 'ROBOR 6M', value: indicators?.robor6m, formatter: formatPercent },
        { id: 'ircc', label: 'IRCC', value: indicators?.ircc, formatter: formatPercent, style: { color: 'var(--warning)' } }
    ];

    const visibleIndicators = useMemo(() => {
        const visible = indicatorCards.filter(card => !isHidden(card.id));
        console.log('EconomicIndicators useMemo - visible:', visible.map(c => c.id), 'version:', version);
        return visible;
    }, [version, indicators]);

    return (
        <section className="dashboard">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Economic Indicators</h2>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    {collapsed ? 'Expand ▼' : 'Collapse ▲'}
                </button>
            </div>

            {!collapsed && (
                <>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading indicators...
                        </div>
                    ) : visibleIndicators.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                            All indicators are hidden. Click the ⚙️ button to show them.
                        </div>
                    ) : (
                        <div className="stats-grid">
                            {visibleIndicators.map(card => (
                                <div key={card.id} className="stat-card">
                                    <h3>{card.label}</h3>
                                    <p className={card.className} style={card.style}>
                                        {card.formatter(card.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    {indicators?.lastUpdated && (
                        <div style={{
                            marginTop: '16px',
                            fontSize: '12px',
                            color: 'var(--text-dim)',
                            textAlign: 'right'
                        }}>
                            Last updated: {new Date(indicators.lastUpdated.seconds * 1000).toLocaleDateString('ro-RO')}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
