import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 2
    }).format(value);
}

const CustomTooltip = ({ active, payload, totalPaid }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--surface)',
                border: 'var(--glass-border)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)'
            }}>
                <p style={{
                    margin: '0 0 5px 0',
                    fontWeight: '600',
                    color: payload[0].payload.color
                }}>
                    {payload[0].name}
                </p>
                <p style={{
                    margin: 0,
                    color: 'var(--text-main)',
                    fontWeight: '700'
                }}>
                    {formatCurrency(payload[0].value)}
                </p>
                <p style={{
                    margin: '5px 0 0 0',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                }}>
                    {((payload[0].value / totalPaid) * 100).toFixed(1)}% of total
                </p>
            </div>
        );
    }
    return null;
};

export default function PaymentBreakdownChart({ stats }) {
    // Only show the chart if we have some data
    if (!stats || (stats.totalPrincipal === 0 && stats.totalInterest === 0 && stats.totalFees === 0)) {
        return (
            <div className="chart-card empty-chart">
                <h3>Payment Breakdown</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', color: 'var(--text-secondary)' }}>
                    No payment data available yet.
                </div>
            </div>
        );
    }

    const data = [
        { name: 'Principal', value: stats.totalPrincipal, color: 'var(--primary)' },
        { name: 'Interest', value: stats.totalInterest, color: '#f59e0b' },
        { name: 'Fees', value: stats.totalFees, color: '#ec4899' }
    ].filter(item => item.value > 0); // Only show non-zero segments

    return (
        <div className="chart-card">
            <h3>Payment Breakdown</h3>
            <div style={{ width: '100%', height: '220px', minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip totalPaid={stats.totalPaid} />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry) => <span style={{ color: 'var(--text-main)' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
