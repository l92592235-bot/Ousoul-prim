'use client';
import React, { useState } from 'react';
import { useLanguage, CURRENCIES } from '@/lib/i18n';
import { PasswordInput } from './PasswordInput';

export function SettingsModal({
  token, currentCurrency, onClose,
}: { token: string; currentCurrency: string; onClose: () => void }) {
  const { t, lang, currency, setCurrency } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCurrencyChange(code: string) {
    setCurrency(code);
    await fetch(`/api/c/${token}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: code }),
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (newPassword.length < 8) {
      setPwError(t('auth.error.password_length'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError(t('auth.error.password_mismatch'));
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/c/${token}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setBusy(false);
    if (res.ok) {
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPwError(t('auth.error.wrong_password'));
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="glass-panel settings-modal-box" style={{ padding: '1.6rem', width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#d4af6a', fontSize: '1.1rem' }}>{t('settings.title')}</h2>
          <button className="btn" onClick={onClose}>{t('action.close')}</button>
        </div>

        <div>
          <div className="settings-section-title">{t('settings.currency.title')}</div>
          <p className="settings-section-desc">{t('settings.currency.desc')}</p>
          <select className="select" value={currency} onChange={(e) => handleCurrencyChange(e.target.value)} style={{ marginTop: '0.6rem', width: '100%' }}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{lang === 'ar' ? c.labelAr : c.labelEn}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <div className="settings-section-title">{t('settings.password.title')}</div>
          <PasswordInput className="input auth-input" value={currentPassword} onChange={setCurrentPassword} placeholder={t('settings.password.current')} autoComplete="current-password" />
          <PasswordInput className="input auth-input" value={newPassword} onChange={setNewPassword} placeholder={t('settings.password.new')} autoComplete="new-password" />
          <PasswordInput className="input auth-input" value={confirmNewPassword} onChange={setConfirmNewPassword} placeholder={t('settings.password.confirm')} autoComplete="new-password" />
          {pwError && <p className="auth-error">{pwError}</p>}
          {pwSuccess && <p className="auth-success">{t('settings.password.success')}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary">{t('settings.password.submit')}</button>
        </form>
      </div>
    </div>
  );
}
