import { Search } from "lucide-react";

export const SearchBar = ({ value, onChange }) => (
  <label className="surface-muted flex items-center gap-3 rounded-2xl border-brand-500/10 bg-[#13253a] px-4 py-3">
    <Search className="h-4 w-4 text-[#f2d5bf]" />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search"
      className="w-full bg-transparent text-sm text-[#f8e9d7] outline-none placeholder:text-[#8c97ad]"
    />
  </label>
);
