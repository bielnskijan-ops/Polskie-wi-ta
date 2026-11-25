import { Sparkles } from 'lucide-react';
import { FESTIVE_AI_GALLERY } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

export function InfoSection() {
  return (
    <section
      id="jak-dziala"
      className="max-w-7xl mx-auto px-6 lg:px-10 py-14 border-t border-[#FBBF24]/40"
    >
      <div className="mb-10 max-w-2xl overflow-hidden rounded-2xl kitsch-card border-2 border-[#FBBF24]/80 shadow-[0_0_24px_rgba(245,158,11,0.24)]">
        <div className="h-1.5 w-full festive-lights-strip border-b border-[#FBBF24]/50" aria-hidden="true" />
        <div className="p-6">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FDE047] tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FDE047] shrink-0" aria-hidden="true" />
            <span>Polskie Święta · Kiczowate ilustracje AI</span>
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight kitsch-gold-text">
            Świąteczna galeria pocztówek AI
          </h2>
          <p className="mt-2.5 text-sm text-[#FEF3C7]/90 leading-relaxed tracking-[0.01em]">
            Złoty brokat, Mikołaj z naręczem paczek, wigilijny barszcz, zakopiańskie sanie i
            piernikowe chatki w pełnej krasie świątecznego kiczu, połączone z katalogiem i
            bezpieczeństwem Supabase Auth + RLS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FESTIVE_AI_GALLERY.map((card) => (
          <article
            key={card.title}
            className="kitsch-card border-2 border-[#FBBF24]/75 rounded-xl overflow-hidden flex flex-col shadow-[0_4px_22px_rgba(245,158,11,0.22)] hover:border-[#FDE047] hover:shadow-[0_8px_30px_rgba(245,158,11,0.38)] transition-all"
          >
            <div className="h-1.5 w-full festive-lights-strip border-b border-[#FBBF24]/50" aria-hidden="true" />
            <div className="aspect-[4/3] bg-[#071F17] overflow-hidden border-b border-[#FBBF24]/40">
              <ResilientImage
                src={card.imageUrl}
                alt={card.title}
                fallbackTitle={card.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-[#FFFBEB] leading-snug">
                {card.title}
              </h3>
              <p className="mt-1.5 text-sm text-[#FEF3C7]/85 leading-relaxed tracking-[0.01em]">
                {card.caption}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
