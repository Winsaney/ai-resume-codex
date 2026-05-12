"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
              <p className="text-xs text-brand-dark/50 mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-xs text-brand-dark/60"
            >
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              className="text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              {t('deleteRecord')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
