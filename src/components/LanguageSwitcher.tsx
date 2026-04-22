"use client";

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50 font-sans px-2 flex items-center gap-1.5 h-8"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{language === 'en' ? 'EN' : '中'}</span>
    </Button>
  );
}
