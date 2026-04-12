import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { SortableCard } from './SortableCard';
import PaymentBreakdownChart from './PaymentBreakdownChart';

export default function Dashboard({ stats }) {
    const { prefs, mounted, updatePreference, isHidden } = useUserPreferences();
    const [cardOrder, setCardOrder] = useState([
        'totalLoan', 'totalPaid', 'totalPrincipal', 'totalInterest', 'totalFees', 'remaining'
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize order from preferences
    useEffect(() => {
        let isSubscribed = true;

        // Use timeout to let the initial render complete before setting state
        const timer = setTimeout(() => {
            if (mounted && prefs.statCardOrder && isSubscribed) {
                setCardOrder(prefs.statCardOrder);
            }
        }, 0);

        return () => {
            isSubscribed = false;
            clearTimeout(timer);
        };
    }, [mounted, prefs.statCardOrder]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save to preferences
                updatePreference('statCardOrder', newOrder);
                return newOrder;
            });
        }
    };

    const allCards = {
        totalLoan: { title: "Total Loan", value: formatCurrency(stats.totalLoan) },
        totalPaid: { title: "Total Paid", value: formatCurrency(stats.totalPaid) },
        totalPrincipal: { title: "Total Principal", value: formatCurrency(stats.totalPrincipal) },
        totalInterest: { title: "Total Interest", value: formatCurrency(stats.totalInterest) },
        totalFees: { title: "Total Fees", value: formatCurrency(stats.totalFees) },
        remaining: { title: "Remaining Balance", value: formatCurrency(stats.remaining) }
    };

    // Filter to only show cards that exist in our allCards list
    const visibleCards = cardOrder.filter(id => allCards[id] && (!mounted || !isHidden(id, 'statCard')));

    return (
        <section className="dashboard" style={{ marginTop: '30px' }}>
            <div className="stats-grid">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={visibleCards}
                        strategy={horizontalListSortingStrategy}
                    >
                        {visibleCards.map(id => (
                            <SortableCard
                                key={id}
                                id={id}
                                title={allCards[id].title}
                                value={allCards[id].value}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
                <div className="progress-card">
                    <div className="circular-progress" style={{
                        background: `conic-gradient(var(--primary) ${stats.percentage}%, var(--surface-highlight) ${stats.percentage}%)`
                    }}>
                        <div className="inner-circle">
                            <span id="percentage-text">{stats.percentage.toFixed(1)}%</span>
                            <p>Paid Off</p>
                        </div>
                    </div>
                </div>

                <PaymentBreakdownChart stats={stats} />
            </div>
        </section>
    );
}
