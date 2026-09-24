import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

interface AdminLoginProps {
  isPage?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginProps> = ({ isPage = false }) => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, setIsAdminDashboardOpen, showToast } = useShop();
  const {
    loginWithEmail,
    resetPassword,
    loginWithGoogle,
    error,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Password Reset View States
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isPage && !isAdminLoginOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim()) {
      setLocalError('অনুগ্রহ করে ইমেইল প্রদান করুন');
      return;
    }

    if (!password) {
      setLocalError('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);

    try {
      // Pass exact password without escaping or truncating
      await loginWithEmail(email.trim(), password);
      showToast('অ্যাডমিন প্যানেলে স্বাগতম!', 'success');
      setIsAdminLoginOpen(false);
      setIsAdminDashboardOpen(true);
      window.location.hash = 'admin';
    } catch (err: unknown) {
      const e = err as Error;
      setLocalError(e.message || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('অনুগ্রহ করে আপনার ইমেইল অ্যাড্রেসটি লিখুন।');
      return;
    }

    setLoading(true);

    try {
      // Securely dispatch reset email without leaking email validity
      await resetPassword(cleanEmail);
      setResetSent(true);
      setResendCooldown(60);
      showToast('পাসওয়ার্ড রিসেটের অনুরোধ সফলভাবে সম্পন্ন হয়েছে।', 'info');
    } catch (err: unknown) {
      const e = err as Error;
      setLocalError(e.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError('');
    try {
      await loginWithGoogle();
      showToast('গুগল সাইন-ইন সফল হয়েছে!', 'success');
      setIsAdminLoginOpen(false);
      setIsAdminDashboardOpen(true);
      window.location.hash = 'admin';
    } catch {
      setLocalError('গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 relative p-6 sm:p-8">
      {/* Close button if rendered as modal */}
      {!isPage && (
        <button
          onClick={() => {
            clearError();
            setIsAdminLoginOpen(false);
            setIsResetMode(false);
            setResetSent(false);
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Icon */}
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-800 shadow-inner">
        {isResetMode ? <KeyRound className="w-8 h-8" /> : <ShieldCheck className="w-9 h-9" />}
      </div>

      {/* Header text */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {isResetMode ? 'পাসওয়ার্ড রিসেট' : 'অ্যাডমিন পোর্টাল লগইন'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          {isResetMode
            ? 'আপনার অ্যাডমিন ইমেইল অ্যাড্রেসটি লিখুন। অ্যাকাউন্টটি নিবন্ধিত থাকলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হবে।'
            : 'ওয়েবসাইট ম্যানেজমেন্ট ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন'}
        </p>
      </div>

      {/* Error Alert */}
      {(localError || error) && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-start gap-2 border border-red-200 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{localError || error}</span>
        </div>
      )}

      {/* MODE 1: PASSWORD RESET FORM */}
      {isResetMode ? (
        <div className="space-y-4">
          {resetSent ? (
            /* Success confirmation card without exposing email existence */
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-900">অনুরোধটি সফলভাবে গৃহীত হয়েছে!</p>
                  <p className="text-emerald-800/90 leading-relaxed">
                    যদি <strong>{email}</strong> অ্যাকাউন্টটি আমাদের সিস্টেমে নিবন্ধিত থাকে, তবে একটি
                    পাসওয়ার্ড রিসেট করার লিঙ্ক পাঠানো হয়েছে।
                  </p>
                  <p className="text-[11px] text-emerald-700 pt-1">
                    অনুগ্রহ করে আপনার ইনবক্স এবং স্প্যাম (Spam/Junk) ফোল্ডার চেক করুন।
                  </p>
                </div>
              </div>

              {/* Resend button with cooldown */}
              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={loading || resendCooldown > 0}
                  onClick={handleResetSubmit}
                  className="font-bold text-emerald-700 hover:text-emerald-900 disabled:text-slate-400 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `পুনরায় লিঙ্ক পাঠান (${resendCooldown}s)`
                      : 'পুনরায় লিঙ্ক পাঠান'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setEmail('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  অন্য ইমেইল দিন
                </button>
              </div>
            </div>
          ) : (
            /* Reset request form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নিবন্ধিত অ্যাডমিন ইমেইল:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  নিরাপত্তার স্বার্থে ইমেইলের বৈধতা জনসমক্ষে প্রকাশ করা হয় না।
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>পাসওয়ার্ড রিসেট লিঙ্ক পাঠান</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetSent(false);
                setLocalError('');
                clearError();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>লগইন ফর্মে ফিরে যান</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODE 2: STANDARD LOGIN FORM */
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস:</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">পাসওয়ার্ড:</label>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setResetSent(false);
                  setLocalError('');
                  clearError();
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>লগইন করুন</span>
              </>
            )}
          </button>

          {/* Google Sign-in Alternative */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>গুগল অ্যাকাউন্টে লগইন</span>
            </button>
          </div>
        </form>
      )}

      {/* Return to Customer Storefront link when viewed as page */}
      {isPage && (
        <div className="mt-5 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              window.history.pushState(null, '', '/');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
          >
            ← গ্রাহক ওয়েবসাইটে ফিরে যান
          </a>
        </div>
      )}
    </div>
  );

  if (isPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      {content}
    </div>
  );
};
