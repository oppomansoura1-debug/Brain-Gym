import React from 'react';
import { User, UserRole, SystemNotification, CenterSettings } from '../types';
import { BrainGymLogo } from './BrainGymLogo';
import { 
  GraduationCap, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  UserCheck, 
  Database,
  Briefcase,
  Menu,
  LayoutDashboard,
  Users,
  Layers,
  DollarSign,
  CalendarCheck,
  Award,
  LogOut,
  UserCog,
  BookOpen,
  RefreshCw,
  Check,
  MessageSquare,
  Calendar
} from 'lucide-react';

export interface HeaderProps {
  currentUser?: User;
  currentRole: UserRole;
  settings?: CenterSettings;
  notifications?: SystemNotification[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
  onOpenNotifications: () => void;
  onOpenPaymentGateway: () => void;
  onOpenBackupSecurity?: () => void;
  onOpenBackupModal?: () => void;
  onOpenUsersManagement?: () => void;
  onToggleMobileMenu?: () => void;
  onLogout?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  onOpenChat?: () => void;
  unreadMessagesCount?: number;
  onOpenCalendarTasks?: () => void;
  todayTasksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  settings,
  notifications = [],
  activeTab,
  onTabChange,
  onRoleChange,
  onOpenNotifications,
  onOpenPaymentGateway,
  onOpenBackupSecurity,
  onOpenBackupModal,
  onOpenUsersManagement,
  onToggleMobileMenu,
  onLogout,
  onManualSync,
  isSyncing = false,
  lastSyncTime,
  onOpenChat,
  unreadMessagesCount = 0,
  onOpenCalendarTasks,
  todayTasksCount = 0,
}) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadNotifs = safeNotifications.filter(
    n => n && !n.read && (n.targetRole === 'all' || n.targetRole === currentRole)
  ).length;

  const centerName = settings?.centerName || 'سنتر الأوائل التعليمي';
  const handleBackup = onOpenBackupSecurity || onOpenBackupModal || (() => {});

  const userName = currentUser?.name || (
    currentRole === 'admin' ? 'المدير العام' : currentRole === 'data_entry' ? 'مدخل البيانات' : 'أ. محمد إبراهيم'
  );
  const userAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const adminTabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'students', label: 'شؤون الطلاب', icon: Users },
    { id: 'teachers', label: 'المعلمون', icon: GraduationCap },
    { id: 'groups', label: 'المجموعات', icon: BookOpen },
    { id: 'stages', label: 'المراحل والمناهج', icon: Layers },
    { id: 'finance', label: 'المالية والخزينة', icon: DollarSign },
    { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck },
    { id: 'assessments', label: 'الدرجات والتقييم', icon: Award },
  ];

  const dataEntryTabs = [
    { id: 'students', label: 'شؤون الطلاب', icon: Users },
    { id: 'teachers', label: 'المعلمون', icon: GraduationCap },
    { id: 'groups', label: 'المجموعات', icon: BookOpen },
    { id: 'stages', label: 'المراحل والمناهج', icon: Layers },
    { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck },
  ];

  const activeNavTabs = currentRole === 'admin' ? adminTabs : currentRole === 'data_entry' ? dataEntryTabs : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Right side: Logo & Branding */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition"
                aria-label="القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <BrainGymLogo size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none flex items-center gap-1">
                    <span>Brain</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">GYM</span>
                    <span className="text-xs font-bold text-slate-500 mr-1 hidden xs:inline">التعليمي</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>مزامنة سحابية فورية</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 hidden sm:block">
                  المنظومة الذكية لإدارة شؤون الطلاب والمالية والتعليم
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Active Role Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/90 py-1.5 px-3.5 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">مستوى الصلاحية المسجل به:</span>
            {currentRole === 'admin' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
                <Briefcase className="w-3.5 h-3.5" />
                <span>المدير العام (Admin)</span>
              </span>
            )}
            {currentRole === 'data_entry' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
                <Database className="w-3.5 h-3.5" />
                <span>مدخل بيانات (Data Entry)</span>
              </span>
            )}
            {currentRole === 'teacher' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-600 text-white font-bold shadow-xs">
                <UserCheck className="w-3.5 h-3.5" />
                <span>معلم (Teacher)</span>
              </span>
            )}
          </div>

          {/* Left side: Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Payment Gateway Trigger (Admin only) */}
            {currentRole === 'admin' && onOpenPaymentGateway && (
              <button
                onClick={onOpenPaymentGateway}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                title="بوابة التحصيل الإلكتروني"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">دفع إلكتروني</span>
              </button>
            )}

            {/* Backup & Security Trigger (Admin only) */}
            {currentRole === 'admin' && (
              <button
                onClick={handleBackup}
                className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="النسخ الاحتياطي والأمان"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">النسخ والأمان</span>
              </button>
            )}

            {/* User Management Trigger (Only for Admin) */}
            {currentRole === 'admin' && onOpenUsersManagement && (
              <button
                onClick={onOpenUsersManagement}
                className="p-2 sm:px-3 sm:py-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="إدارة المستخدمين وصلاحيات الدخول"
              >
                <UserCog className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">المستخدمين والصلاحيات</span>
              </button>
            )}

            {/* Manual Cloud Sync Button (Adjacent to Notifications) */}
            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className={`relative p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                  isSyncing
                    ? 'bg-amber-50 border-amber-300 text-amber-800 cursor-wait'
                    : 'text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200'
                }`}
                title={lastSyncTime ? `مزامنة البيانات سحابياً (آخر مزامنة ناجحة: ${lastSyncTime})` : 'مزامنة وتأكيد حفظ أحدث البيانات في السحابة فوراً'}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-600' : 'text-indigo-600'}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? 'جارِ المزامنة...' : 'مزامنة سحابية'}
                </span>
                {lastSyncTime && !isSyncing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden lg:inline-block" title="متزامن"></span>
                )}
              </button>
            )}

            {/* Synchronized Calendar & Tasks Reminder */}
            {onOpenCalendarTasks && (
              <button
                onClick={onOpenCalendarTasks}
                className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="التقويم المتزامن وجدول المهام والتذكيرات"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">التقويم والمهام</span>
                {todayTasksCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {todayTasksCount}
                  </span>
                )}
              </button>
            )}

            {/* Internal Team Chat */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="الدردشة والرسائل الداخلية الفورية (نصوص، صور، صوت)"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">الدردشة الداخلية</span>
                {unreadMessagesCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications with counter */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Current Active User Preview */}
            <div className="hidden sm:flex items-center gap-2 pl-1 border-r border-slate-200 pr-3">
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-xl object-cover border border-slate-200"
              />
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {userName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold block">
                  {currentRole === 'admin' ? 'المدير' : currentRole === 'data_entry' ? 'مدخل بيانات' : 'معلم'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">خروج</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Active Role Display */}
        <div className="lg:hidden py-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-600">المستخدم الحالي:</span>
          <div className="flex items-center gap-1.5">
            {currentRole === 'admin' && (
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-600 text-white">
                المدير العام (Admin)
              </span>
            )}
            {currentRole === 'data_entry' && (
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white">
                مدخل بيانات (Data Entry)
              </span>
            )}
            {currentRole === 'teacher' && (
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-600 text-white">
                معلم (Teacher)
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs (For Admin and Data Entry) */}
        {activeNavTabs.length > 0 && onTabChange && (
          <nav className="border-t border-slate-100 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {activeNavTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

      </div>
    </header>
  );
};
