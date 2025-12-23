import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/format';

export default function PaymentBreakdownChart({ stats }) {
    const data = [
        { name: 'Principal', value: stats.totalPrincipal || 0, color: 'var(--success)' },
        { name: 'Interest', value: stats.totalInterest || 0, color: 'var(--danger)' },
        { name: 'Fees', value: stats.totalFees || 0, color: 'var(--warning)' }
    ];

    // Filter out zero values
    const filteredData = data.filter(item => item.value > 0);

    if (filteredData.length === 0) {
        return (
            <div className="chart-card">
                <h3>Payment Breakdown</h3>
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: 'var(--text-dim)'
                }}>
                    No payment data yet. Add your first payment to see the breakdown!
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-card)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>
                        {payload[0].name}
                    </p>
                    <p style={{ margin: 0, color: payload[0].payload.color }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {((payload[0].value / stats.totalPaid) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-card">
            <h3>Payment Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={filteredData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {filteredData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color.startsWith('var') ?
                                    getComputedStyle(document.documentElement).getPropertyValue(entry.color.match(/--[^)]+/)?.[0] || '') :
                                    entry.color
                                }
                                stroke="var(--background)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                            <span style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                                {value}: {formatCurrency(entry.payload.value)}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
