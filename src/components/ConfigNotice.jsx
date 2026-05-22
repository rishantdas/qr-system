import { isSupabaseConfigured } from "../lib/env";

export const ConfigNotice = () => {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        Supabase environment variables are missing. Add
        {" "}
        <code>VITE_SUPABASE_URL</code>
        {" "}
        and
        {" "}
        <code>VITE_SUPABASE_ANON_KEY</code>
        {" "}
        to run the app successfully.
      </div>
    </div>
  );
};
