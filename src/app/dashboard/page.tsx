"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSettings } from "@/lib/SettingsContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SettingsButton } from "@/components/SettingsModal";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { config, setIsSettingsOpen } = useSettings();
  
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleOptimize = async () => {
    if (!resume.trim() || !jd.trim()) return;
    
    if (!config.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    
    // Pass everything required via the request body overlay
    await complete('', {
      body: {
        resume,
        jd,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.model,
        language
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-brand-light-gray pb-2">
              <div className="flex items-center gap-2 text-brand-dark/80">
                <FileText className="w-4 h-4 text-brand-orange" />
                <label htmlFor="resume-input" className="text-sm font-medium uppercase tracking-wider text-xs">
                  {t('currentDraft')}
                </label>
              </div>
              <span className="text-xs text-brand-dark/40 font-mono">
                {resume.length > 0 && `${resume.length} ${t('chars')}`}
              </span>
            </div>
            <Textarea
              id="resume-input"
              placeholder={t('resumePlaceholder')}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="resume-textarea mt-2 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
            />
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
              {!config.apiKey && !isLoading && !completion && (
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
    </div>
  );
}
