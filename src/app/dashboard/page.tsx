"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useCompletion } from "@ai-sdk/react";
import {
  ArrowLeft,
  FileText,
  Briefcase,
  Wand2,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  StopCircle,
  Upload,
  FileUp,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSettings } from "@/lib/SettingsContext";
import { getActiveProvider } from "@/lib/providers";
import { useHistory } from "@/lib/HistoryContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HistoryButton } from "@/components/HistoryButton";
import { SettingsButton } from "@/components/SettingsModal";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { settings, setIsSettingsOpen } = useSettings();
  const activeProvider = getActiveProvider(settings);
  const { addRecord, restoreRecord, clearRestoreRecord } = useHistory();

  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [copied, setCopied] = useState(false);
  const prevLoadingRef = useRef(true);
  const resumeRef = useRef(resume);
  const jdRef = useRef(jd);
  resumeRef.current = resume;
  jdRef.current = jd;

  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isModalDragOver, setIsModalDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: '/api/optimize',
    streamProtocol: 'text',
    onError: (err) => {
      // If unauthorized, probably missing API key
      if (err.message.includes("API Key is missing") || err.message.includes("401")) {
        alert(language === 'en' ? "Missing or invalid API Key. Please configure it in Settings." : "API 密钥缺失或无效，请在设置中配置。");
        setIsSettingsOpen(true);
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  });

  // Auto-save on completion
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && completion?.trim()) {
      const currentResume = resumeRef.current;
      const currentJd = jdRef.current;
      addRecord({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        label: '',
        resumeText: currentResume,
        resumePreview: currentResume.slice(0, 200),
        jdText: currentJd,
        jdPreview: currentJd.slice(0, 200),
        result: completion,
        model: activeProvider.model,
        language,
      });
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, completion]);

  // Restore from history
  useEffect(() => {
    if (restoreRecord) {
      setResume(restoreRecord.resumeText);
      setJd(restoreRecord.jdText);
      setCompletion(restoreRecord.result);
      clearRestoreRecord();
    }
  }, [restoreRecord]);

  const handleOptimize = async () => {
    if (!resume.trim() || !jd.trim()) return;
    
    if (!activeProvider.credentials.apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    await complete('', {
      body: {
        resume,
        jd,
        ...activeProvider.credentials,
        model: activeProvider.model,
        providerId: activeProvider.providerId,
        language,
      }
    });
  };

  const handleReset = () => {
    setResume("");
    setJd("");
    setCompletion("");
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePdfUpload = async (file: File) => {
    const validExts = ['pdf', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExts.includes(ext)) {
      setParseError(t('pdfUnsupported'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError(t('pdfTooLarge'));
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language === 'zh' ? 'ch' : 'en');
      formData.append('enableTable', 'true');
      formData.append('isOcr', 'false');

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('parseError'));
      }

      setResume(data.markdown);
    } catch (err: any) {
      setParseError(err.message || t('parseError'));
    } finally {
      setIsParsing(false);
    }
  };

  const canOptimize = resume.trim().length > 0 && jd.trim().length > 0;
  const showResult = completion || isLoading;

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col text-brand-dark font-sans selection:bg-brand-orange/20">
      
      {/* Header - Editorial Clean */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-brand-light-gray bg-brand-light/95 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-brand-light">
              <span className="font-serif italic font-bold text-xs">R</span>
            </div>
            <span className="text-sm font-medium tracking-tight">{t('workspace')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistoryButton />
          <SettingsButton />
          <LanguageSwitcher />
          {completion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-xs text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-brand-green" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {t('copyResult')}
                </>
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset} 
            className="text-xs text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t('reset')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 md:p-8 lg:p-12 gap-8 max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* Title area */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">{t('analysisConfig')}</h1>
          <p className="text-brand-dark/60 font-serif text-sm mt-1">{t('analysisDesc')}</p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Input */}
          <div className="flex flex-col gap-3 relative">
            <div className="flex items-center justify-between border-b border-brand-light-gray pb-2">
              <div className="flex items-center gap-2 text-brand-dark/80">
                <FileText className="w-4 h-4 text-brand-orange" />
                <label htmlFor="resume-input" className="text-sm font-medium uppercase tracking-wider text-xs">
                  {t('currentDraft')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  disabled={isParsing}
                  className="flex items-center gap-1 text-xs text-brand-dark/40 hover:text-brand-orange transition-colors disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('uploadPdf')}</span>
                </button>
                <span className="text-xs text-brand-dark/40 font-mono">
                  {resume.length > 0 && `${resume.length} ${t('chars')}`}
                </span>
              </div>
            </div>
            <Textarea
              id="resume-input"
              placeholder={t('resumePlaceholder')}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="resume-textarea mt-2 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
            />

            {/* Parsing progress overlay */}
            {isParsing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                  <span className="text-sm text-brand-dark/70 font-serif">{t('parsingPdf')}</span>
                  <div className="w-32 h-1.5 bg-brand-light-gray rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-brand-orange rounded-full animate-indeterminate" />
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {parseError && (
              <div className="flex items-center gap-2 text-xs text-brand-orange bg-brand-orange/5 border border-brand-orange/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1">{parseError}</span>
                <button onClick={() => setParseError(null)} className="text-brand-dark/40 hover:text-brand-dark">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* JD Input */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-brand-light-gray pb-2">
              <div className="flex items-center gap-2 text-brand-dark/80">
                <Briefcase className="w-4 h-4 text-brand-blue" />
                <label htmlFor="jd-input" className="text-sm font-medium uppercase tracking-wider text-xs">
                  {t('jd')}
                </label>
              </div>
              <span className="text-xs text-brand-dark/40 font-mono">
                {jd.length > 0 && `${jd.length} ${t('chars')}`}
              </span>
            </div>
            <Textarea
              id="jd-input"
              placeholder={t('jdPlaceholder')}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="jd-textarea mt-2 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Optimize Button */}
        <div className="flex justify-center py-4">
          {isLoading ? (
            <Button
              size="lg"
              onClick={() => stop()}
              className="h-12 px-10 text-sm font-medium rounded-full bg-[#cc5454] text-white hover:bg-[#b54545] transition-all duration-300 shadow-sm hover:shadow"
            >
              <StopCircle className="w-4 h-4 mr-2.5 animate-pulse" />
              Stop Generation
            </Button>
          ) : (
            <Button
              size="lg"
              disabled={!canOptimize}
              onClick={handleOptimize}
              className="h-12 px-10 text-sm font-medium rounded-full bg-brand-dark text-white hover:bg-[#2a2a29] transition-all duration-300 disabled:opacity-40 disabled:hover:bg-brand-dark shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Wand2 className="w-4 h-4 mr-2.5 text-brand-orange" />
              {t('generateAnalysis')}
            </Button>
          )}
        </div>

        {/* Results Section */}
        {showResult && (
          <div className="animate-fade-in-up mt-8">
            <div className="mx-auto max-w-4xl bg-white refined-border refined-shadow rounded-2xl p-8 md:p-12 min-h-[300px]">
              
              {/* Claude Branding Logo in corner */}
              <div className="flex items-center gap-3 mb-8 border-b border-brand-light-gray pb-4">
                <div className="w-8 h-8 rounded bg-[#f0eee4] flex items-center justify-center">
                  <span className="font-serif italic font-bold text-brand-orange text-sm">R</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-brand-dark">{t('analysisReport')}</h2>
                  <p className="text-xs text-brand-mid-gray font-serif">{t('generatedBy')}</p>
                </div>
              </div>

              <div className="markdown-content">
                <ReactMarkdown>{completion}</ReactMarkdown>
              </div>
              
              {isLoading && !completion && (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="h-3.5 w-3/4 rounded-sm bg-[#f0eee4] animate-shimmer" />
                  <div className="h-3.5 w-1/2 rounded-sm bg-[#f0eee4] animate-shimmer delay-100" />
                  <div className="h-3.5 w-5/6 rounded-sm bg-[#f0eee4] animate-shimmer delay-200" />
                </div>
              )}
              
              {/* Blinking cursor during streaming */}
              {isLoading && completion && (
                <span className="inline-block w-1.5 h-4 bg-brand-orange animate-pulse align-middle ml-1 rounded-sm" />
              )}
              
              {/* API Configuration Hint */}
              {!activeProvider.credentials.apiKey && !isLoading && !completion && (
                 <div className="text-center py-6 text-sm text-brand-orange/80">
                   {language === 'en' ? 'Click Settings (Gear Icon) to configure your API key.' : '请点击右上角设置图标配置 API Key'}
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!showResult && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0eee4] flex items-center justify-center mb-6">
              <span className="font-serif italic font-bold text-brand-dark/20 text-2xl">R</span>
            </div>
            <p className="text-[15px] font-serif text-brand-dark/50 max-w-[280px] leading-relaxed">
              {t('waitingInput')}
            </p>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowUploadModal(false); }}
          onDragOver={(e) => { e.preventDefault(); setIsModalDragOver(true); }}
          onDragLeave={() => setIsModalDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsModalDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              setShowUploadModal(false);
              handlePdfUpload(file);
            }
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-semibold text-brand-dark">
                {language === 'en' ? 'Upload Resume' : '上传简历'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-brand-dark/30 hover:text-brand-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drop Zone */}
            <div className="px-6 pb-6">
              <div
                className={`relative flex flex-col items-center justify-center py-14 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                  isModalDragOver
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-brand-light-gray bg-brand-light/50 hover:border-brand-orange/40 hover:bg-brand-orange/[0.02]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isModalDragOver ? 'bg-brand-orange/10' : 'bg-[#f0eee4]'
                }`}>
                  <FileUp className={`w-6 h-6 transition-colors ${
                    isModalDragOver ? 'text-brand-orange' : 'text-brand-dark/30'
                  }`} />
                </div>
                <p className="text-sm font-medium text-brand-dark/70 mb-1">
                  {isModalDragOver
                    ? t('dropPdfHint')
                    : (language === 'en' ? 'Drag & drop your file here' : '拖拽文件到此处')
                  }
                </p>
                <p className="text-xs text-brand-dark/40">
                  {language === 'en' ? 'or click to browse' : '或点击选择文件'}
                </p>
                <p className="text-xs text-brand-dark/25 mt-4">
                  PDF, DOCX, PPTX, XLSX, Images — Max 10MB
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setShowUploadModal(false);
                  handlePdfUpload(file);
                }
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
