'use client';
import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { PasswordInput } from './PasswordInput';

type Mode = 'login' | 'setup' | 'forgot';

export function WelcomePage({
  token,
  setupComplete,
  onAuthed,
}: {
  token: string;
  setupComplete: boolean;
  onAuthed: () => void;
}) {
  const { t, toggleLang } = useLanguage();
  const [mode, setMode] = useState<Mode>(setupComplete ? 'login' : 'setup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError(t('auth.error.required_fields'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.error.password_length'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.error.password_mismatch'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/c/${token}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, whatsapp, password }),
      });
      if (!res.ok) throw new Error('failed');
      onAuthed();
    } catch {
      setError(t('auth.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError(t('auth.error.wrong_password'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/c/${token}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onAuthed();
        return;
      }
      if (data.error === 'locked') {
        setError(t('auth.error.locked', { n: data.minutesLeft }));
      } else {
        setError(t('auth.error.wrong_password'));
      }
    } catch {
      setError(t('auth.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch(`/api/c/${token}/forgot-password`, { method: 'POST' });
      setForgotSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="welcome-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
      <button
        type="button"
        onClick={toggleLang}
        className="btn"
        style={{ position: 'absolute', top: 20, insetInlineEnd: 20 }}
      >
        {t('lang.toggle')}
      </button>
      <div className="glass-panel auth-form-card" style={{ maxWidth: 440, width: '100%', margin: '1rem' }}>
        <h1 className="auth-form-title" style={{ textAlign: 'center', fontSize: '1.6rem' }}>
          {t('brand.name')}
        </h1>
        <p className="auth-form-subtitle" style={{ textAlign: 'center' }}>
          {mode === 'setup' ? t('welcome.subtext') : t('welcome.tagline')}
        </p>

        {mode === 'forgot' ? (
          forgotSent ? (
            <div style={{ textAlign: 'center' }}>
              <p className="auth-success" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>{t('auth.forgot.sent')}</p>
              <button className="auth-back-link" onClick={() => { setMode('login'); setForgotSent(false); }}>
                {t('auth.forgot.back')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p className="auth-form-subtitle">{t('auth.forgot.desc')}</p>
              <button type="submit" disabled={busy} className="btn btn-primary">
                {t('auth.forgot.submit')}
              </button>
              <button type="button" className="auth-back-link" onClick={() => setMode('login')}>
                {t('auth.forgot.back')}
              </button>
            </form>
          )
        ) : mode === 'setup' ? (
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input className="input auth-input" placeholder={t('auth.fullname')} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input className="input auth-input" type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input auth-input" placeholder={t('auth.whatsapp')} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <PasswordInput className="input auth-input" value={password} onChange={setPassword} placeholder={t('auth.password')} autoComplete="new-password" />
            <PasswordInput className="input auth-input" value={confirmPassword} onChange={setConfirmPassword} placeholder={t('auth.confirmPassword')} autoComplete="new-password" />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary">
              {t('auth.submit.register')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <PasswordInput className="input auth-input" value={password} onChange={setPassword} placeholder={t('auth.password')} autoComplete="current-password" />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary">
              {t('auth.submit.login')}
            </button>
            <button type="button" className="auth-forgot-link" onClick={() => setMode('forgot')}>
              {t('auth.forgot')}
            </button>
          </form>
        )}
      </div>
      <p style={{ position: 'fixed', bottom: 12, opacity: 0.15, fontSize: '0.7rem', color: '#8a8f9c' }}>
        {t('brand.footer')}
      </p>
    </div>
  );
}
