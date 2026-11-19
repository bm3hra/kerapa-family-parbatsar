import React from 'react';
import { useArchive } from '../context/ArchiveContext';

interface PageHeaderProps {
  kickerEn: string;
  kickerHi: string;
  titleEn: string;
  titleHi: string;
  subtitleEn?: string;
  subtitleHi?: string;
  isDemo?: boolean;
  isVerified?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  kickerEn,
  kickerHi,
  titleEn,
  titleHi,
  subtitleEn,
  subtitleHi,
  isDemo,
  isVerified,
  actions,
}: PageHeaderProps) {
  const { t } = useArchive();

  return (
    <section className="border-b border-[#E2D9C8] bg-[#F2ECE1]/65">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#6E182B] font-semibold mb-3">
              <span>{t(kickerEn, kickerHi)}</span>
              {isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#854D0E]">
                    {t('DEMO DATA · Editable Placeholder', 'नमूना डेटा · संपादन योग्य प्रारूप')}
                  </span>
                </>
              )}
              {isVerified && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#173F30]">
                    {t('Verified Record', 'सत्यापित अभिलेख')}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#191614] tracking-tight leading-[1.1]">
              {t(titleEn, titleHi)}
            </h1>

            {(subtitleEn || subtitleHi) && (
              <p className="mt-3.5 text-base md:text-lg text-[#5C554E] leading-relaxed max-w-2xl">
                {t(subtitleEn || subtitleHi || '', subtitleHi || subtitleEn || '')}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
