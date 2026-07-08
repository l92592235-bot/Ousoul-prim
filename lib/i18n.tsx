'use client';
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export type Lang = 'ar' | 'en';
type Dict = Record<string, string>;

const AR: Dict = {
  'brand.name': 'أصول برايم',
  'brand.footer': 'ملكية خاصة — جميع الحقوق محفوظة',
  'nav.dashboard': 'نظرة عامة',
  'nav.properties': 'الأملاك',
  'nav.contracts': 'العقود',
  'nav.settings': 'الإعدادات',
  'welcome.tagline': 'إدارة أملاكك وعقودك، بثقة تليق بمكانتك',
  'welcome.subtext': 'منصة خاصة لمتابعة العقارات والعقود ومواعيدها الحرجة، مصمَّمة حصريًا لأصحاب المحافظ العقارية.',
  'auth.title.login': 'الدخول إلى حسابك الخاص',
  'auth.title.register': 'إنشاء حسابك الخاص',
  'auth.subtitle.register': 'هذا الحساب سيكون ملكك الحصري وحدك.',
  'auth.fullname': 'الاسم الكامل',
  'auth.email': 'البريد الإلكتروني',
  'auth.whatsapp': 'رقم واتساب (اختياري)',
  'auth.password': 'كلمة السر',
  'auth.confirmPassword': 'تأكيد كلمة السر',
  'auth.submit.login': 'دخول',
  'auth.submit.register': 'إنشاء الحساب',
  'auth.forgot': 'نسيت كلمة السر؟',
  'auth.forgot.title': 'استعادة كلمة السر',
  'auth.forgot.desc': 'سيتم إرسال كلمة سر مؤقتة إلى بريدك الإلكتروني المسجَّل.',
  'auth.forgot.submit': 'إرسال طلب الاستعادة',
  'auth.forgot.sent': 'تم إرسال طلبك. تحققي من بريدك الإلكتروني خلال دقائق.',
  'auth.forgot.back': 'العودة لتسجيل الدخول',
  'auth.error.wrong_password': 'كلمة السر غير صحيحة',
  'auth.error.locked': 'تم قفل الحساب مؤقتًا بسبب محاولات خاطئة متكررة. حاولي بعد {n} دقيقة.',
  'auth.error.password_length': 'يجب ألا تقل كلمة السر عن 8 أحرف',
  'auth.error.password_mismatch': 'كلمتا السر غير متطابقتين',
  'auth.error.required_fields': 'الاسم والبريد وكلمة السر حقول إلزامية',
  'auth.error.generic': 'حدث خطأ ما، الرجاء المحاولة مرة أخرى',
  'settings.title': 'الإعدادات',
  'settings.password.title': 'تغيير كلمة السر',
  'settings.password.current': 'كلمة السر الحالية',
  'settings.password.new': 'كلمة السر الجديدة',
  'settings.password.confirm': 'تأكيد كلمة السر الجديدة',
  'settings.password.submit': 'تحديث كلمة السر',
  'settings.password.success': 'تم تحديث كلمة السر بنجاح',
  'settings.currency.title': 'العملة',
  'settings.currency.desc': 'اختاري العملة التي تُعرض بها القيم المالية.',
  'dashboard.stat.properties': 'الأملاك',
  'dashboard.stat.activeContracts': 'العقود السارية',
  'dashboard.stat.upcomingAlerts': 'تنبيهات قريبة',
  'dashboard.stat.totalValue': 'القيمة التقديرية الإجمالية',
  'dashboard.urgent.title': 'العقود التي تحتاج انتباهًا قريبًا',
  'dashboard.urgent.empty': 'لا توجد عقود تحتاج تنبيهًا حاليًا — كل شيء تحت السيطرة',
  'dashboard.activity.title': 'سجل النشاط الأخير',
  'dashboard.activity.empty': 'لا يوجد نشاط مسجَّل بعد.',
  'properties.title': 'الأملاك',
  'properties.add': 'إضافة ملك',
  'properties.empty': 'لا توجد أملاك مضافة بعد.',
  'properties.estimatedValue': 'القيمة التقديرية',
  'properties.relatedContracts': 'عدد العقود المرتبطة',
  'property.field.name': 'اسم الملك *',
  'property.field.address': 'العنوان',
  'property.field.type': 'النوع',
  'property.field.value': 'القيمة التقديرية',
  'property.field.ownerName': 'اسم المالك',
  'property.field.notes': 'ملاحظات',
  'property.type.residential': 'سكني',
  'property.type.commercial': 'تجاري',
  'property.type.land': 'أرض',
  'property.type.other': 'أخرى',
  'contracts.title': 'العقود',
  'contracts.add': 'إضافة عقد',
  'contracts.empty': 'لا توجد عقود بعد.',
  'contract.field.property': 'الملك المرتبط',
  'contract.field.property.none': '— بدون ملك محدد —',
  'contract.field.title': 'عنوان العقد *',
  'contract.field.type': 'نوع العقد',
  'contract.field.party': 'الطرف الآخر *',
  'contract.field.deadline': 'الموعد النهائي *',
  'contract.field.alertDays': 'التنبيه قبل (أيام)',
  'contract.field.notifyEmail': 'البريد الإلكتروني للتنبيه',
  'contract.field.notes': 'ملاحظات',
  'contract.type.lease': 'إيجار',
  'contract.type.insurance': 'تأمين',
  'contract.type.maintenance': 'صيانة',
  'contract.type.management': 'إدارة',
  'contract.type.other': 'أخرى',
  'contract.status.active': 'سارٍ',
  'contract.status.renewed': 'مجدَّد',
  'contract.status.expired': 'منتهٍ',
  'contract.status.cancelled': 'ملغى',
  'urgency.overdue': 'متأخر',
  'urgency.urgent': 'عاجل',
  'urgency.soon': 'قريبًا',
  'urgency.normal': 'مطمئن',
  'action.cancel': 'إلغاء',
  'action.delete': 'حذف',
  'action.save': 'حفظ',
  'action.close': 'إغلاق',
  'action.edit': 'تعديل',
  'action.logout': 'تسجيل الخروج',
  'lang.toggle': 'English',
};

