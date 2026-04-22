"use client";

import Link from "next/link";
import {
  FileText,
  Target,
  PenLine,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SettingsButton } from "@/components/SettingsModal";

export default function HomePage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: FileText,
      iconColor: "text-brand-orange",
      bgColor: "bg-brand-orange/10",
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: Target,
      iconColor: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: PenLine,
      iconColor: "text-brand-green",
      bgColor: "bg-brand-green/10",
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-brand-orange/20">
      {/* Refined subtle background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-brand-dark) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      
      {/* Soft atmospheric gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-brand-blue/5 blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-brand-dark text-brand-light">
            <span className="font-serif italic font-bold">R</span>
          </div>
          <span className="text-xl font-medium tracking-tight text-brand-dark">
            ResumeAI
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <SettingsButton />
          <LanguageSwitcher />
          <Link href="/dashboard">
            <Button variant="ghost" className="text-brand-dark hover:bg-brand-light-gray/50 hover:text-brand-dark font-medium px-4">
              {t('workspace')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Editorial Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-24 pb-32 md:pt-32 lg:pt-40 max-w-5xl mx-auto">
        <div className="animate-fade-in-up opacity-0 flex flex-col items-center text-center">
          {/* Subtle Tag */}
          <div className="mb-8 inline-flex items-center border border-brand-light-gray bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-brand-dark/70 font-medium tracking-wide">
            {t('tagline')}
          </div>

          {/* Typography-focused Headline */}
          <h1 className="max-w-4xl">
            <span className="block text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-brand-dark leading-[1.1] mb-2 font-sans">
              {t('heroTitle')}
            </span>
            <span className="block text-3xl md:text-5xl lg:text-5xl font-serif italic text-brand-dark/80 leading-[1.2] mt-4">
              {t('heroSubtitle')}
            </span>
          </h1>

          {/* Supporting Text in Serif */}
          <p className="mt-8 text-lg md:text-xl text-brand-dark/70 max-w-2xl leading-relaxed font-serif">
            {t('heroDesc')}
          </p>

          {/* Primary Action */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-brand-orange hover:bg-[#c2664b] text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              >
                {t('startDiagnosis')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Props / Features in Editorial Grid */}
        <div className="w-full mt-32 border-t border-brand-light-gray/60 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {features.map((feature, i) => (
              <div 
                key={feature.title} 
                className="animate-fade-in-up opacity-0 flex flex-col items-start"
                style={{ animationDelay: `${300 + i * 150}ms` }}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} ${feature.iconColor} mb-6`}>
                  <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-brand-dark mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-brand-dark/70 leading-relaxed font-serif text-[15px]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-10 text-center text-sm font-serif text-brand-mid-gray border-t border-transparent">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}
