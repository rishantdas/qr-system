import { cn } from "../utils/cn";

export const CategoryFilter = ({
  categories,
  activeCategory,
  onSelect,
}) => (
  <div className="scrollbar-hidden flex gap-3 overflow-x-auto pb-1">
    {categories.map((category) => {
      const active = activeCategory === category;

      return (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[0.08em] transition",
            active
              ? "border-[#ffb76b] bg-[#ffb76b] text-[#08111f]"
              : "border-[#33445b] bg-[#2b3549] text-[#d4d9e8] hover:bg-[#364259]",
          )}
        >
          {category}
        </button>
      );
    })}
  </div>
);
