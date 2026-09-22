import React, { useMemo, useState } from 'react';
import { X, Sparkles, Upload, CreditCard, Smartphone, CheckCircle2, Copy, ShieldCheck, ImagePlus } from 'lucide-react';
import { useDirectory } from '../context/DirectoryContext';
import { useLocation } from '../context/LocationContext';
import { createAdPaymentRequest, fetchAdPaymentSettings } from '../services/adPaymentService';

interface AdvertiseModalProps { isOpen: boolean; onClose: () => void; }

type Step = 'design' | 'payment' | 'pending';

export const AdvertiseModal: React.FC<AdvertiseModalProps> = ({ isOpen, onClose }) => {
  const { items } = useDirectory();
  const { currentLocation } = useLocation();
  const verifiedStores = useMemo(() => items.filter(s => s.isClaimed && s.claimStatus === 'verified'), [items]);
  const [step, setStep] = useState<Step>('design');
  const [storeId, setStoreId] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [bg, setBg] = useState('#0f172a');
  const [text, setText] = useState('#ffffff');
  const [font, setFont] = useState('inherit');
  const [media, setMedia] = useState<string[]>([]);
  const [method, setMethod] = useState<'zaincash'|'mastercard'>('zaincash');
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const store = verifiedStores.find(s => s.id === storeId) || verifiedStores[0];
  const scope = currentLocation.districtId && currentLocation.districtId !== 'all' ? 'district' : currentLocation.governorateId && currentLocation.governorateId !== 'all' ? 'governorate' : 'iraq';
  const amount = scope === 'iraq' ? 25000 : scope === 'governorate' ? 15000 : 10000;
  const durationDays = 30;

  const reset = () => { setStep('design'); setError(''); setReference(''); setReceipt(''); setMedia([]); onClose(); };
  const readFiles = async (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files).slice(0, 5);
    const encoded = await Promise.all(selected.map(file => new Promise<string>((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(file); })));
    setMedia(encoded);
  };
  const readReceipt = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('حجم وصل الدفع يجب ألا يتجاوز 5 ميغابايت.'); return; }
    const r=new FileReader(); r.onload=()=>setReceipt(String(r.result)); r.readAsDataURL(file);
  };
  const openPayment = async () => {
    setError('');
    if (!store) return setError('لا يوجد متجر موثق بهذا الحساب. وثّق متجرك أولاً عبر OTP واتساب.');
    if (!headline.trim()) return setError('أدخل عنوان الإعلان.');
    if (!media.length) return setError('أضف صورة واحدة على الأقل للإعلان.');
    const s = await fetchAdPaymentSettings(); setSettings(s); setStep('payment');
  };
  const submit = async () => {
    setError('');
    if (!reference.trim()) return setError('أدخل رقم عملية التحويل.');
    if (!receipt) return setError('أرفق صورة وصل التحويل.');
    setLoading(true);
    const res = await createAdPaymentRequest({
      storeId: store.id, storeName: store.name, planScope: scope, governorateId: currentLocation.governorateId,
      districtId: currentLocation.districtId, categoryId: store.category, headline, description, imageUrl: media[0],
      phone: store.phone, whatsapp: store.whatsapp, offerBadge: badge, durationDays, amount,
      paymentMethod: method, transferReference: reference, receiptData: receipt, textColor: text,
      backgroundColor: bg, fontFamily: font, mediaType: media.length > 1 ? 'slideshow' : 'image', mediaItems: media,
      design: { backgroundColor:bg, textColor:text, fontFamily:font },
    });
    setLoading(false);
    if (!res.success) return setError(res.error || 'تعذر إرسال طلب الدفع.');
    setStep('pending');
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
    <div className="w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-rose-600 text-white">
        <div><h3 className="font-bold text-lg">إنشاء إعلان ممول</h3><p className="text-xs text-white/80">للمتاجر الموثقة فقط • نشر بعد مراجعة الدفع</p></div>
        <button onClick={reset} className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center"><X className="h-5 w-5"/></button>
      </div>
      <div className="p-5 space-y-5">
        {step === 'design' && <>
          {verifiedStores.length === 0 ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-amber-600"/><h4 className="mt-2 font-bold">يجب توثيق المتجر أولاً</h4><p className="text-sm text-slate-600 mt-1">التوثيق يتم من خلال رقم هاتف المتجر ورمز OTP عبر واتساب.</p></div> : <>
            <label className="block text-sm font-bold">المتجر الموثق<select value={storeId || verifiedStores[0].id} onChange={e=>setStoreId(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white">{verifiedStores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <div className="grid gap-3"><input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="عنوان الإعلان" className="rounded-xl border p-3"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="وصف الإعلان" className="rounded-xl border p-3 min-h-24"/><input value={badge} onChange={e=>setBadge(e.target.value)} placeholder="الشارة أو العرض (اختياري)" className="rounded-xl border p-3"/></div>
            <div className="grid grid-cols-2 gap-3"><label className="rounded-xl border p-3 text-sm font-bold">لون الخلفية<input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="block mt-2 w-full h-10"/></label><label className="rounded-xl border p-3 text-sm font-bold">لون الخط<input type="color" value={text} onChange={e=>setText(e.target.value)} className="block mt-2 w-full h-10"/></label></div>
            <label className="block text-sm font-bold">نوع الخط<select value={font} onChange={e=>setFont(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="inherit">الافتراضي</option><option value="Arial">Arial</option><option value="Tahoma">Tahoma</option><option value="sans-serif">Sans</option><option value="serif">Serif</option></select></label>
            <label className="block rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center cursor-pointer"><ImagePlus className="mx-auto h-8 w-8 text-slate-400"/><span className="block mt-2 font-bold">أضف صورة ثابتة أو عدة صور متحركة</span><span className="text-xs text-slate-500">حتى 5 صور</span><input type="file" accept="image/*" multiple onChange={e=>readFiles(e.target.files)} className="hidden"/></label>
            {media.length>0 && <div className="grid grid-cols-5 gap-2">{media.map((m,i)=><img key={i} src={m} className="aspect-square object-cover rounded-xl border"/>)}</div>}
            <div className="rounded-2xl bg-slate-50 border p-4"><div className="font-bold">نطاق الإعلان: {scope==='iraq'?'عموم العراق 🇮🇶':scope==='governorate'?'المحافظة':'المنطقة/القضاء'}</div><div className="text-amber-700 font-black text-lg mt-1">{amount.toLocaleString('ar-IQ')} د.ع / 30 يوم</div></div>
            {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
            <button onClick={openPayment} className="w-full rounded-xl bg-amber-600 text-white py-3 font-bold">مراجعة الإعلان والدفع</button>
          </>}
        </>}
        {step === 'payment' && <>
          <div className="rounded-2xl p-4 text-white" style={{background:bg}}><div className="font-bold text-xl" style={{color:text,fontFamily:font}}>{headline||'عنوان الإعلان'}</div><div className="text-sm mt-2 opacity-90">{description}</div></div>
          <div className="rounded-2xl bg-slate-50 border p-4"><h4 className="font-bold">قيمة الإعلان: {amount.toLocaleString('ar-IQ')} د.ع</h4><p className="text-xs text-slate-500 mt-1">سيبقى الإعلان قيد المراجعة حتى يتأكد المدير من التحويل.</p></div>
          <div className="grid grid-cols-2 gap-2"><button onClick={()=>setMethod('zaincash')} className={`rounded-xl border p-3 font-bold ${method==='zaincash'?'border-emerald-500 bg-emerald-50':''}`}><Smartphone className="mx-auto mb-1"/>زين كاش</button><button onClick={()=>setMethod('mastercard')} className={`rounded-xl border p-3 font-bold ${method==='mastercard'?'border-blue-500 bg-blue-50':''}`}><CreditCard className="mx-auto mb-1"/>Mastercard</button></div>
          <div className="rounded-2xl border p-4 space-y-2"><div className="text-xs text-slate-500">حوّل المبلغ إلى:</div><div className="font-black text-lg ltr" dir="ltr">{method==='zaincash'?(settings?.zaincashNumber||'سيتم عرضه من الخادم'):(settings?.mastercardAccount||'سيتم عرضه من الخادم')}</div><button onClick={()=>navigator.clipboard?.writeText(method==='zaincash'?settings?.zaincashNumber||'':settings?.mastercardAccount||'')} className="text-xs font-bold text-blue-600 flex items-center gap-1"><Copy className="h-3 w-3"/>نسخ الرقم</button></div>
          <input value={reference} onChange={e=>setReference(e.target.value)} placeholder="رقم عملية التحويل" className="w-full rounded-xl border p-3"/>
          <label className="block rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center cursor-pointer"><Upload className="mx-auto h-7 w-7 text-slate-400"/><span className="block font-bold mt-1">إرفاق وصل التحويل</span><input type="file" accept="image/*,application/pdf" onChange={e=>readReceipt(e.target.files?.[0])} className="hidden"/></label>
          {receipt && <div className="text-xs text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/>تم إرفاق الوصل</div>}
          {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
          <button disabled={loading} onClick={submit} className="w-full rounded-xl bg-emerald-600 disabled:opacity-50 text-white py-3 font-bold">{loading?'جاري الإرسال...':'إرسال الطلب للمراجعة'}</button>
        </>}
        {step === 'pending' && <div className="text-center py-10"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600"/><h4 className="text-xl font-black mt-4">تم إرسال طلب الإعلان</h4><p className="text-sm text-slate-600 mt-2">سيبقى الإعلان غير منشور حتى يتحقق المدير من الدفع ويوافق عليه.</p><button onClick={reset} className="mt-6 rounded-xl bg-slate-900 text-white px-6 py-3 font-bold">إغلاق</button></div>}
      </div>
    </div>
  </div>;
};
