"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useHistory } from "@/lib/HistoryContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function HistoryButton() {
  const { totalCount } = useHistory();
  const { t } = useLanguage();

  return (
    <Link
      href="/history"
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-xl text-[0.8rem] font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light-gray/50 transition-colors relative"
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{t('history')}</span>
      {totalCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-brand-dark text-brand-light text-[10px] font-medium px-1">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </Link>
  );
}
