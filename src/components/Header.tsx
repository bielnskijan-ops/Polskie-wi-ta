import { ShoppingBag, Sparkles, TreePine, User } from 'lucide-react';
import type { AuthUser } from '../types/shop';
import type { AuthMode } from './AuthModal';

interface HeaderProps {
  cartItemCount: number;
  currentUser: AuthUser | null;
  onOpenCart: () => void;
  onOpenAuth: (mode: AuthMode) => void;
  onOpenAccount: () => void;
  onNavigateHome: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export function Header({
  cartItemCount,
  currentUser,
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onNavigateHome,
  onScrollToSection,
}: HeaderProps) {
  const firstName = currentUser ? currentUser.fullName.split(' ')[0] : '';

  return (
    <header className="sticky top-0 z-30 festive-header-kitsch backdrop-blur-md border-b-2 border-[#FBBF24] shadow-[0_6px_26px_rgba(245,158,11,0.3)]">
      <div className="h-2.5 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm"
        >
          <TreePine className="w-5 h-5 text-[#FBBF24] shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]" aria-hidden="true" />
          <span className="bg-gradient-to-r from-[#FFFBEB] via-[#FDE047] to-[#F59E0B] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
            Polskie Święta
          </span>
          <Sparkles className="w-4 h-4 text-[#FDE047] shrink-0 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" aria-hidden="true" />
        </button>

        <nav
          aria-label="Nawigacja główna"
          className="flex items-center gap-5 md:gap-7 text-sm font-semibold text-[#FEF3C7]"
        >
          <button
            type="button"
            onClick={() => onScrollToSection('katalog')}
            className="hidden md:inline-flex hover:text-[#FDE047] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm drop-shadow-xs"
          >
            Katalog
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('jak-dziala')}
            className="hidden md:inline-flex hover:text-[#FDE047] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm drop-shadow-xs"
          >
            Galeria AI
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 text-[#FDE047] hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm"
            >
              <User className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Konto · {firstName}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="hover:text-[#FDE047] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm drop-shadow-xs"
              >
                Zaloguj się
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="hidden sm:inline-flex hover:text-[#FDE047] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm drop-shadow-xs"
              >
                Utwórz konto
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.45)] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0A0E] focus-visible:ring-[#F59E0B]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0 text-[#FDE047]" aria-hidden="true" />
            <span>Koszyk</span>
            <span className="font-mono tabular-nums text-xs text-[#FDE047]">({cartItemCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
