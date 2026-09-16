import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { User, CenterSettings } from '../types';
import { BrainGymLogo } from './BrainGymLogo';
import { AppDownloadBanner } from './AppDownloadBanner';

interface LoginScreenProps {
  users: User[];
  settings: CenterSettings;
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  settings,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by email OR username
      const matchedUser = users.find(u => 
        (u.email.toLowerCase() === cleanIdentifier || u.username.toLowerCase() === cleanIdentifier)
      );

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage('اسم المستخدم أو البريد الإلكتروني غير صحيح');
        return;
      }

      // Check password
      if (matchedUser.password && matchedUser.password !== cleanPassword) {
        setIsLoading(false);
        setErrorMessage('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none" dir="rtl">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Center Logo */}
        <div className="flex justify-center mb-4">
          <BrainGymLogo size="xl" />
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
          <span>Brain</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">GYM</span>
          <span className="text-sm font-bold text-slate-400 mr-1">التعليمي</span>
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          منظومة التدريب العقلي وإدارة المركز التعليمي المتطورة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">تسجيل الدخول للمنظومة</h3>
                <p className="text-[11px] text-slate-400">الدخول مقصور فقط على المستخدمين المعتمدين</p>
              </div>
            </div>

            {/* تحميل التطبيق المناسب لنظام التشغيل تحت تسجيل الدخول */}
            <AppDownloadBanner />
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin أو البريد الإلكتروني"
                  required
                  autoFocus
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 pl-10 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder:text-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>نظام مشفر ومحمي بكلمة مرور وصلاحيات دور محكمة (RBAC)</span>
        </div>
      </div>
    </div>
  );
};
