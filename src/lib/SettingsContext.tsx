"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface SettingsContextType {
  config: ApiConfig;
  updateConfig: (config: Partial<ApiConfig>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('resume-api-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse API config', e);
      }
    }
  }, []);

  const updateConfig = (newVals: Partial<ApiConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newVals };
      localStorage.setItem('resume-api-config', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ config, updateConfig, isSettingsOpen, setIsSettingsOpen }}>
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
