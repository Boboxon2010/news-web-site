'use client';

import { useState, useEffect } from 'react';
import { getDefaultSiteSettings, getSiteSettings, SiteSettings } from '@/lib/dataStore';

const SETTINGS_CACHE_MS = 10000;
let cachedSettings: SiteSettings | null = null;
let cachedAt = 0;
let settingsRequest: Promise<SiteSettings> | null = null;

async function loadSiteSettings(refresh = false): Promise<SiteSettings> {
  if (!refresh && cachedSettings && Date.now() - cachedAt < SETTINGS_CACHE_MS) return cachedSettings;
  if (settingsRequest) return settingsRequest;

  settingsRequest = (async () => {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      if (response.ok) return await response.json() as SiteSettings;
    } catch {}
    return getSiteSettings();
  })();

  try {
    cachedSettings = await settingsRequest;
    cachedAt = Date.now();
    return cachedSettings;
  } finally {
    settingsRequest = null;
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(getDefaultSiteSettings);

  useEffect(() => {
    const updateSettings = async (refresh = false) => {
      if (refresh) setSettings(getSiteSettings());
      setSettings(await loadSiteSettings(refresh));
    };

    setSettings(getSiteSettings());
    void updateSettings();
    const refreshSettings = () => { void updateSettings(true); };

    window.addEventListener('datastore-update', refreshSettings);
    window.addEventListener('storage', refreshSettings);

    return () => {
      window.removeEventListener('datastore-update', refreshSettings);
      window.removeEventListener('storage', refreshSettings);
    };
  }, []);

  return settings;
}
