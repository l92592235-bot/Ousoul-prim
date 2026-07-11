'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage, formatCurrency, CURRENCIES } from '@/lib/i18n';
import { Property, Contract, ActivityEntry, urgencyLevel, daysUntil } from '@/lib/types';
import { PropertyModal } from './PropertyModal';
import { ContractModal } from './ContractModal';
import { SettingsModal } from './SettingsModal';
import {
  LayoutDashboard, Building2, FileText, Settings as SettingsIcon, LogOut, Plus, Pencil, Trash2,
} from 'lucide-react';

type ViewKey = 'dashboard' | 'properties' | 'contracts';

export function AppShell({ token, currency }: { token: string; currency: string }) {
  const { t, lang, toggleLang } = useLanguage();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyModal, setPropertyModal] = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [contractModal, setContractModal] = useState<{ open: boolean; contract: Contract | null }>({ open: false, contract: null });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'property' | 'contract'; id: number; label: string } | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes, aRes] = await Promise.all([
      fetch(`/api/c/${token}/properties`),
      fetch(`/api/c/${token}/contracts`),
      fetch(`/api/c/${token}/activity`),
    ]);
    if (pRes.ok) setProperties(await pRes.json());
    if (cRes.ok) setContracts(await cRes.json());
    if (aRes.ok) setActivity(await aRes.json());
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleLogout() {
    await fetch(`/api/c/${token}/logout`, { method: 'POST' });
    window.location.reload();
  }

  async function deleteProperty(id: number) {
    await fetch(`/api/c/${token}/properties/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    loadAll();
  }
  async function deleteContract(id: number) {
    await fetch(`/api/c/${token}/contracts/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    loadAll();
  }

  const activeContracts = contracts.filter((c) => c.status === 'active');
  const upcomingAlerts = activeContracts.filter((c) => urgencyLevel(c.deadline, c.alert_days) !== 'normal');
  const totalValue = properties.reduce((sum, p) => sum + (Number(p.estimated_value) || 0), 0);
  const urgentContracts = useMemo(
    () => [...upcomingAlerts].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)).slice(0, 8),
    [upcomingAlerts],
  );

  const navItems: { key: ViewKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
    { key: 'properties', label: t('nav.properties'), icon: <Building2 size={18} /> },
    { key: 'contracts', label: t('nav.contracts'), icon: <FileText size={18} /> },
  ];

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="lux-sidebar app-sidebar" style={{ width: 240, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="sidebar-brand" style={{ color: '#d4af6a', fontWeight: 900, fontSize: '1.1rem', padding: '0.5rem 0.7rem 1.4rem' }}>
          {t('brand.name')}
        </div>
        <div className="sidebar-nav-row">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: view === item.key ? 'rgba(212,175,106,0.12)' : 'transparent',
                border: 'none',
                color: view === item.key ? '#d4af6a' : 'rgba(236,231,219,0.7)',
              }}
            >
              {item.icon} <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-spacer" style={{ flex: 1 }} />
        <div className="sidebar-nav-row sidebar-nav-row-bottom">
          <button className="btn" style={{ justifyContent: 'flex-start', border: 'none' }} onClick={() => setSettingsOpen(true)}>
            <SettingsIcon size={18} /> <span className="nav-label">{t('nav.settings')}</span>
          </button>
          <button className="btn" style={{ justifyContent: 'flex-start', border: 'none' }} onClick={toggleLang}>
            {t('lang.toggle')}
          </button>
          <button className="btn btn-danger" style={{ justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={18} /> <span className="nav-label">{t('action.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="view-enter app-main" style={{ flex: 1, padding: '2rem', maxWidth: 1100 }}>
        {loading ? (
          <p style={{ color: '#8a8f9c' }}>...</p>
        ) : view === 'dashboard' ? (
          <div>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label={t('dashboard.stat.properties')} value={properties.length} />
              <StatCard label={t('dashboard.stat.activeContracts')} value={activeContracts.length} />
              <StatCard label={t('dashboard.stat.upcomingAlerts')} value={upcomingAlerts.length} accent />
              <StatCard label={t('dashboard.stat.totalValue')} value={formatCurrency(totalValue, currency, lang)} />
            </div>

            <section className="glass-panel" style={{ padding: '1.4rem', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#d4af6a', fontSize: '1rem', marginBottom: '1rem' }}>{t('dashboard.urgent.title')}</h2>
              {urgentContracts.length === 0 ? (
                <p style={{ color: '#8a8f9c', fontSize: '0.9rem' }}>{t('dashboard.urgent.empty')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {urgentContracts.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                      <span>{c.title} — {c.party_name}</span>
                      <UrgencyBadge level={urgencyLevel(c.deadline, c.alert_days)} t={t} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-panel" style={{ padding: '1.4rem' }}>
              <h2 style={{ color: '#d4af6a', fontSize: '1rem', marginBottom: '1rem' }}>{t('dashboard.activity.title')}</h2>
              {activity.length === 0 ? (
                <p style={{ color: '#8a8f9c', fontSize: '0.9rem' }}>{t('dashboard.activity.empty')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activity.map((a) => (
                    <div key={a.id} style={{ fontSize: '0.85rem', color: 'rgba(236,231,219,0.7)' }}>
                      {a.entity_label} · {new Date(a.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : view === 'properties' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <h1 style={{ color: '#ece7db', fontSize: '1.3rem' }}>{t('properties.title')}</h1>
              <button className="btn btn-primary" onClick={() => setPropertyModal({ open: true, property: null })}>
                <Plus size={16} /> {t('properties.add')}
              </button>
            </div>
            {properties.length === 0 ? (
              <p style={{ color: '#8a8f9c' }}>{t('properties.empty')}</p>
            ) : (
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {properties.map((p) => (
                  <div key={p.id} className="glass-panel" style={{ padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ color: '#ece7db', fontSize: '1rem' }}>{p.name}</h3>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setPropertyModal({ open: true, property: p })}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setConfirmDelete({ kind: 'property', id: p.id, label: p.name })}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(236,231,219,0.55)', fontSize: '0.8rem', marginTop: 4 }}>{p.address}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#8a8f9c' }}>{t('properties.estimatedValue')}</span>
                      <span style={{ color: '#d4af6a' }}>{formatCurrency(p.estimated_value ? Number(p.estimated_value) : null, currency, lang)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#8a8f9c' }}>{t('properties.relatedContracts')}</span>
                      <span>{p.contract_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <h1 style={{ color: '#ece7db', fontSize: '1.3rem' }}>{t('contracts.title')}</h1>
              <button className="btn btn-primary" onClick={() => setContractModal({ open: true, contract: null })}>
                <Plus size={16} /> {t('contracts.add')}
              </button>
            </div>
            {contracts.length === 0 ? (
              <p style={{ color: '#8a8f9c' }}>{t('contracts.empty')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }} className="stagger">
                {contracts.map((c) => (
                  <div key={c.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <div>
                      <div style={{ color: '#ece7db', fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(236,231,219,0.55)' }}>
                        {c.party_name} {c.property_name ? `· ${c.property_name}` : ''} · {new Date(c.deadline).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <UrgencyBadge level={urgencyLevel(c.deadline, c.alert_days)} t={t} />
                      <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setContractModal({ open: true, contract: c })}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setConfirmDelete({ kind: 'contract', id: c.id, label: c.title })}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {propertyModal.open && (
        <PropertyModal
          token={token}
          property={propertyModal.property}
          onClose={() => setPropertyModal({ open: false, property: null })}
          onSaved={() => { setPropertyModal({ open: false, property: null }); loadAll(); }}
        />
      )}
      {contractModal.open && (
        <ContractModal
          token={token}
          contract={contractModal.contract}
          properties={properties}
          onClose={() => setContractModal({ open: false, contract: null })}
          onSaved={() => { setContractModal({ open: false, contract: null }); loadAll(); }}
        />
      )}
      {settingsOpen && (
        <SettingsModal token={token} currentCurrency={currency} onClose={() => setSettingsOpen(false)} />
      )}
      {confirmDelete && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="glass-panel" style={{ padding: '1.4rem', maxWidth: 380 }}>
            <p style={{ color: '#ece7db', marginBottom: '1.2rem' }}>
              {confirmDelete.kind === 'property'
                ? `${t('confirm.delete.property')}`.replace('{name}', confirmDelete.label)
                : `${t('confirm.delete.contract')}`.replace('{name}', confirmDelete.label)}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setConfirmDelete(null)}>{t('action.cancel')}</button>
              <button
                className="btn btn-danger"
                onClick={() => (confirmDelete.kind === 'property' ? deleteProperty(confirmDelete.id) : deleteContract(confirmDelete.id))}
              >
                {t('action.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ position: 'fixed', bottom: 8, insetInlineEnd: 14, opacity: 0.12, fontSize: '0.65rem', color: '#8a8f9c' }}>
        {t('brand.footer')}
      </p>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

function StatCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="stat-card glass-panel" style={{ padding: '1.1rem' }}>
      <div style={{ fontSize: '0.8rem', color: '#8a8f9c' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: accent ? '#d4af6a' : '#ece7db', marginTop: 4 }}>{value}</div>
    </div>
  );
}

function UrgencyBadge({ level, t }: { level: 'overdue' | 'urgent' | 'soon' | 'normal'; t: (k: string) => string }) {
  const colors: Record<string, string> = {
    overdue: '#e08080',
    urgent: '#e8a04a',
    soon: '#d4af6a',
    normal: '#7fb37f',
  };
  return (
    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '999px', border: `1px solid ${colors[level]}55`, color: colors[level] }}>
      {t(`urgency.${level}`)}
    </span>
  );
}
