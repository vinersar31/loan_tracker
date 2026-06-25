"use client";
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import FileDropzone from './FileDropzone';

export default function PaymentForm({ onAdd }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [principal, setPrincipal] = useState('');
    const [interest, setInterest] = useState('');
    const [fees, setFees] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const i = parseFloat(interest) || 0;
        const f = parseFloat(fees) || 0;
        const sum = p + i + f;
        return sum > 0 ? sum.toFixed(2) : '';
    }, [principal, interest, fees]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (date && (principal || interest || fees)) {
            setIsSubmitting(true);
            await onAdd({
                date,
                amount: parseFloat(total) || 0,
                principal: parseFloat(principal) || 0,
                interest: parseFloat(interest) || 0,
                fees: parseFloat(fees) || 0
            }, files);

            setPrincipal('');
            setInterest('');
            setFees('');
            setFiles([]);
            setDate(new Date().toISOString().split('T')[0]);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="card p-5 sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-main">
                <Plus size={18} className="text-primary" /> Add payment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label" htmlFor="date">Date</label>
                    <input
                        className="input"
                        type="date"
                        id="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <label className="label" htmlFor="principal">Principal</label>
                        <input className="input" type="number" id="principal" placeholder="0.00" step="0.01" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="interest">Interest</label>
                        <input className="input" type="number" id="interest" placeholder="0.00" step="0.01" value={interest} onChange={(e) => setInterest(e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="fees">Fees</label>
                        <input className="input" type="number" id="fees" placeholder="0.00" step="0.01" value={fees} onChange={(e) => setFees(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="label" htmlFor="total">Total (auto-calculated)</label>
                    <input className="input cursor-not-allowed opacity-70" type="number" id="total" placeholder="0.00" readOnly value={total} />
                </div>

                <FileDropzone files={files} setFiles={setFiles} />
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding…' : 'Add payment'}
                </button>
            </form>
        </section>
    );
}
