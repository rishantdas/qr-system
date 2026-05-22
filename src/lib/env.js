const getEnvValue = (key, fallback = "") => import.meta.env[key] || fallback;

export const env = {
  appName: getEnvValue("VITE_APP_NAME", "Littlebox QR Ordering"),
  appBaseUrl: getEnvValue("VITE_APP_BASE_URL", "http://localhost:5173"),
  supabaseUrl: getEnvValue("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnvValue("VITE_SUPABASE_ANON_KEY"),
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);
