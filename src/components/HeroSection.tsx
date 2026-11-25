import { ArrowDownRight, Sparkles } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onBrowseCatalog: () => void;
}

export function HeroSection({ onBrowseCatalog }: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#FBBF24] shadow-[0_0_32px_rgba(245,158,11,0.35)] min-h-[460px] lg:min-h-[540px] flex items-center bg-[#0B2B20]">
        <div
          className="absolute top-0 inset-x-0 z-20 h-2 festive-lights-strip border-b border-[#FBBF24]/60"
          aria-hidden="true"
        />

        <ResilientImage
          src={HERO_IMAGE_URL}
          alt="Świąteczna kiczowata pocztówka AI z polskim jarmarkiem bożonarodzeniowym, saniami Mikołaja i złotymi bombkami"
          fallbackTitle="Polskie Święta"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        <div
          className="absolute inset-0 bg-gradient-to-r from-[#2A0A0E]/60 via-[#071F17]/25 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full p-5 sm:p-8 lg:p-12">
          <div className="max-w-xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#5F1317]/65 via-[#071F17]/65 to-[#0B2B20]/65 backdrop-blur-md border-2 border-[#FBBF24]/80 shadow-[0_0_28px_rgba(245,158,11,0.35)]">
            <div className="h-1.5 w-full festive-lights-strip border-b border-[#FBBF24]/50" aria-hidden="true" />
            <div className="p-6 sm:p-8">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FDE047] tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FDE047] shrink-0" aria-hidden="true" />
                <span>Polskie Święta · Katalog prezentów · Symulator zakupów</span>
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight kitsch-gold-text leading-[1.12] text-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                Magia Polskich Świąt w każdym koszyku
              </h1>
              <p className="mt-4 text-base text-[#FFFBEB]/95 leading-relaxed">
                Odkryj kiczowaty urok świątecznych pocztówek AI i wybierz upominki z naszego
                katalogu. Zaloguj się przez Supabase Auth, wrzuć prezenty do koszyka i złóż
                próbne zamówienie.
              </p>

              <div className="mt-7 pt-5 border-t border-[#FBBF24]/40 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onBrowseCatalog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_18px_rgba(245,158,11,0.45)] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071F17] focus-visible:ring-[#F59E0B]"
                >
                  <span>Przeglądaj katalog</span>
                  <ArrowDownRight className="w-4 h-4 shrink-0 text-[#FDE047]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