const EN: Dict = {
  'brand.name': 'Osoul Prime',
  'brand.footer': 'Private ownership — All rights reserved',
  'nav.dashboard': 'Overview',
  'nav.properties': 'Properties',
  'nav.contracts': 'Contracts',
  'nav.settings': 'Settings',
  'welcome.tagline': 'Manage your properties and contracts with confidence',
  'welcome.subtext': 'A private platform for tracking real estate and contracts and their critical deadlines.',
  'auth.title.login': 'Sign in to your account',
  'auth.title.register': 'Create your own account',
  'auth.subtitle.register': 'This account will be exclusively yours.',
  'auth.fullname': 'Full name',
  'auth.email': 'Email address',
  'auth.whatsapp': 'WhatsApp number (optional)',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm password',
  'auth.submit.login': 'Sign in',
  'auth.submit.register': 'Create account',
  'auth.forgot': 'Forgot your password?',
  'auth.forgot.title': 'Recover your password',
  'auth.forgot.desc': 'A temporary password will be sent to your registered email.',
  'auth.forgot.submit': 'Send recovery request',
  'auth.forgot.sent': 'Your request was sent. Check your email in a few minutes.',
  'auth.forgot.back': 'Back to sign in',
  'auth.error.wrong_password': 'Incorrect password',
  'auth.error.locked': 'Account temporarily locked due to repeated attempts. Try again in {n} minute(s).',
  'auth.error.password_length': 'Password must be at least 8 characters',
  'auth.error.password_mismatch': 'Passwords do not match',
  'auth.error.required_fields': 'Name, email and password are required',
  'auth.error.generic': 'Something went wrong, please try again',
  'settings.title': 'Settings',
  'settings.password.title': 'Change password',
  'settings.password.current': 'Current password',
  'settings.password.new': 'New password',
  'settings.password.confirm': 'Confirm new password',
  'settings.password.submit': 'Update password',
  'settings.password.success': 'Password updated successfully',
  'settings.currency.title': 'Currency',
  'settings.currency.desc': 'Choose the currency used to display monetary values.',
  'dashboard.stat.properties': 'Properties',
  'dashboard.stat.activeContracts': 'Active contracts',
  'dashboard.stat.upcomingAlerts': 'Upcoming alerts',
  'dashboard.stat.totalValue': 'Total estimated value',
  'dashboard.urgent.title': 'Contracts needing attention soon',
  'dashboard.urgent.empty': "No contracts need attention right now",
  'dashboard.activity.title': 'Recent activity',
  'dashboard.activity.empty': 'No activity logged yet.',
  'properties.title': 'Properties',
  'properties.add': 'Add property',
  'properties.empty': 'No properties added yet.',
  'properties.estimatedValue': 'Estimated value',
  'properties.relatedContracts': 'Related contracts',
  'property.field.name': 'Property name *',
  'property.field.address': 'Address',
  'property.field.type': 'Type',
  'property.field.value': 'Estimated value',
  'property.field.ownerName': "Owner's name",
  'property.field.notes': 'Notes',
  'property.type.residential': 'Residential',
  'property.type.commercial': 'Commercial',
  'property.type.land': 'Land',
  'property.type.other': 'Other',
  'contracts.title': 'Contracts',
  'contracts.add': 'Add contract',
  'contracts.empty': 'No contracts yet.',
  'contract.field.property': 'Linked property',
  'contract.field.property.none': '— No property selected —',
  'contract.field.title': 'Contract title *',
  'contract.field.type': 'Contract type',
  'contract.field.party': 'Other party *',
  'contract.field.deadline': 'Deadline *',
  'contract.field.alertDays': 'Alert before (days)',
  'contract.field.notifyEmail': 'Notification email',
  'contract.field.notes': 'Notes',
  'contract.type.lease': 'Lease',
  'contract.type.insurance': 'Insurance',
  'contract.type.maintenance': 'Maintenance',
  'contract.type.management': 'Management',
  'contract.type.other': 'Other',
  'contract.status.active': 'Active',
  'contract.status.renewed': 'Renewed',
  'contract.status.expired': 'Expired',
  'contract.status.cancelled': 'Cancelled',
  'urgency.overdue': 'Overdue',
  'urgency.urgent': 'Urgent',
  'urgency.soon': 'Soon',
  'urgency.normal': 'On track',
  'action.cancel': 'Cancel',
  'action.delete': 'Delete',
  'action.save': 'Save',
  'action.close': 'Close',
  'action.edit': 'Edit',
  'action.logout': 'Sign out',
  'lang.toggle': 'العربية',
};

