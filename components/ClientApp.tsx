'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { LanguageProvider } from '@/lib/i18n';
import { WelcomePage } from './WelcomePage';
import { AppShell } from './AppShell';

type Status = {
  loading: boolean;
  exists: boolean;
  setupComplete: boolean;
  authed: boolean;
};

export function ClientApp({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>({ loading: true, exists: false, setupComplete: false, authed: false });
  const [lang, setLangState] = useState<'ar' | 'en'>('ar');
  const [currency, setCurrencyState] = useState('SAR');

  const checkStatus = useCallback(async () => {
    const res = await fetch(`/api/c/${token}/status`);
    if (!res.ok) {
      setStatus({ loading: false, exists: false, setupComplete: false, authed: false });
      return;
    }
    const data = await res.json();
    setStatus({ loading: false, exists: true, setupComplete: data.setupComplete, authed: data.authed });
    if (data.authed) {
      const meRes = await fetch(`/api/c/${token}/me`);
      if (meRes.ok) {
        const me = await meRes.json();
        if (me.lang === 'ar' || me.lang === 'en') setLangState(me.lang);
        if (me.currency) setCurrencyState(me.currency);
      }
    }
  }, [token]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  async function persistLang(l: 'ar' | 'en') {
    setLangState(l);
    if (status.authed) {
      await fetch(`/api/c/${token}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: l }),
      });
    }
  }

  if (status.loading) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  if (!status.exists) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8f9c' }}>
        رابط غير صالح أو منتهي الصلاحية — Invalid or expired link
      </main>
    );
  }

  return (
    <LanguageProvider initialLang={lang} initialCurrency={currency} onLangChange={persistLang} onCurrencyChange={setCurrencyState}>
      {status.authed ? (
        <AppShell token={token} currency={currency} />
      ) : (
        <WelcomePage token={token} setupComplete={status.setupComplete} onAuthed={checkStatus} />
      )}
    </LanguageProvider>
  );
}
