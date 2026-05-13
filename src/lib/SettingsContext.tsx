"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type AppSettings, type ProviderInstance, DEFAULT_SETTINGS, getProviderById, getDefaultCredentials, getActiveProvider } from './providers';

interface SettingsContextType {
  settings: AppSettings;
  setActiveProvider: (providerId: string) => void;
  updateProvider: (providerId: string, partial: Partial<ProviderInstance>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'resume-settings';
const OLD_STORAGE_KEY = 'resume-api-config';

function migrateV1(old: { activeProvider?: ProviderInstance }): AppSettings {
  const ap = old.activeProvider;
  if (!ap?.providerId) return DEFAULT_SETTINGS;
  return {
    providers: { [ap.providerId]: ap },
    activeProviderId: ap.providerId,
  };
}

function migrateLegacy(old: { baseUrl?: string; apiKey?: string; model?: string }): AppSettings {
  const baseUrl = old.baseUrl || '';
  let providerId = 'custom';
  if (baseUrl.includes('anthropic')) providerId = 'anthropic';
  else if (baseUrl.includes('deepseek')) providerId = 'deepseek';
  else if (baseUrl.includes('googleapis') || baseUrl.includes('gemini')) providerId = 'gemini';
  else if (baseUrl === 'https://api.openai.com/v1' || baseUrl.includes('openai')) providerId = 'openai';

  const provider = getProviderById(providerId);
  if (!provider) return DEFAULT_SETTINGS;

  const credentials: Record<string, string> = {};
  for (const field of provider.credentials) {
    if (field.key === 'apiKey') credentials.apiKey = old.apiKey || '';
    else if (field.key === 'baseUrl') credentials.baseUrl = baseUrl;
    else credentials[field.key] = field.defaultValue || '';
  }

  return {
    providers: {
      [providerId]: {
        providerId,
        credentials,
        model: old.model || provider.models[0]?.id || '',
      },
    },
    activeProviderId: providerId,
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // New format: has providers map
        if (parsed.providers && parsed.activeProviderId) {
          setSettings(parsed as AppSettings);
          return;
        }
        // V1 format: single activeProvider
        if (parsed.activeProvider?.providerId) {
          const migrated = migrateV1(parsed);
          setSettings(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return;
        }
      } catch { /* fall through */ }
    }

    // Legacy format: flat baseUrl/apiKey/model
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      try {
        const parsed = JSON.parse(old);
        const migrated = migrateLegacy(parsed);
        setSettings(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(OLD_STORAGE_KEY);
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const setActiveProvider = useCallback((providerId: string) => {
    setSettings((prev) => {
      // Ensure the provider entry exists
      const providers = { ...prev.providers };
      if (!providers[providerId]) {
        const config = getProviderById(providerId);
        if (config) {
          providers[providerId] = {
            providerId,
            credentials: getDefaultCredentials(config),
            model: config.models[0]?.id || '',
          };
        }
      }
      const updated: AppSettings = { providers, activeProviderId: providerId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProvider = useCallback((providerId: string, partial: Partial<ProviderInstance>) => {
    setSettings((prev) => {
      const existing = prev.providers[providerId] || { providerId, credentials: {}, model: '' };
      const updated: AppSettings = {
        ...prev,
        providers: {
          ...prev.providers,
          [providerId]: { ...existing, ...partial },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setActiveProvider, updateProvider, isSettingsOpen, setIsSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
