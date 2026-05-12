"use client";

import Link from "next/link";
import { Clock, Trash2, ChevronRight } from "lucide-react";
import { HistoryRecord } from "@/lib/db";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatDate(ts: number, language: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecordCard({
  record,
  onDelete,
}: {
  record: HistoryRecord;
  onDelete: (id: string) => void;
}) {
  const { language, t } = useLanguage();

  return (
    <div className="group relative bg-white rounded-xl border border-brand-light-gray/60 hover:border-brand-orange/30 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <Link href={`/history/${record.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-brand-dark truncate">
                {record.label || t('untitled')}
              </span>
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-light-gray/60 text-brand-dark/50">
                {record.language === 'zh' ? '中' : 'EN'}
              </span>
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0eee4] text-brand-dark/50">
                {record.model}
              </span>
            </div>
            <p className="text-xs text-brand-dark/40 font-serif line-clamp-2 leading-relaxed">
              {record.jdPreview || '—'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-brand-dark/30">
              <Clock className="w-3 h-3" />
              {formatDate(record.createdAt, language)}
            </div>
            <ChevronRight className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-orange transition-colors" />
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(record.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-brand-dark/20 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        title={t('deleteRecord')}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
