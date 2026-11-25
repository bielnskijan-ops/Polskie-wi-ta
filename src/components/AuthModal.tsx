import { Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loginWithPassword, registerAccount } from '../services/authService';
import type { AuthUser } from '../types/shop';

export type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthSuccess: (token: string, user: AuthUser) => void;
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setErrorMessage(null);
    setInfoMessage(null);
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (mode === 'register') {
      if (trimmedName.length < 2) {
        setErrorMessage('Podaj imię i nazwisko (co najmniej 2 znaki).');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
        setErrorMessage('Podaj prawidłowy adres e-mail.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Hasło musi składać się z co najmniej 8 znaków.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Wpisane hasła nie są identyczne.');
        return;
      }
    } else {
      if (!trimmedEmail || !password) {
        setErrorMessage('Wpisz adres e-mail i hasło.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const session =
        mode === 'register'
          ? await registerAccount({
              fullName: trimmedName,
              email: trimmedEmail,
              password,
            })
          : await loginWithPassword({
              email: trimmedEmail,
              password,
            });

      setPassword('');
      setConfirmPassword('');

      if (session.requiresEmailConfirmation) {
        setInfoMessage(
          'Konto zostało utworzone. Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację przed logowaniem.'
        );
        setMode('login');
        return;
      }

      if (session.token && session.user) {
        onAuthSuccess(session.token, session.user);
        onClose();
      } else {
        setErrorMessage('Nie udało się nawiązać sesji użytkownika.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Wystąpił błąd podczas uwierzytelniania.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#04120D]/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md kitsch-card border-2 border-[#FBBF24] rounded-2xl shadow-[0_0_36px_rgba(245,158,11,0.35)] overflow-hidden text-[#FFFBEB]">
        <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
        <div className="px-6 py-5 festive-header-kitsch border-b-2 border-[#FBBF24]/70 flex items-center justify-between gap-4">
          <h2 id="auth-modal-title" className="text-lg font-bold kitsch-gold-text">
            {mode === 'login' ? 'Logowanie do konta' : 'Tworzenie nowego konta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno konta"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#FDE047] hover:text-white hover:bg-[#5F1317]/80 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pt-5">
          <div
            role="tablist"
            aria-label="Wybierz logowanie lub rejestrację"
            className="grid grid-cols-2 gap-1 p-1 bg-[#1A080B]/75 border border-[#FBBF24]/50 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] border border-[#FBBF24] shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-[#FDE68A]/85 hover:text-[#FDE047]'
              }`}
            >
              Logowanie
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] border border-[#FBBF24] shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-[#FDE68A]/85 hover:text-[#FDE047]'
              }`}
            >
              Utwórz konto
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {infoMessage && (
            <div
              role="status"
              className="p-3 rounded-lg bg-[#064E3B] border border-[#34D399]/50 text-xs font-medium text-[#D1FAE5]"
            >
              {infoMessage}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#450A0A] border border-[#EF4444]/60 text-xs font-medium text-[#FEE2E2]"
            >
              {errorMessage}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-semibold text-[#FEF3C7] mb-1.5"
              >
                Imię i nazwisko
              </label>
              <input
                id="auth-fullname"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="np. Anna Nowak"
                className="w-full px-3 py-2.5 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/45 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-[#FEF3C7] mb-1.5"
            >
              Adres e-mail
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="imie@domena.pl"
              className="w-full px-3 py-2.5 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/45 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-[#FEF3C7] mb-1.5"
            >
              Hasło {mode === 'register' ? '(min. 8 znaków)' : ''}
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/45 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#FDE68A]/75 hover:text-[#FDE047] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block text-xs font-semibold text-[#FEF3C7] mb-1.5"
              >
                Powtórz hasło
              </label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/45 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.4)] disabled:opacity-60 transition-all cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2B20] focus-visible:ring-[#F59E0B]"
          >
            {isSubmitting
              ? 'Przetwarzanie...'
              : mode === 'login'
                ? 'Zaloguj się'
                : 'Utwórz konto'}
          </button>

          <p className="text-[11px] text-[#FDE68A]/75 text-center leading-relaxed">
            Konto powiąże Twoje zamówienia w sklepie Polskie Święta z identyfikatorem użytkownika.
          </p>
        </form>
      </div>
    </div>
  );
}
