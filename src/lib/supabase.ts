import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseRuntimeConfig = {
  url: string | null;
  key: string | null;
  configured: boolean;
};

let configPromise: Promise<SupabaseRuntimeConfig> | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;

async function loadRuntimeConfig(): Promise<SupabaseRuntimeConfig> {
  if (configPromise) return configPromise;

  configPromise = fetch('/api/auth/config', {
    method: 'GET',
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Unable to load Supabase runtime configuration.');
      }

      return (await response.json()) as SupabaseRuntimeConfig;
    })
    .catch(() => ({
      url: null,
      key: null,
      configured: false,
    }));

  return configPromise;
}

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (clientPromise) return clientPromise;

  clientPromise = loadRuntimeConfig().then((config) => {
    if (!config.configured || !config.url || !config.key) {
      return null;
    }

    return createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  });

  return clientPromise;
}

export async function isSupabaseConfigured(): Promise<boolean> {
  const config = await loadRuntimeConfig();
  return config.configured;
}