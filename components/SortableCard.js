import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableCard({ id, title, value, subValue, subValuePrefix = "" }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="stat-card"
        >
            <h3>{title}</h3>
            <p>{value}</p>
            {subValue && (
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {subValuePrefix}{subValue}
                </div>
            )}
        </div>
    );
}
