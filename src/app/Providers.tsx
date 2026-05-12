"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { HistoryProvider } from "@/lib/HistoryContext";
import { SettingsModal } from "@/components/SettingsModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <HistoryProvider>
          {children}
          <SettingsModal />
        </HistoryProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
