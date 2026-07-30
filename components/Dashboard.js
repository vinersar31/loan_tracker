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
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
    Banknote,
    Hourglass,
    Landmark,
    Percent,
    Receipt,
    TrendingDown,
    Wallet,
} from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/utils/format';
import { SortableCard } from './SortableCard';
import PaymentBreakdownChart from './PaymentBreakdownChart';
import AmortizationChart from './AmortizationChart';

export default function Dashboard({ stats, schedule }) {
    const { prefs, mounted, updatePreference, isHidden } = useUserPreferences();
    const [cardOrder, setCardOrder] = useState([
        'totalLoan', 'totalPaid', 'totalPrincipal', 'totalInterest', 'totalFees', 'remaining'
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Initialize order from preferences
    useEffect(() => {
        let isSubscribed = true;
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


    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                updatePreference('statCardOrder', newOrder);
                return newOrder;
            });
        }
    };

    const allCards = {
        totalLoan: { title: 'Original loan', value: formatCurrency(stats.totalLoan), icon: Landmark, accent: '#8B7CE8' },
        totalPaid: { title: 'Total paid', value: formatCurrency(stats.totalPaid), icon: Wallet, accent: '#00E096' },
        totalPrincipal: { title: 'Principal paid', value: formatCurrency(stats.totalPrincipal), icon: Banknote, accent: '#6C5DD3' },
        totalInterest: { title: 'Interest paid', value: formatCurrency(stats.totalInterest), icon: Percent, accent: '#FFA600' },
        totalFees: { title: 'Fees paid', value: formatCurrency(stats.totalFees), icon: Receipt, accent: '#FF754C' },
        remaining: { title: 'Remaining', value: formatCurrency(stats.remaining), icon: Hourglass, accent: '#FF3D00' },
    };

    const visibleCards = cardOrder.filter(id => allCards[id] && (!mounted || !isHidden(id, 'statCard')));
    const pct = Math.min(100, Math.max(0, stats.percentage || 0));

    return (
        <section className="space-y-4 sm:space-y-5">
            {/* Hero — remaining balance */}
            <div className="card animate-fade-in-up overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <p className="stat-label">Remaining balance</p>
                        <div className="mt-2">
                            <span className="bg-gradient-to-br from-primary to-primary-2 bg-clip-text text-4xl font-bold tracking-tight text-transparent tabular sm:text-6xl">
                                {formatCurrency(stats.remaining)}
                            </span>
                        </div>
                        <div className="mt-4 max-w-md">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-success">{pct.toFixed(1)}% paid off</span>
                                <span className="text-secondary tabular">
                                    {formatCurrency(stats.totalPaid)} / {formatCurrency(stats.totalLoan)}
                                </span>
                            </div>
                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-hi">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="rounded-2xl border border-hairline/10 bg-surface-hi/60 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-success">
                                <TrendingDown size={14} />
                                <span className="stat-label text-success">Principal</span>
                            </div>
                            <p className="mt-1 text-lg font-semibold text-main tabular sm:text-xl">
                                {formatCurrency(stats.totalPrincipal)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-hairline/10 bg-surface-hi/60 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-warning">
                                <Percent size={14} />
                                <span className="stat-label text-warning">Interest</span>
                            </div>
                            <p className="mt-1 text-lg font-semibold text-main tabular sm:text-xl">
                                {formatCurrency(stats.totalInterest)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat cards (draggable / customizable) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={visibleCards} strategy={rectSortingStrategy}>
                        {visibleCards.map(id => (
                            <SortableCard
                                key={id}
                                id={id}
                                title={allCards[id].title}
                                value={allCards[id].value}
                                icon={allCards[id].icon}
                                accent={allCards[id].accent}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Charts */}
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AmortizationChart schedule={schedule} />
                </div>
                <PaymentBreakdownChart stats={stats} />
            </div>
        </section>
    );
}
