"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Clock,
  Briefcase,
  FileText,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useHistory } from "@/lib/HistoryContext";
import { HistoryRecord, getRecord } from "@/lib/db";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { deleteRecord, setRestoreRecord } = useHistory();

  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [collapsed, setCollapsed] = useState({ resume: true, jd: true, result: false });

  useEffect(() => {
    const id = params.id as string;
    getRecord(id).then((r) => {
      if (r) {
        setRecord(r);
        setEditLabel(r.label);
      } else {
        router.replace('/history');
      }
    });
  }, [params.id, router]);

  if (!record) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-dark/20 animate-spin" />
      </div>
    );
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const handleRestore = () => {
    setRestoreRecord(record);
    router.push('/dashboard');
  };

  const toggleSection = (key: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col text-brand-dark font-sans selection:bg-brand-orange/20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-brand-light-gray bg-brand-light/95 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('history')}</span>
          </Link>

          <div className="flex items-center gap-2">
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="text-sm font-medium px-2 py-0.5 border border-brand-orange/40 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditing(false);
                      // Update handled by context or inline
                    }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
                <button onClick={() => setEditing(false)} className="text-brand-green">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium tracking-tight">
                  {record.label || t('untitled')}
                </span>
                <button
                  onClick={() => { setEditing(true); setEditLabel(record.label); }}
                  className="text-brand-dark/30 hover:text-brand-orange transition-colors"
                  title={t('editLabel')}
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/30">
          <Clock className="w-3 h-3" />
          {formatDate(record.createdAt)}
          <span className="mx-1">·</span>
          <span className="px-1.5 py-0.5 rounded bg-brand-light-gray/60">{record.model}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {/* Resume Section */}
          <div className="bg-white rounded-xl border border-brand-light-gray/60 overflow-hidden">
            <button
              onClick={() => toggleSection('resume')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-light/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-orange" />
                <span className="text-sm font-medium">{t('resumeSection')}</span>
              </div>
              {collapsed.resume ? <ChevronDown className="w-4 h-4 text-brand-dark/30" /> : <ChevronUp className="w-4 h-4 text-brand-dark/30" />}
            </button>
            {!collapsed.resume && (
              <div className="px-5 pb-5 text-sm text-brand-dark/70 font-serif leading-relaxed whitespace-pre-wrap border-t border-brand-light-gray/40 pt-4">
                {record.resumeText}
              </div>
            )}
          </div>

          {/* JD Section */}
          <div className="bg-white rounded-xl border border-brand-light-gray/60 overflow-hidden">
            <button
              onClick={() => toggleSection('jd')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-light/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-blue" />
                <span className="text-sm font-medium">{t('jdSection')}</span>
              </div>
              {collapsed.jd ? <ChevronDown className="w-4 h-4 text-brand-dark/30" /> : <ChevronUp className="w-4 h-4 text-brand-dark/30" />}
            </button>
            {!collapsed.jd && (
              <div className="px-5 pb-5 text-sm text-brand-dark/70 font-serif leading-relaxed whitespace-pre-wrap border-t border-brand-light-gray/40 pt-4">
                {record.jdText}
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl border border-brand-light-gray/60 overflow-hidden">
            <button
              onClick={() => toggleSection('result')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-light/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-4 h-4 rounded bg-brand-dark text-brand-light">
                  <span className="font-serif italic font-bold text-[8px]">R</span>
                </div>
                <span className="text-sm font-medium">{t('resultSection')}</span>
              </div>
              {collapsed.result ? <ChevronDown className="w-4 h-4 text-brand-dark/30" /> : <ChevronUp className="w-4 h-4 text-brand-dark/30" />}
            </button>
            {!collapsed.result && (
              <div className="px-5 pb-5 border-t border-brand-light-gray/40 pt-4">
                <div className="markdown-content">
                  <ReactMarkdown>{record.result}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-brand-light-gray/40">
          <Button
            onClick={handleRestore}
            className="h-10 px-6 text-sm font-medium rounded-full bg-brand-dark text-white hover:bg-[#2a2a29] shadow-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('restoreToDashboard')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDelete(true)}
            className="h-10 px-6 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deleteRecord')}
          </Button>
        </div>
      </main>

      {showDelete && (
        <DeleteConfirmDialog
          title={t('deleteConfirm')}
          description={t('deleteConfirmDesc')}
          onConfirm={async () => {
            await deleteRecord(record.id);
            router.replace('/history');
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
