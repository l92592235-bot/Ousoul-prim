'use client';
import React, { useState } from 'react';

interface ClientRow {
  id: number;
  token: string;
  full_name: string | null;
  email: string | null;
  setup_complete: boolean;
  created_at: string;
  property_count: number;
  contract_count: number;
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [label, setLabel] = useState('');
  const [newLink, setNewLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadClients(s: string) {
    const res = await fetch('/api/admin/clients', { headers: { 'x-admin-secret': s } });
    if (res.ok) {
      setClients(await res.json());
      setAuthed(true);
      setError(null);
    } else {
      setError('كلمة المرور الإدارية غير صحيحة');
    }
  }

  async function createClient() {
    setBusy(true);
    setNewLink(null);
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: secret, label }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setNewLink(`${origin}/c/${data.token}`);
      setLabel('');
      loadClients(secret);
    }
  }

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h1 style={{ color: '#d4af6a', fontSize: '1.2rem' }}>لوحة الإدارة — أصول برايم</h1>
          <input className="input" type="password" placeholder="كلمة المرور الإدارية" value={secret} onChange={(e) => setSecret(e.target.value)} />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary" onClick={() => loadClients(secret)}>دخول</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#d4af6a', fontSize: '1.3rem', marginBottom: '1.2rem' }}>لوحة الإدارة — أصول برايم</h1>

      <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem' }}>
        <input className="input" placeholder="اسم/تسمية العميل (اختياري)" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={createClient} disabled={busy}>إنشاء رابط عميل جديد</button>
      </div>

      {newLink && (
        <div className="auth-success" style={{ marginBottom: '1.5rem', wordBreak: 'break-all' }}>
          تم إنشاء الرابط: <a href={newLink} target="_blank" rel="noreferrer" style={{ color: '#d4af6a' }}>{newLink}</a>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'start', color: '#8a8f9c' }}>
              <th style={{ padding: '0.5rem' }}>الاسم</th>
              <th style={{ padding: '0.5rem' }}>البريد</th>
              <th style={{ padding: '0.5rem' }}>مُفعّل؟</th>
              <th style={{ padding: '0.5rem' }}>أملاك</th>
              <th style={{ padding: '0.5rem' }}>عقود</th>
              <th style={{ padding: '0.5rem' }}>الرابط</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid rgba(212,175,106,0.1)' }}>
                <td style={{ padding: '0.5rem' }}>{c.full_name || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{c.email || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{c.setup_complete ? '✅' : '⏳'}</td>
                <td style={{ padding: '0.5rem' }}>{c.property_count}</td>
                <td style={{ padding: '0.5rem' }}>{c.contract_count}</td>
                <td style={{ padding: '0.5rem' }}>
                  <a href={`/c/${c.token}`} target="_blank" rel="noreferrer" style={{ color: '#d4af6a' }}>فتح</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
