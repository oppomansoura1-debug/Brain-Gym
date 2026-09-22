import React from 'react';
import { SystemNotification, UserRole } from '../types';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Clock,
  UserX,
  Award,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen?: boolean;
  notifications?: SystemNotification[];
  currentRole?: UserRole;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectTab?: (tab: string) => void;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  notifications = [],
  currentRole = 'admin',
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectTab,
  onClose,
}) => {
  if (isOpen === false) return null;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  // Filter notifications based on role: 'all' or specifically matching currentRole
  const visibleNotifications = safeNotifications.filter(
    n => n && (!n.targetRole || n.targetRole === 'all' || n.targetRole === currentRole)
  );

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'absence_alert':
        return <UserX className="w-5 h-5 text-rose-600" />;
      case 'grade_warning':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'payment_received':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'backup_success':
      case 'security_event':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'financial_due':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'task_reminder':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'chat_message':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">نظام الإشعارات والتنبيهات الفورية</h3>
              <p className="text-[11px] text-slate-300">متابعة دقيقة للحضور والغياب، الأداء الدراسي، والعمليات المالية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action sub-bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">
            غير المقروءة: <span className="text-indigo-600 font-bold">{unreadCount}</span> من أصل {visibleNotifications.length}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto p-2">
          {visibleNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>لا توجد إشعارات جديدة حالياً</p>
            </div>
          ) : (
            visibleNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkAsRead(notif.id);
                  if (notif.linkTab && onSelectTab) {
                    onSelectTab(notif.linkTab);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl transition flex items-start gap-3 cursor-pointer ${
                  notif.read ? 'hover:bg-slate-50 opacity-80' : 'bg-indigo-50/50 hover:bg-indigo-50/80'
                }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-800' : 'text-indigo-950'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
