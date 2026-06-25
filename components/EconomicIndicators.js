'use client';
import { useState, useEffect, useCallback } from 'react';
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
import { Euro, Percent, TrendingUp } from 'lucide-react';
import { getAllIndicators } from '@/utils/bnrData';
import { db } from '@/utils/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { SortableCard } from './SortableCard';

export default function EconomicIndicators() {
    const { prefs, mounted, updatePreference, isHidden } = useUserPreferences();
    const [indicators, setIndicators] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);
    const [indicatorOrder, setIndicatorOrder] = useState([
        'eurRate', 'robor3m', 'robor6m', 'ircc'
    ]);

    // Track when prefs actually change the visibility logic
    useEffect(() => {
        setVersion(v => v + 1);
    }, [prefs.hiddenIndicators, mounted]);

    // Initialize order from preferences once mounted
    useEffect(() => {
        let isSubscribed = true;
        if (mounted && prefs.indicatorOrder && isSubscribed) {
            setIndicatorOrder(prefs.indicatorOrder);
        }
        return () => isSubscribed = false;
    }, [mounted, prefs.indicatorOrder]);

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

    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                // First try to get from Firestore
                const indicatorsRef = collection(db, 'indicators');
                const q = query(indicatorsRef, orderBy('date', 'desc'), limit(1));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setIndicators(querySnapshot.docs[0].data());
                } else {
                    // Fallback to fetching directly if no cache in DB
                    const data = await getAllIndicators(db);
                    setIndicators(data);
                }
            } catch (err) {
                console.error("Error fetching indicators:", err);
                setError("Failed to load economic data");
            } finally {
                setLoading(false);
            }
        };

        fetchIndicators();
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setIndicatorOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save to preferences
                updatePreference('indicatorOrder', newOrder);
                return newOrder;
            });
        }
    }, [updatePreference]);

    if (loading) return null;
    if (error || !indicators) return null; // Silently fail to not disrupt dashboard

    const allCards = {
        eurRate: {
            title: "EUR / RON (BNR)",
            value: indicators.eur_rate ? `${indicators.eur_rate.toFixed(4)} RON` : 'N/A',
            subValue: indicators.eur_date,
            icon: Euro,
            accent: '#00E096'
        },
        robor3m: {
            title: "ROBOR 3M",
            value: indicators.robor_3m ? `${indicators.robor_3m.toFixed(2)}%` : 'N/A',
            subValue: indicators.robor_date,
            icon: Percent,
            accent: '#FFA600'
        },
        robor6m: {
            title: "ROBOR 6M",
            value: indicators.robor_6m ? `${indicators.robor_6m.toFixed(2)}%` : 'N/A',
            subValue: indicators.robor_date,
            icon: Percent,
            accent: '#FF754C'
        },
        ircc: {
            title: "IRCC",
            value: indicators.ircc ? `${indicators.ircc.toFixed(2)}%` : 'N/A',
            subValue: indicators.ircc_date,
            icon: TrendingUp,
            accent: '#8B7CE8'
        }
    };

    // Filter to only show cards that exist and are not hidden
    const visibleCards = indicatorOrder.filter(id => allCards[id] && (!mounted || !isHidden(id, 'indicator')));

    // If no indicators are visible, don't render the section
    if (visibleCards.length === 0) return null;

    return (
        <section className="space-y-3">
            <h2 className="stat-label">Economic indicators</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={visibleCards}
                        strategy={rectSortingStrategy}
                    >
                        {visibleCards.map(id => (
                            <SortableCard
                                key={id}
                                id={id}
                                title={allCards[id].title}
                                value={allCards[id].value}
                                subValue={allCards[id].subValue}
                                subValuePrefix="from "
                                icon={allCards[id].icon}
                                accent={allCards[id].accent}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </section>
    );
}
