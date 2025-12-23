import { useState, useEffect } from 'react';

export default function PaymentForm({ onAdd }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Split fields
    const [principal, setPrincipal] = useState('');
    const [interest, setInterest] = useState('');
    const [fees, setFees] = useState('');
    const [total, setTotal] = useState('');

    // Auto-calculate total when components change
    useEffect(() => {
        const p = parseFloat(principal) || 0;
        const i = parseFloat(interest) || 0;
        const f = parseFloat(fees) || 0;
        const sum = p + i + f;
        if (sum > 0) {
            setTotal(sum.toFixed(2));
        } else {
            setTotal('');
        }
    }, [principal, interest, fees]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (date && (principal || interest || fees)) {
            onAdd({
                date,
                amount: parseFloat(total) || 0,
                principal: parseFloat(principal) || 0,
                interest: parseFloat(interest) || 0,
                fees: parseFloat(fees) || 0
            });

            // Reset
            setPrincipal('');
            setInterest('');
            setFees('');
            setTotal('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    };

    return (
        <section className="input-section">
            <h2>Add Payment</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                        <label htmlFor="principal">Principal</label>
                        <input
                            type="number"
                            id="principal"
                            placeholder="0.00"
                            step="0.01"
                            value={principal}
                            onChange={(e) => setPrincipal(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="interest">Interest</label>
                        <input
                            type="number"
                            id="interest"
                            placeholder="0.00"
                            step="0.01"
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fees">Fees</label>
                        <input
                            type="number"
                            id="fees"
                            placeholder="0.00"
                            step="0.01"
                            value={fees}
                            onChange={(e) => setFees(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="total">Total Amount (Auto-calculated)</label>
                    <input
                        type="number"
                        id="total"
                        placeholder="0.00"
                        readOnly
                        value={total}
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                    />
                </div>

                <button type="submit" className="btn-primary">Add Payment</button>
            </form>
        </section>
    );
}
