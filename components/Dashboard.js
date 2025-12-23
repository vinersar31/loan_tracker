import { useState, useEffect } from 'react';
import { formatCurrency } from "@/utils/format";
import PaymentBreakdownChart from './PaymentBreakdownChart';
import { useUserPreferences } from '@/hooks/useUserPreferences';
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
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStatCard({ id, children, isDraggable }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled: !isDraggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? 'grab' : 'default',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export default function Dashboard({ stats }) {
    const [collapsed, setCollapsed] = useState(false);
    const { prefs, updatePrefs, mounted, version } = useUserPreferences();
    const degrees = (stats.percentage / 100) * 360;

    console.log('Dashboard render - version:', version, 'hiddenStats:', prefs.hiddenStats);

    // Default order for stat cards
    const defaultOrder = ['remaining', 'totalPrincipal', 'totalInterest', 'totalFees', 'totalPaid'];
    const [cardOrder, setCardOrder] = useState(defaultOrder);

    // Update card order once mounted and preferences are loaded
    useEffect(() => {
        if (mounted && prefs.statCardOrder) {
            setCardOrder(prefs.statCardOrder);
        }
    }, [mounted, prefs.statCardOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                updatePrefs({ statCardOrder: newOrder });
                return newOrder;
            });
        }
    };

    const isHidden = (id) => {
        const hidden = (prefs.hiddenStats || []).includes(id);
        console.log(`isHidden(${id}):`, hidden, 'hiddenStats:', prefs.hiddenStats);
        return hidden;
    };

    const statCardData = {
        remaining: { label: 'Remaining', value: stats.remaining, style: { color: 'var(--primary)' } },
        totalPrincipal: { label: 'Total Principal', value: stats.totalPrincipal, className: 'text-success' },
        totalInterest: { label: 'Total Interest', value: stats.totalInterest, className: 'text-danger' },
        totalFees: { label: 'Fees', value: stats.totalFees, style: { color: 'var(--warning)' } },
        totalPaid: { label: 'Total Paid', value: stats.totalPaid, style: { color: 'var(--text-main)', fontWeight: '800' } }
    };

    const visibleCards = cardOrder.filter(id => !isHidden(id));
    console.log('Rendering Dashboard - visibleCards:', visibleCards, 'cardOrder:', cardOrder, 'hiddenStats:', prefs.hiddenStats);

    return (
        <section className="dashboard">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Overview</h2>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    {collapsed ? 'Expand ▼' : 'Collapse ▲'}
                </button>
            </div>

            {!collapsed && (
                <>
                    <div className="progress-card">
                        <div
                            className="circular-progress"
                            style={{ background: `conic-gradient(var(--primary) ${degrees}deg, #2C2F3A ${degrees}deg)` }}
                        >
                            <div className="inner-circle">
                                <span id="percentage-text">{Math.round(stats.percentage)}%</span>
                                <p>Paid Off</p>
                            </div>
                        </div>
                    </div>

                    {mounted ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={visibleCards}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="stats-grid">
                                    {visibleCards.map(id => {
                                        const card = statCardData[id];
                                        return (
                                            <SortableStatCard key={id} id={id} isDraggable={visibleCards.length > 1}>
                                                <div className="stat-card">
                                                    <h3>{card.label}</h3>
                                                    <p className={card.className} style={card.style}>
                                                        {formatCurrency(card.value)}
                                                    </p>
                                                </div>
                                            </SortableStatCard>
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="stats-grid">
                            {visibleCards.map(id => {
                                const card = statCardData[id];
                                return (
                                    <div key={id} className="stat-card">
                                        <h3>{card.label}</h3>
                                        <p className={card.className} style={card.style}>
                                            {formatCurrency(card.value)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <PaymentBreakdownChart stats={stats} />
                </>
            )}
        </section>
    );
}
