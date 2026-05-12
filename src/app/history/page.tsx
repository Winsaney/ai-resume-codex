"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Clock, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useHistory } from "@/lib/HistoryContext";
import { RecordCard } from "@/components/RecordCard";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { ExportImportDialog } from "@/components/ExportImportDialog";

export default function HistoryPage() {
  const { t } = useLanguage();
  const { records, deleteRecord, deleteAllRecords } = useHistory();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  const filtered = search.trim()
    ? records.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.label.toLowerCase().includes(q) ||
          r.jdPreview.toLowerCase().includes(q) ||
          r.resumePreview.toLowerCase().includes(q)
        );
      })
    : records;

  return (
    <div className="min-h-screen bg-brand-light flex flex-col text-brand-dark font-sans selection:bg-brand-orange/20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-brand-light-gray bg-brand-light/95 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-brand-light">
              <span className="font-serif italic font-bold text-xs">R</span>
            </div>
            <span className="text-sm font-medium tracking-tight">{t('historyTitle')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportImport(true)}
            className="text-xs text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {t('exportHistory')}
          </Button>
          {records.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteAll(true)}
              className="text-xs text-brand-dark/70 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t('deleteAllHistory')}
            </Button>
          )}
        </div>
      </header>

      {/* Search */}
      {records.length > 0 && (
        <div className="px-6 pt-5 max-w-[1400px] w-full mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchHistory')}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-brand-light-gray/60 bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all placeholder:text-brand-dark/30"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 px-6 py-5 max-w-[1400px] w-full mx-auto">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0eee4] flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-brand-dark/20" />
            </div>
            <p className="text-sm font-medium text-brand-dark/40 mb-1">{t('historyEmpty')}</p>
            <p className="text-xs font-serif text-brand-dark/30 max-w-[260px]">{t('historyEmptyDesc')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-sm font-serif text-brand-dark/40">{t('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete single record */}
      {deleteTarget && (
        <DeleteConfirmDialog
          title={t('deleteConfirm')}
          description={t('deleteConfirmDesc')}
          onConfirm={async () => {
            await deleteRecord(deleteTarget);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Delete all */}
      {showDeleteAll && (
        <DeleteConfirmDialog
          title={t('deleteAllConfirm')}
          description={t('deleteAllConfirmDesc')}
          onConfirm={async () => {
            await deleteAllRecords();
            setShowDeleteAll(false);
          }}
          onCancel={() => setShowDeleteAll(false)}
        />
      )}

      {/* Export/Import */}
      {showExportImport && (
        <ExportImportDialog onClose={() => setShowExportImport(false)} />
      )}
    </div>
  );
}
