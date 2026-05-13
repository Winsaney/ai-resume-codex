"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, Settings, Wifi, Loader2, CheckCircle2, XCircle, Sparkles, Brain, Gem, Waves, Zap, Server, ExternalLink } from "lucide-react";
import { PROVIDERS, getProviderById, getDefaultCredentials, getOrCreateProvider, type ProviderInstance } from "@/lib/providers";

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Brain,
  Gem,
  Waves,
  Zap,
  Server,
};

const CUSTOM_MODEL_VALUE = '__custom__';

export function SettingsModal() {
  const { settings, setActiveProvider, updateProvider, isSettingsOpen, setIsSettingsOpen } = useSettings();
  const { t } = useLanguage();

  // Local editing state — which provider is being viewed/edited
  const [editingId, setEditingId] = useState(settings.activeProviderId);
  const [localInstance, setLocalInstance] = useState<ProviderInstance>(() => getOrCreateProvider(settings, settings.activeProviderId));
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [resolvedEndpoint, setResolvedEndpoint] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);

  const selectedConfig = getProviderById(editingId);

  // Sync on open
  useEffect(() => {
    if (isSettingsOpen) {
      const id = settings.activeProviderId;
      const instance = getOrCreateProvider(settings, id);
      setEditingId(id);
      setLocalInstance(instance);
      setTestStatus('idle');
      setErrorMsg("");
      setResolvedEndpoint("");
      const config = getProviderById(id);
      setIsCustomModel(!!config && !config.models.some(m => m.id === instance.model) && instance.model !== '');
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleSelectProvider = (providerId: string) => {
    const instance = getOrCreateProvider(settings, providerId);
    setEditingId(providerId);
    setLocalInstance(instance);
    setTestStatus('idle');
    setErrorMsg("");
    setResolvedEndpoint("");
    const config = getProviderById(providerId);
    setIsCustomModel(!!config && !config.models.some(m => m.id === instance.model) && instance.model !== '');
  };

  const handleToggleActive = () => {
    setActiveProvider(editingId);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setLocalInstance(prev => ({
      ...prev,
      credentials: { ...prev.credentials, [key]: value },
    }));
    setTestStatus('idle');
  };

  const handleModelChange = (value: string) => {
    if (value === CUSTOM_MODEL_VALUE) {
      setIsCustomModel(true);
      setLocalInstance(prev => ({ ...prev, model: '' }));
    } else {
      setIsCustomModel(false);
      setLocalInstance(prev => ({ ...prev, model: value }));
    }
    setTestStatus('idle');
  };

  const handleCustomModelInput = (value: string) => {
    setLocalInstance(prev => ({ ...prev, model: value }));
    setTestStatus('idle');
  };

  const handleSave = () => {
    updateProvider(editingId, localInstance);
    setIsSettingsOpen(false);
  };

  const handleTest = async () => {
    if (!localInstance.credentials.apiKey) {
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
        body: JSON.stringify({
          providerId: editingId,
          apiKey: localInstance.credentials.apiKey,
          baseUrl: localInstance.credentials.baseUrl || '',
          model: localInstance.model,
        }),
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

  const isActive = settings.activeProviderId === editingId;
  const hasModels = selectedConfig && selectedConfig.models.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
      <div className="relative w-full max-w-2xl bg-brand-light rounded-2xl refined-shadow refined-border mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-brand-light-gray shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-orange" />
            <h2 className="text-lg font-semibold tracking-tight text-brand-dark">{t('configApi')}</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-brand-mid-gray hover:text-brand-dark transition-colors rounded-full hover:bg-brand-light-gray/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: two-column layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Provider list */}
          <div className="w-44 shrink-0 border-r border-brand-light-gray bg-brand-light-gray/20 flex flex-col">
            <div className="px-3 pt-3 pb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-brand-dark/40">{t('provider')}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
              {PROVIDERS.map((p) => {
                const Icon = ICON_MAP[p.icon];
                const isSelected = editingId === p.id;
                const isActiveProvider = settings.activeProviderId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProvider(p.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-brand-dark text-brand-light'
                        : isActiveProvider
                          ? 'bg-brand-orange/10 text-brand-dark hover:bg-brand-orange/15'
                          : 'text-brand-dark/70 hover:bg-brand-light-gray/60 hover:text-brand-dark'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{p.name}</span>
                    {isActiveProvider && !isSelected && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Config detail panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-brand-light-gray shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-brand-dark truncate">
                  {selectedConfig?.name || editingId}
                </span>
                {selectedConfig?.platformUrl && (
                  <a
                    href={selectedConfig.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-dark/30 hover:text-brand-orange transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedConfig && (
                  <span className="text-xs text-brand-dark/40 font-serif truncate">
                    {t(selectedConfig.description as Parameters<typeof t>[0])}
                  </span>
                )}
              </div>
              <button
                onClick={handleToggleActive}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                  isActive ? 'bg-brand-orange' : 'bg-brand-light-gray'
                }`}
                title={isActive ? 'Active' : 'Click to activate'}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* Form area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Dynamic credential fields */}
              {selectedConfig?.credentials.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-brand-dark mb-1.5">{t(field.label as Parameters<typeof t>[0])}</label>
                  <input
                    type={field.type}
                    value={localInstance.credentials[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-mono text-sm"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              {/* Model selector */}
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1.5">{t('model')}</label>
                {hasModels ? (
                  <div className="space-y-2">
                    <select
                      value={isCustomModel ? CUSTOM_MODEL_VALUE : localInstance.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-sans text-sm appearance-none cursor-pointer"
                    >
                      {selectedConfig.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                      {selectedConfig.supportsCustomModel && (
                        <option value={CUSTOM_MODEL_VALUE}>{t('customModel')}...</option>
                      )}
                    </select>
                    {isCustomModel && (
                      <input
                        type="text"
                        value={localInstance.model}
                        onChange={(e) => handleCustomModelInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-sans text-sm"
                        placeholder={t('customModelPlaceholder')}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={localInstance.model}
                    onChange={(e) => handleCustomModelInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white refined-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all font-sans text-sm"
                    placeholder={t('customModelPlaceholder')}
                  />
                )}
              </div>
            </div>

            {/* Error/success messages */}
            {testStatus === 'error' && errorMsg && (
              <div className="px-5 text-xs text-brand-orange font-medium flex items-start gap-1">
                <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {testStatus === 'success' && resolvedEndpoint && (
              <div className="px-5 text-xs text-brand-green font-mono bg-brand-green/5 border border-brand-green/20 rounded px-2 py-1 mx-5 truncate">
                ✓ {resolvedEndpoint}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-brand-light-gray shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testStatus === 'testing' || !localInstance.credentials.apiKey}
                className="text-xs h-9 border-brand-light-gray bg-white hover:bg-brand-light-gray/30 text-brand-dark/80 transition-colors"
              >
                {testStatus === 'idle' && <><Wifi className="w-3.5 h-3.5 mr-1.5" />{t('testConnection')}</>}
                {testStatus === 'testing' && <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{t('testing')}</>}
                {testStatus === 'success' && <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-brand-green" />{t('testSuccess')}</>}
                {testStatus === 'error' && <><XCircle className="w-3.5 h-3.5 mr-1.5 text-brand-orange" />{t('testFailed')}</>}
              </Button>

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
