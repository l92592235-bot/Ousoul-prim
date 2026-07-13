'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Contract, Property } from '@/lib/types';
import { Paperclip, Trash2, Upload } from 'lucide-react';

type DocRow = { id: number; file_name: string; mime_type: string; file_size: number; uploaded_at: string };

const fieldLabelStyle: React.CSSProperties = { color: '#d4af6a', fontSize: '0.78rem', marginBottom: '-0.4rem', opacity: 0.85 };
const fieldHintStyle: React.CSSProperties = { color: '#8a8f9c', fontSize: '0.72rem', margin: '-0.3rem 0 0' };

export function ContractModal({
  token, contract, properties, onClose, onSaved,
}: { token: string; contract: Contract | null; properties: Property[]; onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const [propertyId, setPropertyId] = useState<string>(contract?.property_id ? String(contract.property_id) : '');
  const [title, setTitle] = useState(contract?.title ?? '');
  const [contractType, setContractType] = useState(contract?.contract_type ?? 'lease');
  const [partyName, setPartyName] = useState(contract?.party_name ?? '');
  const [startDate, setStartDate] = useState(contract?.start_date ? contract.start_date.slice(0, 10) : '');
  const [deadline, setDeadline] = useState(contract?.deadline ? contract.deadline.slice(0, 10) : '');
  const [alertDays, setAlertDays] = useState(contract ? String(contract.alert_days) : '30');
  const [notifyEmail, setNotifyEmail] = useState(contract?.notify_email ?? '');
  const [status, setStatus] = useState(contract?.status ?? 'active');
  const [notes, setNotes] = useState(contract?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savedContractId, setSavedContractId] = useState<number | null>(contract?.id ?? null);

  const loadDocs = React.useCallback(async (contractId: number) => {
    const res = await fetch(`/api/c/${token}/documents/${contractId}`);
    if (res.ok) setDocs(await res.json());
  }, [token]);

  useEffect(() => {
    if (savedContractId) loadDocs(savedContractId);
  }, [savedContractId, loadDocs]);

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
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    if (!contract && res.ok) {
      // Newly created contract — keep the modal open so the user can attach documents right away.
      const created = await res.json().catch(() => null);
      if (created?.id) {
        setSavedContractId(created.id);
        return;
      }
    }
    onSaved();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !savedContractId) return;
    if (file.size > 15 * 1024 * 1024) { alert(t('contract.document.tooLarge')); return; }
    setUploading(true);
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await fetch(`/api/c/${token}/documents/${savedContractId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, mimeType: file.type || 'application/pdf', dataBase64: base64 }),
    });
    setUploading(false);
    loadDocs(savedContractId);
  }

  async function handleDeleteDoc(docId: number) {
    if (!savedContractId) return;
    await fetch(`/api/c/${token}/documents/file/${docId}`, { method: 'DELETE' });
    loadDocs(savedContractId);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem', boxSizing: 'border-box' }}>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.6rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxSizing: 'border-box' }}>
        <h2 style={{ color: '#d4af6a', fontSize: '1.1rem' }}>
          {contract ? t('action.edit') : t('contracts.add')}
        </h2>
        <label style={fieldLabelStyle}>{t('contract.field.property')}</label>
        <select className="select" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">{t('contract.field.property.none')}</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label style={fieldLabelStyle}>{t('contract.field.title')}</label>
        <input className="input" placeholder={t('contract.field.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label style={fieldLabelStyle}>{t('contract.field.type')}</label>
        <select className="select" value={contractType} onChange={(e) => setContractType(e.target.value)}>
          <option value="lease">{t('contract.type.lease')}</option>
          <option value="insurance">{t('contract.type.insurance')}</option>
          <option value="maintenance">{t('contract.type.maintenance')}</option>
          <option value="management">{t('contract.type.management')}</option>
          <option value="other">{t('contract.type.other')}</option>
        </select>
        <label style={fieldLabelStyle}>{t('contract.field.party')}</label>
        <input className="input" placeholder={t('contract.field.party')} value={partyName} onChange={(e) => setPartyName(e.target.value)} required />
        <label style={fieldLabelStyle}>{t('contract.field.startDate')}</label>
        <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label style={fieldLabelStyle}>{t('contract.field.deadline')}</label>
        <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        <label style={fieldLabelStyle}>{t('contract.field.alertDays')}</label>
        <input className="input" type="number" placeholder={t('contract.field.alertDays')} value={alertDays} onChange={(e) => setAlertDays(e.target.value)} />
        <label style={fieldLabelStyle}>{t('contract.field.notifyEmail')}</label>
        <input className="input" type="email" placeholder={t('contract.field.notifyEmail')} value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
        <label style={fieldLabelStyle}>{t('contract.field.status')}</label>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">{t('contract.status.active')}</option>
          <option value="renewed">{t('contract.status.renewed')}</option>
          <option value="expired">{t('contract.status.expired')}</option>
          <option value="cancelled">{t('contract.status.cancelled')}</option>
        </select>
        <label style={fieldLabelStyle}>{t('contract.field.notes')}</label>
        <textarea className="textarea" placeholder={t('contract.field.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <div style={{ borderTop: '1px solid rgba(212,175,106,0.14)', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ color: '#d4af6a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Paperclip size={15} /> {t('contract.documents.title')}
            </span>
            {savedContractId && (
              <label className="btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}>
                <Upload size={14} /> {uploading ? t('contract.documents.uploading') : t('contract.documents.upload')}
                <input type="file" accept="application/pdf,image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleFileUpload} />
              </label>
            )}
          </div>
          {!savedContractId ? (
            <p style={{ color: '#d4af6a', fontSize: '0.8rem', background: 'rgba(212,175,106,0.08)', padding: '0.6rem 0.7rem', borderRadius: '0.5rem', lineHeight: 1.6 }}>
              {t('contract.documents.saveFirst')}
            </p>
          ) : docs.length === 0 ? (
            <p style={{ color: '#8a8f9c', fontSize: '0.8rem' }}>{t('contract.documents.empty')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {docs.map((d) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', padding: '0.5rem 0.7rem' }}>
                  <a href={`/api/c/${token}/documents/file/${d.id}`} target="_blank" rel="noreferrer" style={{ color: '#ece7db', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.file_name}
                  </a>
                  <button type="button" className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }} onClick={() => handleDeleteDoc(d.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
          <button type="button" className="btn" onClick={savedContractId && !contract ? onSaved : onClose}>
            {savedContractId && !contract ? t('action.done') : t('action.cancel')}
          </button>
          {!(savedContractId && !contract) && (
            <button type="submit" disabled={busy} className="btn btn-primary">
              {!contract ? t('contract.action.saveAndAttach') : t('action.save')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
