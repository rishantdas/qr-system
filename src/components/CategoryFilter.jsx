import { cn } from "../utils/cn";

export const CategoryFilter = ({
  categories,
  activeCategory,
  onSelect,
}) => (
  <div className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1 sm:gap-3">
    {categories.map((category) => {
      const active = activeCategory === category;

      return (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold tracking-[0.08em] transition sm:px-5",
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