const DICTS: Record<Lang, Dict> = { ar: AR, en: EN };

export interface CurrencyOption {
  code: string;
  labelAr: string;
  labelEn: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'SAR', labelAr: 'ريال سعودي', labelEn: 'Saudi Riyal (SAR)' },
  { code: 'AED', labelAr: 'درهم إماراتي', labelEn: 'UAE Dirham (AED)' },
  { code: 'USD', labelAr: 'دولار أمريكي', labelEn: 'US Dollar (USD)' },
  { code: 'EUR', labelAr: 'يورو', labelEn: 'Euro (EUR)' },
  { code: 'GBP', labelAr: 'جنيه إسترليني', labelEn: 'British Pound (GBP)' },
  { code: 'KWD', labelAr: 'دينار كويتي', labelEn: 'Kuwaiti Dinar (KWD)' },
  { code: 'QAR', labelAr: 'ريال قطري', labelEn: 'Qatari Riyal (QAR)' },
  { code: 'BHD', labelAr: 'دينار بحريني', labelEn: 'Bahraini Dinar (BHD)' },
  { code: 'OMR', labelAr: 'ريال عماني', labelEn: 'Omani Rial (OMR)' },
  { code: 'EGP', labelAr: 'جنيه مصري', labelEn: 'Egyptian Pound (EGP)' },
  { code: 'JOD', labelAr: 'دينار أردني', labelEn: 'Jordanian Dinar (JOD)' },
  { code: 'CHF', labelAr: 'فرنك سويسري', labelEn: 'Swiss Franc (CHF)' },
];

interface LanguageContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  currency: string;
  setCurrency: (c: string) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Lang;
  initialCurrency?: string;
  onLangChange?: (l: Lang) => void;
  onCurrencyChange?: (c: string) => void;
}> = ({ children, initialLang = 'ar', initialCurrency = 'SAR', onLangChange, onCurrencyChange }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [currency, setCurrencyState] = useState<string>(initialCurrency);

  useEffect(() => setLangState(initialLang), [initialLang]);
  useEffect(() => setCurrencyState(initialCurrency), [initialCurrency]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      onLangChange?.(l);
    },
    [onLangChange],
  );

  const toggleLang = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  const setCurrency = useCallback(
    (c: string) => {
      setCurrencyState(c);
      onCurrencyChange?.(c);
    },
    [onCurrencyChange],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = DICTS[lang][key] ?? DICTS.ar[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang],
  );

  const value: LanguageContextValue = { lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang, toggleLang, t, currency, setCurrency };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function formatCurrency(value: number | null | undefined, currency: string, lang: Lang): string {
  if (value === null || value === undefined) return '—';
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}
