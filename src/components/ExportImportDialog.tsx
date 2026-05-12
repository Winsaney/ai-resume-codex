"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useHistory } from "@/lib/HistoryContext";
import { HistoryRecord } from "@/lib/db";

export function ExportImportDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { records, importRecords } = useHistory();
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importFile, setImportFile] = useState<HistoryRecord[] | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      appName: 'resume-optimizer-pro',
      records,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.records || !Array.isArray(data.records)) {
          setError(t('importInvalidFile'));
          return;
        }
        setImportFile(data.records);
      } catch {
        setError(t('importInvalidFile'));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile) return;
    await importRecords(importFile, importMode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <h3 className="text-base font-semibold text-brand-dark mb-5">
            {t('exportHistory')} / {t('importHistory')}
          </h3>

          {/* Export Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-brand-light/50 border border-brand-light-gray/40">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-brand-dark/50" />
                <span className="text-sm text-brand-dark/70">
                  {t('recordCount').replace('{count}', String(records.length))}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={handleExport} className="text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {t('exportHistory')}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-light-gray/40 my-5" />

          {/* Import Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-brand-dark/50" />
              <span className="text-sm font-medium text-brand-dark/70">{t('importHistory')}</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!importFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-brand-light-gray hover:border-brand-orange/40 hover:bg-brand-orange/[0.02] transition-all cursor-pointer"
              >
                <FileJson className="w-8 h-8 text-brand-dark/20 mb-2" />
                <span className="text-xs text-brand-dark/50">{t('importFile')}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-green/5 border border-brand-green/20">
                  <span className="text-xs text-brand-green">
                    {t('recordCount').replace('{count}', String(importFile.length))}
                  </span>
                  <button
                    onClick={() => { setImportFile(null); setError(''); }}
                    className="text-xs text-brand-dark/40 hover:text-brand-dark"
                  >
                    ×
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setImportMode('merge')}
                    className={`flex-1 p-3 rounded-lg border text-xs text-center transition-all ${
                      importMode === 'merge'
                        ? 'border-brand-orange/40 bg-brand-orange/5 text-brand-orange'
                        : 'border-brand-light-gray text-brand-dark/50 hover:border-brand-light-gray/80'
                    }`}
                  >
                    <div className="font-medium mb-0.5">{t('importMerge')}</div>
                    <div className="text-[10px] text-brand-dark/40">{t('importMergeDesc')}</div>
                  </button>
                  <button
                    onClick={() => setImportMode('replace')}
                    className={`flex-1 p-3 rounded-lg border text-xs text-center transition-all ${
                      importMode === 'replace'
                        ? 'border-brand-orange/40 bg-brand-orange/5 text-brand-orange'
                        : 'border-brand-light-gray text-brand-dark/50 hover:border-brand-light-gray/80'
                    }`}
                  >
                    <div className="font-medium mb-0.5">{t('importReplace')}</div>
                    <div className="text-[10px] text-brand-dark/40">{t('importReplaceDesc')}</div>
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                <Button size="sm" onClick={handleImport} className="w-full text-xs bg-brand-dark hover:bg-brand-dark/90 text-white">
                  {t('importHistory')}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-5">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-brand-dark/50">
              {t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
