/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_BASE_PATH?: string;
  /** Optional Supabase project URL, e.g. https://abcd.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Never a service-role key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
