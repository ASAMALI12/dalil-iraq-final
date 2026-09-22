import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Store,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  LogOut,
  Unlock,
  KeyRound,
  Send,
  Eye,
  Building2,
  MapPin,
  Phone,
  User,
  Bell,
  RefreshCw,
  Database,
  Upload,
  Megaphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../context/WalletContext';
import { useDirectory } from '../context/DirectoryContext';
import { useNotification } from '../context/NotificationContext';
import { DirectoryItem, Category } from '../types/shatrah';
import { validateIraqPhone, normalizeIraqPhone } from '../utils/iraqPhoneValidator';
import { safeApiFetch } from '../utils/apiClient';
import { ManagerDataImportTab } from './ManagerDataImportTab';
import { ManagerClaimsTab } from './ManagerClaimsTab';
import { ManagerAdsTab } from './ManagerAdsTab';

interface ManagerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewStore?: (store: DirectoryItem) => void;
  onOpenWalletModal?: () => void;
}

export const ManagerDashboardModal: React.FC<ManagerDashboardModalProps> = ({
  isOpen,
  onClose,
  onPreviewStore,
  onOpenWalletModal,
}) => {
  const {
    balance,
    transactions,
    totalEarnings,
    totalWithdrawn,
    isManagerUnlocked,
    managerCredentials,
    loginManager,
    lockManager,
    updateManagerCredentials,
    setCustomBalance,
    resetBalance,
    addManualAdjustment,
    deleteTransaction,
    clearTransactions,
    withdraw,
    deposit,
  } = useWallet();

  const {
    items,
    categories,
    deleteStore,
    addStore,
    reports,
    resolveReport,
    deleteReport,
    isSupabaseLoading,
    isUsingSupabase,
    supabaseStoreCount,
    refreshFromSupabase,
    seedToSupabase,
  } = useDirectory();
  const { broadcastNewStoreNotification, broadcastNotification } = useNotification();

  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');

  // Navigation & Sub-tabs
  const [activeTab, setActiveTab] = useState<'stores' | 'import' | 'claims' | 'reports' | 'ads' | 'broadcast' | 'security'>('stores');

  // Manager Login State (Phone + Username + Password)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Store Management State
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // New Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreOwner, setNewStoreOwner] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('restaurants');
  const [newStoreSubCategory, setNewStoreSubCategory] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreWorkingHours, setNewStoreWorkingHours] = useState('9:00 ص - 10:00 م');
  const [newStoreDesc, setNewStoreDesc] = useState('');
  const [newStoreImage, setNewStoreImage] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  );

  // Wallet Edit/Adjustment State
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [customBalanceInput, setCustomBalanceInput] = useState(balance.toString());
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Withdrawal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'zaincash' | 'mastercard'>('zaincash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawCardNumber, setWithdrawCardNumber] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('مصرف الرافدين');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState('');

  // Security & Credentials Update State
  const [currPass, setCurrPass] = useState('');
  const [newPhone, setNewPhone] = useState(managerCredentials.phone);
  const [newUsername, setNewUsername] = useState(managerCredentials.username);
  const [newPassword, setNewPassword] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState('');
  const [securityErrorMsg, setSecurityErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Manager Login (Phone + Username + Password)
  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const resp = await safeApiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim(),
          phone: loginPhone.trim(),
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success && data.token) {
        sessionStorage.setItem('iraq_admin_token', data.token);
        loginManager(loginPhone, loginUsername, loginPassword);
        setLoginPhone('');
        setLoginUsername('');
        setLoginPassword('');
        confetti({ particleCount: 50, spread: 70 });
        return;
      } else if (!resp.ok) {
        setLoginError(data.error || 'بيانات تسجيل الدخول غير صحيحة.');
        return;
      }
    } catch {
      // Fall through to local fallback if offline
    }

    const res = loginManager(loginPhone, loginUsername, loginPassword);
    if (res.success) {
      setLoginPhone('');
      setLoginUsername('');
      setLoginPassword('');
      confetti({ particleCount: 50, spread: 70 });
    } else {
      setLoginError(res.message || 'بيانات الدخول غير صحيحة!');
    }
  };

  const handleManagerLogout = async () => {
    try {
      const token = sessionStorage.getItem('iraq_admin_token');
      if (token) {
        await safeApiFetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Continue client logout
    }
    lockManager();
    onClose();
  };

  // Filtered Stores
  const filteredStores = items.filter((store) => {
    const matchCat = selectedCategoryFilter === 'all' || store.category === selectedCategoryFilter;
    const matchQuery =
      !storeSearch.trim() ||
      store.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      store.address.toLowerCase().includes(storeSearch.toLowerCase()) ||
      store.subCategory?.toLowerCase().includes(storeSearch.toLowerCase()) ||
      store.phone.includes(storeSearch);
    return matchCat && matchQuery;
  });

  // Handle Delete Store
  const confirmDeleteStore = (store: DirectoryItem) => {
    deleteStore(store.id);
    setDeletingStoreId(null);
    setDeleteSuccessMsg(`تم حذف متجر "${store.name}" نهائياً من دليل العراق بنجاح.`);
    setTimeout(() => setDeleteSuccessMsg(''), 4000);
  };

  // Handle Add New Store by Manager
  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    if (!newStorePhone.trim()) {
      alert('يجب إدخال رقم هاتف عراقي حقيقي لتمكين تواصل الزبائن مع المتجر.');
      return;
    }

    const phoneValidation = validateIraqPhone(newStorePhone);
    if (!phoneValidation.isValid) {
      alert(`رقم الهاتف غير صالح: ${phoneValidation.reason}\nيجب إدخال رقم هاتف عراقي حقيقي لشبكات زين، آسيا سيل، أو كورك.`);
      return;
    }

    const newId = `store-${Date.now()}`;
    const cleanPhone = phoneValidation.formattedDisplay || phoneValidation.normalized;
    const cleanWhatsapp = phoneValidation.normalized;

    const newStore: DirectoryItem = {
      id: newId,
      name: newStoreName.trim(),
      category: newStoreCategory,
      subCategory: newStoreSubCategory.trim() || 'نشاط تجاري موثق',
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      address: newStoreAddress.trim() || 'العراق - المركز العام',
      rating: 5.0,
      reviewsCount: 1,
      isOpen: true,
      workingHours: newStoreWorkingHours.trim(),
      imageUrl: newStoreImage,
      description: newStoreDesc.trim() || 'متجر مسجل رسمياً بواسطة إدارة دليل العراق.',
      tags: ['متجر جديد', 'دليل العراق', newStoreOwner.trim() || 'المدير'],
      source: 'manual_registration',
      phoneReliability: 'admin_confirmed',
    };

    addStore(newStore);
    broadcastNewStoreNotification(newStore);

    // Reset Form
    setNewStoreName('');
    setNewStoreOwner('');
    setNewStoreSubCategory('');
    setNewStorePhone('');
    setNewStoreAddress('');
    setNewStoreDesc('');
    setIsAddStoreOpen(false);

    confetti({ particleCount: 60, spread: 70 });
  };

  // Handle Direct Balance Edit
  const handleSaveCustomBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(customBalanceInput);
    if (!isNaN(num) && num >= 0) {
      setCustomBalance(num);
      setIsEditBalanceOpen(false);
    }
  };

  // Handle Manual Adjustment
  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(adjustmentAmount);
    if (!isNaN(amt) && amt !== 0) {
      addManualAdjustment(amt, adjustmentReason || 'تسوية رصيد يدوي');
      setAdjustmentAmount('');
      setAdjustmentReason('');
    }
  };

  // Handle Withdrawal Submit
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;

    const res = withdraw(withdrawAmount, withdrawMethod, {
      accountName: withdrawAccountName,
      phoneNumber: withdrawMethod === 'zaincash' ? withdrawPhone : undefined,
      cardNumber: withdrawMethod !== 'zaincash' ? withdrawCardNumber || '**** **** **** 4892' : undefined,
      bankName: withdrawMethod !== 'zaincash' ? withdrawBank : undefined,
    });

    if (res.success) {
      setWithdrawMsg(`تم سحب مبلغ ${withdrawAmount.toLocaleString('ar-IQ')} د.ع بنجاح (رقم الإيصال: ${res.referenceNumber})`);
      setIsWithdrawOpen(false);
      confetti({ particleCount: 50, spread: 60 });
      setTimeout(() => setWithdrawMsg(''), 5000);
    } else {
      alert(res.message);
    }
  };

  // Handle Broadcast Send
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    broadcastNotification({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: 'system',
      badge: 'تنبيه الإدارة',
    });

    setBroadcastSuccessMsg('تم بث الإشعار بنجاح لجميع مستخدمي تطبيق دليل العراق!');
    setBroadcastTitle('');
    setBroadcastMessage('');
    confetti({ particleCount: 60, spread: 70 });
    setTimeout(() => setBroadcastSuccessMsg(''), 4000);
  };

  // Handle Update Security Credentials
  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg('');
    setSecuritySuccessMsg('');

    const res = updateManagerCredentials(
      currPass,
      newPhone || managerCredentials.phone,
      newUsername || managerCredentials.username,
      newPassword || managerCredentials.password
    );

    if (res.success) {
      setSecuritySuccessMsg(res.message || 'تم تحديث بيانات الدخول بنجاح!');
      setCurrPass('');
      setNewPassword('');
      setTimeout(() => setSecuritySuccessMsg(''), 4000);
    } else {
      setSecurityErrorMsg(res.message || 'فشل التحديث، تأكد من كلمة المرور الحالية');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl border border-red-500/30 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="border-b border-slate-800 p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white font-bold text-xl shadow-lg shadow-red-950">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-white">
                  لوحة تحكم إدارة التطبيق (المدير العام)
                </h3>
                <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  لوحة سرية خاصة 🔒
                </span>
              </div>
              <p className="text-xs text-slate-400">
                التحكم الكامل بالمحفظة والأرباح • حذف وإدارة المتاجر • صلاحيات المدير الحصرية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isManagerUnlocked && (
              <button
                type="button"
                onClick={handleManagerLogout}
                className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition-all cursor-pointer"
                title="تسجيل خروج المدير"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>تسجيل خروج</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Section: If Locked, Show 3-Field Manager Login (Phone + Username + Password) */}
        {!isManagerUnlocked ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 flex-1 overflow-y-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-600 to-red-600 text-white shadow-2xl shadow-red-900/50">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h4 className="font-display text-lg sm:text-xl font-bold text-white">
                تسجيل دخول المدير (رقم الهاتف + اليوزر + الباسوورد)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يدخل المستخدم العادي بدون أي تسجيل، بينما يفتح المدير النظام بصلاحيات إدارية حصرية من ضمنها ظهور المحفظة، حذف المتاجر، والتحكم بالأرباح.
              </p>
            </div>

            <form onSubmit={handleManagerLogin} className="w-full max-w-sm space-y-3.5 text-right">
              
              {/* 1. Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم هاتف المدير *
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute right-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="مثال: 07801234567"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pr-9 pl-3 text-xs font-mono font-bold text-white focus:border-red-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* 2. Username */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم المستخدم (اليوزر / Username) *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute right-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="مثال: admin"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pr-9 pl-3 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  كلمة المرور (الباسوورد / Password) *
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute right-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pr-9 pl-3 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl bg-rose-950/80 border border-rose-500/50 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                <Unlock className="h-4 w-4" />
                <span>دخول المدير وتفعيل صلاحيات المحفظة والحذف</span>
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Dashboard */
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('stores')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'stores'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Store className="h-4 w-4" />
                <span>المتاجر ({items.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'import'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Upload className="h-4 w-4 text-sky-400" />
                <span>استيراد وتوزيع البيانات ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('claims')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'claims'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>توثيقات الملكية</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>البلاغات</span>
                {reports.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {reports.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ads')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'ads'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Megaphone className="h-4 w-4 text-amber-400" />
                <span>الإعلانات الممولة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('broadcast')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'broadcast'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>بث إشعار</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 font-display text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>الأمان</span>
              </button>
            </div>

            {/* Notification Alert Message */}
            {deleteSuccessMsg && (
              <div className="bg-emerald-900/60 border-b border-emerald-500/40 p-3 text-xs font-bold text-emerald-200 flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {deleteSuccessMsg}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteSuccessMsg('')}
                  className="text-emerald-300 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {withdrawMsg && (
              <div className="bg-amber-900/60 border-b border-amber-500/40 p-3 text-xs font-bold text-amber-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>{withdrawMsg}</span>
              </div>
            )}

            {/* Main Tab Content */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
              
              {/* TAB 1: WALLET FULL CONTROL */}
              {activeTab === 'broadcast' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700 space-y-1">
                    <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-500" />
                      بث إشعار منبثق فوري لجميع المستخدمين
                    </h4>
                    <p className="text-xs text-slate-400">
                      سيظهر هذا الإشعار فورا في شريط التنبيهات المنبثق أعلى الشاشة عند فتح التطبيق لجميع أهالي الشطرة.
                    </p>
                  </div>

                  {broadcastSuccessMsg && (
                    <div className="rounded-xl bg-emerald-900/80 border border-emerald-500/50 p-3 text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{broadcastSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-3.5 rounded-2xl bg-slate-950 p-5 border border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        عنوان الإشعار *
                      </label>
                      <input
                        type="text"
                        required
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="مثال: 📢 تنبيه هام من إدارة دليل الشطرة"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        نص الرسالة / الإشعار *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="اكتب تفاصيل التنبيه أو التهنئة أو الخبر لجميع المستخدمين..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md hover:from-red-700 hover:to-rose-700 cursor-pointer transition-all"
                    >
                      <Send className="h-4 w-4" />
                      <span>إرسال وبث الإشعار لجميع الهواتف الآن</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: SECURITY & CREDENTIALS UPDATE */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700 space-y-1">
                    <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-amber-400" />
                      تحديث بيانات دخول المدير (رقم الهاتف، اليوزر، الباسوورد)
                    </h4>
                    <p className="text-xs text-slate-400">
                      يمكنك تخصيص بيانات اعتمادك الإدارية لتأمين دخولك للبرنامج.
                    </p>
                  </div>

                  {securitySuccessMsg && (
                    <div className="rounded-xl bg-emerald-900/80 border border-emerald-500/50 p-3 text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{securitySuccessMsg}</span>
                    </div>
                  )}

                  {securityErrorMsg && (
                    <div className="rounded-xl bg-rose-950/80 border border-rose-500/50 p-3 text-xs font-bold text-rose-300 flex items-center gap-2 animate-in fade-in">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>{securityErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateSecurity} className="space-y-3.5 rounded-2xl bg-slate-950 p-5 border border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        رقم هاتف المدير الجديد *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="0780xxxxxxx"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        اسم المستخدم الجديد (اليوزر) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        كلمة المرور الجديدة (الباسوورد) *
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="اترك فارغاً للإبقاء على كلمة المرور الحالية"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        كلمة المرور الحالية لتأكيد التغيير *
                      </label>
                      <input
                        type="password"
                        required
                        value={currPass}
                        onChange={(e) => setCurrPass(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية"
                        className="w-full rounded-xl border border-amber-600/50 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md hover:from-red-700 hover:to-rose-700 cursor-pointer transition-all"
                    >
                      حفظ وتحديث بيانات المدير
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
