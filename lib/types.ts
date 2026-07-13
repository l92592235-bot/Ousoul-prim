export interface Property {
  id: number;
  name: string;
  address: string | null;
  property_type: string;
  estimated_value: string | number | null;
  owner_name: string | null;
  notes: string | null;
  created_at: string;
  contract_count: number;
}

export interface Contract {
  id: number;
  property_id: number | null;
  property_name: string | null;
  title: string;
  contract_type: string;
  party_name: string;
  start_date: string | null;
  deadline: string;
  alert_days: number;
  notify_email: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface ActivityEntry {
  id: number;
  action_type: string;
  entity_label: string;
  created_at: string;
}

export function urgencyLevel(deadline: string, alertDays: number): 'overdue' | 'urgent' | 'soon' | 'normal' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= Math.min(7, alertDays)) return 'urgent';
  if (diffDays <= alertDays) return 'soon';
  return 'normal';
}

export function daysUntil(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
