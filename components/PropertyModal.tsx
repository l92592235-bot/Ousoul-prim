'use client';
import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Property } from '@/lib/types';

export function PropertyModal({
  token, property, onClose, onSaved,
}: { token: string; property: Property | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(property?.name ?? '');
  const [address, setAddress] = useState(property?.address ?? '');
  const [propertyType, setPropertyType] = useState(property?.property_type ?? 'residential');
  const [estimatedValue, setEstimatedValue] = useState(property?.estimated_value ? String(property.estimated_value) : '');
  const [ownerName, setOwnerName] = useState(property?.owner_name ?? '');
  const [notes, setNotes] = useState(property?.notes ?? '');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const payload = {
      name, address, propertyType,
      estimatedValue: estimatedValue ? Number(estimatedValue) : null,
      ownerName, notes,
    };
    const url = property ? `/api/c/${token}/properties/${property.id}` : `/api/c/${token}/properties`;
    const method = property ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem', boxSizing: 'border-box' }}>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.6rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxSizing: 'border-box' }}>
        <h2 style={{ color: '#d4af6a', fontSize: '1.1rem' }}>
          {property ? t('action.edit') : t('properties.add')}
        </h2>
        <input className="input" placeholder={t('property.field.name')} value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" placeholder={t('property.field.address')} value={address} onChange={(e) => setAddress(e.target.value)} />
        <select className="select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="residential">{t('property.type.residential')}</option>
          <option value="commercial">{t('property.type.commercial')}</option>
          <option value="land">{t('property.type.land')}</option>
          <option value="other">{t('property.type.other')}</option>
        </select>
        <input className="input" type="number" placeholder={t('property.field.value')} value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
        <input className="input" placeholder={t('property.field.ownerName')} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        <textarea className="textarea" placeholder={t('property.field.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
          <button type="button" className="btn" onClick={onClose}>{t('action.cancel')}</button>
          <button type="submit" disabled={busy} className="btn btn-primary">{t('action.save')}</button>
        </div>
      </form>
    </div>
  );
}
