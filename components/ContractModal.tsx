'use client';
import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Contract, Property } from '@/lib/types';

export function ContractModal({
  token, contract, properties, onClose, onSaved,
}: { token: string; contract: Contract | null; properties: Property[]; onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const [propertyId, setPropertyId] = useState<string>(contract?.property_id ? String(contract.property_id) : '');
  const [title, setTitle] = useState(contract?.title ?? '');
  const [contractType, setContractType] = useState(contract?.contract_type ?? 'lease');
  const [partyName, setPartyName] = useState(contract?.party_name ?? '');
  const [deadline, setDeadline] = useState(contract?.deadline ? contract.deadline.slice(0, 10) : '');
  const [alertDays, setAlertDays] = useState(contract ? String(contract.alert_days) : '30');
  const [notifyEmail, setNotifyEmail] = useState(contract?.notify_email ?? '');
  const [status, setStatus] = useState(contract?.status ?? 'active');
  const [notes, setNotes] = useState(contract?.notes ?? '');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !partyName.trim() || !deadline) return;
    setBusy(true);
    const payload = {
      propertyId: propertyId ? Number(propertyId) : null,
      title, contractType, partyName, deadline,
      alertDays: Number(alertDays) || 30,
      notifyEmail, status, notes,
    };
    const url = contract ? `/api/c/${token}/contracts/${contract.id}` : `/api/c/${token}/contracts`;
    const method = contract ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.6rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <h2 style={{ color: '#d4af6a', fontSize: '1.1rem' }}>
          {contract ? t('action.edit') : t('contracts.add')}
        </h2>
        <select className="select" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">{t('contract.field.property.none')}</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="input" placeholder={t('contract.field.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select className="select" value={contractType} onChange={(e) => setContractType(e.target.value)}>
          <option value="lease">{t('contract.type.lease')}</option>
          <option value="insurance">{t('contract.type.insurance')}</option>
          <option value="maintenance">{t('contract.type.maintenance')}</option>
          <option value="management">{t('contract.type.management')}</option>
          <option value="other">{t('contract.type.other')}</option>
        </select>
        <input className="input" placeholder={t('contract.field.party')} value={partyName} onChange={(e) => setPartyName(e.target.value)} required />
        <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        <input className="input" type="number" placeholder={t('contract.field.alertDays')} value={alertDays} onChange={(e) => setAlertDays(e.target.value)} />
        <input className="input" type="email" placeholder={t('contract.field.notifyEmail')} value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">{t('contract.status.active')}</option>
          <option value="renewed">{t('contract.status.renewed')}</option>
          <option value="expired">{t('contract.status.expired')}</option>
          <option value="cancelled">{t('contract.status.cancelled')}</option>
        </select>
        <textarea className="textarea" placeholder={t('contract.field.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
          <button type="button" className="btn" onClick={onClose}>{t('action.cancel')}</button>
          <button type="submit" disabled={busy} className="btn btn-primary">{t('action.save')}</button>
        </div>
      </form>
    </div>
  );
}
