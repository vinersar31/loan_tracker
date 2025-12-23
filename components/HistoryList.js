import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from "@/utils/format";

// Cell Component for Click-to-Edit
const EditableCell = ({ value, type = "text", onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        setTempValue(value);
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) {
            onSave(tempValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setTempValue(value);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                step="0.01"
                className="table-input"
            />
        );
    }

    return (
        <div onClick={handleClick} className="table-cell-display">
            {type === 'number' ? formatCurrency(value) : value}
        </div>
    );
};

export default function HistoryList({ schedule, onDelete, onUpdate }) {
    return (
        <section className="history-section">
            <h2>History</h2>
            <div className="table-container">
                {schedule.length === 0 ? (
                    <div className="empty-state">No payments yet. Start tracking!</div>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Principal</th>
                                <th>Interest</th>
                                <th>Fees</th>
                                <th>Total</th>
                                <th>Rem.</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="table-cell-display" data-label="Date">
                                            {new Date(item.date).toLocaleDateString('ro-RO')}
                                        </div>
                                    </td>
                                    <td data-label="Principal">
                                        <EditableCell
                                            value={item.principal}
                                            type="number"
                                            onSave={(val) => onUpdate(item.id, { principal: parseFloat(val), amount: parseFloat(val) + parseFloat(item.interest) + parseFloat(item.fees) })}
                                        />
                                    </td>
                                    <td data-label="Interest">
                                        <EditableCell
                                            value={item.interest}
                                            type="number"
                                            onSave={(val) => onUpdate(item.id, { interest: parseFloat(val), amount: parseFloat(item.principal) + parseFloat(val) + parseFloat(item.fees) })}
                                        />
                                    </td>
                                    <td data-label="Fees">
                                        <EditableCell
                                            value={item.fees}
                                            type="number"
                                            onSave={(val) => onUpdate(item.id, { fees: parseFloat(val), amount: parseFloat(item.principal) + parseFloat(item.interest) + parseFloat(val) })}
                                        />
                                    </td>
                                    <td className="text-success" data-label="Total">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="text-dim" data-label="Remaining">
                                        {formatCurrency(item.remainingBalance)}
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDelete(item.id)}
                                            title="Delete payment"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
