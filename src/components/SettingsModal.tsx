"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, Settings, Wifi, Loader2, CheckCircle2, XCircle } from "lucide-react";

type TestStatus = 'idle' | 'testing' | 'success' | 'error';


export function SettingsModal() {
  const { config, updateConfig, isSettingsOpen, setIsSettingsOpen } = useSettings();
  const { t } = useLanguage();
  
  // Local state for the form so we don't save on every keystroke
  const [localConfig, setLocalConfig] = useState(config);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [resolvedEndpoint, setResolvedEndpoint] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync local state when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setLocalConfig(config);
      setTestStatus('idle');
      setErrorMsg("");
      setResolvedEndpoint("");
    }
  }, [isSettingsOpen, config]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updateConfig(localConfig);
    setIsSettingsOpen(false);
  };

  const handleTest = async () => {
    if (!localConfig.apiKey) {
      setTestStatus('error');
      setErrorMsg("API Key missing");
      return;
    }

    setTestStatus('testing');
    setErrorMsg("");

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setResolvedEndpoint(data.endpoint || '');
      } else {
        setTestStatus('error');
        setErrorMsg(data.error || "Connection failed");
      }
    } catch (e: any) {
      setTestStatus('error');
      setErrorMsg(e.message || "Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
      <div className="relative w-full max-w-md p-6 md:p-8 bg-brand-light rounded-2xl refined-shadow refined-border mx-4">
        <button 
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-4 right-4 p-2 text-brand-mid-gray hover:text-brand-dark transition-colors rounded-full hover:bg-brand-light-gray/50"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-brand-orange" />
          <h2 className="text-xl font-semibold tracking-tight text-brand-dark">{t('configApi')}</h2>
        </div>
        
        <p className="text-sm font-serif text-brand-dark/60 mb-6 leading-relaxed">
          {t('configApiDesc')}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">{t('baseUrl')}</label>
            <input 
              type="text"
              value={localConfig.baseUrl}
              onChange={(e) => {
                setLocalConfig({...localConfig, baseUrl: e.target.value});
                setTestStatus('idle');
              }}
              className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-sans text-sm"
              placeholder="https://api.openai.com/v1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">{t('apiKey')}</label>
            <input 
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => {
                setLocalConfig({...localConfig, apiKey: e.target.value});
                setTestStatus('idle');
              }}
              className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-mono text-sm"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">{t('model')}</label>
            <input 
              type="text"
              value={localConfig.model}
              onChange={(e) => {
                setLocalConfig({...localConfig, model: e.target.value});
                setTestStatus('idle');
              }}
              className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-sans text-sm"
              placeholder="gpt-3.5-turbo"
            />
          </div>
        </div>

        {/* Error message slot */}
        {testStatus === 'error' && errorMsg && (
          <div className="mt-4 text-xs text-brand-orange font-medium flex items-start gap-1">
            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {testStatus === 'success' && resolvedEndpoint && (
          <div className="mt-4 text-xs text-brand-green font-mono bg-brand-green/5 border border-brand-green/20 rounded px-2 py-1 truncate">
            ✓ {resolvedEndpoint}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          {/* Left section: Test connection button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTest}
            disabled={testStatus === 'testing' || !localConfig.apiKey}
            className="text-xs h-9 border-brand-light-gray bg-white hover:bg-brand-light-gray/30 text-brand-dark/80 transition-colors"
          >
            {testStatus === 'idle' && <><Wifi className="w-3.5 h-3.5 mr-1.5" />{t('testConnection')}</>}
            {testStatus === 'testing' && <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{t('testing')}</>}
            {testStatus === 'success' && <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-brand-green" />{t('testSuccess')}</>}
            {testStatus === 'error' && <><XCircle className="w-3.5 h-3.5 mr-1.5 text-brand-orange" />{t('testFailed')}</>}
          </Button>

          {/* Right section: Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} className="text-brand-dark/70 hover:text-brand-dark">
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-brand-orange hover:bg-[#c2664b] text-white">
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsButton() {
  const { setIsSettingsOpen } = useSettings();
  const { t } = useLanguage();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setIsSettingsOpen(true)}
      className="text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50 font-sans px-2 flex items-center gap-1.5 h-8"
      title={t('settings')}
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
}
