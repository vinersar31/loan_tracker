import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableCard({
  id,
  title,
  value,
  icon: Icon,
  accent = "#6C5DD3",
  subValue,
  subValuePrefix = "",
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card cursor-grab select-none p-4 transition-shadow active:cursor-grabbing ${
        isDragging ? "opacity-70 shadow-glow" : ""
      }`}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}22` }}
      >
        {Icon ? <Icon size={18} style={{ color: accent }} /> : null}
      </span>
      <p className="stat-label mt-3 truncate">{title}</p>
      <p className="mt-0.5 truncate text-lg font-bold text-main tabular">{value}</p>
      {subValue && (
        <p className="mt-1 truncate text-[11px] text-dim tabular">
          {subValuePrefix}
          {subValue}
        </p>
      )}
    </div>
  );
}
