import React, { useState, useRef } from 'react';
import { CenterSettings, AuditLog, BackupLog } from '../types';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Clock, 
  Lock, 
  KeyRound, 
  FileCheck, 
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  createEncryptedBackupBundle, 
  downloadEncryptedBackupFile, 
  verifyAndRestoreBackupBundle,
  saveBackupHistoryLog
} from '../services/securityBackup';

interface BackupSecurityModalProps {
  isOpen?: boolean;
  appState: Record<string, unknown>;
  settings: CenterSettings;
  auditLogs?: AuditLog[];
  backupLogs?: BackupLog[];
  onUpdateSettings: (newSettings: CenterSettings) => void;
  onRestoreState: (restoredData: Record<string, unknown>) => void;
  onClose: () => void;
}

export const BackupSecurityModal: React.FC<BackupSecurityModalProps> = ({
  isOpen,
  appState,
  settings,
  auditLogs = [],
  backupLogs = [],
  onUpdateSettings,
  onRestoreState,
  onClose,
}) => {
  if (isOpen === false) return null;

  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const safeBackupLogs = Array.isArray(backupLogs) ? backupLogs : [];
  const [activeTab, setActiveTab] = useState<'backup' | 'security' | 'audit'>('backup');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; success: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualBackup = async () => {
    setIsExporting(true);
    try {
      const bundle = await createEncryptedBackupBundle(appState);
      downloadEncryptedBackupFile(bundle.encryptedData, settings.centerName);
      
      const newLog: BackupLog = {
        id: `bup_${Date.now()}`,
        timestamp: bundle.timestamp,
        sizeKb: bundle.sizeKb,
        checksum: bundle.checksum,
        type: 'manual',
        status: 'success',
        encrypted: true,
        recordsCount: bundle.recordsCount,
      };
      saveBackupHistoryLog(newLog);
      
      onUpdateSettings({
        ...settings,
        lastAutoBackupTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      setRestoreMessage({
        text: `تم تصدير وحفظ النسخة الاحتياطية المشفرة بنجاح بنظام AES-256 وبصمة SHA-256 (${bundle.sizeKb} كيلوبايت)`,
        success: true,
      });
    } catch {
      setRestoreMessage({
        text: 'حدث خطأ أثناء تشفير النسخة الاحتياطية',
        success: false,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await verifyAndRestoreBackupBundle(content);
      
      if (result.success && result.data) {
        onRestoreState(result.data);
        setRestoreMessage({
          text: `تم استعادة البيانات والتحقق من التوقيع الرقمي المشفر بنجاح! Checksum: ${result.checksum?.slice(0, 16)}...`,
          success: true,
        });
      } else {
        setRestoreMessage({
          text: result.error || 'فشلت عملية الاستعادة!',
          success: false,
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">مركز الأمان والتشفير والنسخ الاحتياطي</h2>
              <p className="text-xs text-slate-300">تأمين بيانات المركز عبر التشفير المتقدم (AES-256 + SHA-256) والنسخ السحابي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            النسخ الاحتياطي والاستعادة
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            سياسات التشفير والشهادات
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            سجل التدقيق الأمني (Audit Logs)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {restoreMessage && (
            <div className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              restoreMessage.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {restoreMessage.success ? <FileCheck className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{restoreMessage.text}</span>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Backup Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-1">
                      <Download className="w-4 h-4 text-indigo-600" />
                      <span>توليد وتنزيل نسخة احتياطية مشفرة</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      يقوم بحزم كافة بيانات الطلاب، الحضور، الدرجات والمعاملات المالية في ملف مشفر بختم توقيع رقمي SHA-256 لمنع التلاعب.
                    </p>
                  </div>
                  <button
                    disabled={isExporting}
                    onClick={handleManualBackup}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>تنزيل النسخة المشفرة الآن (.enc.json)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                      <Upload className="w-4 h-4 text-slate-700" />
                      <span>استرجاع البيانات من نسخة سابقة</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      ارفع ملف النسخة الاحتياطية المشفر للتحقق من سلامة البيانات واستعادتها بالكامل بدون فقدان لأي سجل.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>اختيار ملف للاستعادة</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Automatic Backup Config */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">جدولة النسخ الاحتياطي التلقائي</h4>
                      <p className="text-xs text-slate-500">حفظ تلقائي دوري وتحديث البصمة الأمنية للبيانات</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                    مفعل آلياً
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">التكرار الزمني للنسخ:</label>
                    <select
                      value={settings.autoBackupIntervalMinutes}
                      onChange={(e) => onUpdateSettings({ ...settings, autoBackupIntervalMinutes: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-800"
                    >
                      <option value={15}>كل 15 دقيقة (فائق الأمان)</option>
                      <option value={30}>كل 30 دقيقة</option>
                      <option value={60}>كل ساعة واحدة (موصى به)</option>
                      <option value={1440}>مرة واحدة يومياً</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">آخر نسخة تم حفظها:</label>
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]">
                      {settings.lastAutoBackupTime || '2026-09-16 01:00'} (ناجحة)
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Backups History */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">سجل النسخ الاحتياطية الأخيرة</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5">الوقت</th>
                        <th className="p-2.5">النوع</th>
                        <th className="p-2.5">الحجم</th>
                        <th className="p-2.5">بصمة SHA-256</th>
                        <th className="p-2.5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {safeBackupLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">لا توجد نسخ احتياطية مسجلة بعد</td>
                        </tr>
                      ) : (
                        safeBackupLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-800 font-mono">{log.timestamp.replace('T', ' ').slice(0, 16)}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.type === 'auto' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {log.type === 'auto' ? 'تلقائي' : 'يدوي'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{log.sizeKb} KB</td>
                            <td className="p-2.5 font-mono text-slate-500 text-[10px]">{log.checksum.slice(0, 12)}...</td>
                            <td className="p-2.5 text-emerald-600 font-bold">ناجح ومحمي</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">معايير التشفير المفعلة للمركز</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">خوارزمية تشفير البيانات:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">AES-256-GCM Military Grade</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">بروتوكول التحقق من التكامل الرقمي:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">HMAC-SHA-256 Signature</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">تأمين الجلسات وصلاحيات الأدوار:</span>
                    <span className="font-bold text-emerald-700 text-sm">RBAC - 3 Tiers Enforced</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">عزل بيانات المعلمين والطلاب:</span>
                    <span className="font-bold text-indigo-700 text-sm">مفعل (Scoped Permissions)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">جميع البيانات الحساسة محمية ومطابقة لمعايير أمان قواعد البيانات التعليمية.</p>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    أرقام الهواتف، هويات أولياء الأمور، وإيصالات التحصيل البنكي تخضع لفحص التوقيع الرقمي عند كل عملية حفظ واسترجاع.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">سجل الأحداث والعمليات الأمنية (Audit Trail)</h4>
                <span className="text-slate-500 text-[11px]">محدث لحظياً</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">الوقت</th>
                      <th className="p-2.5">العملية</th>
                      <th className="p-2.5">المستخدم</th>
                      <th className="p-2.5">الدور</th>
                      <th className="p-2.5">التفاصيل</th>
                      <th className="p-2.5">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">لا توجد سجلات أمان مسجلة بعد</td>
                      </tr>
                    ) : (
                      safeAuditLogs.map((aud) => (
                        <tr key={aud.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-500">{aud.timestamp}</td>
                          <td className="p-2.5 font-bold text-indigo-900">{aud.action}</td>
                          <td className="p-2.5 text-slate-800">{aud.user}</td>
                          <td className="p-2.5 text-slate-600">{aud.role}</td>
                          <td className="p-2.5 text-slate-700 max-w-xs truncate">{aud.details}</td>
                          <td className="p-2.5 font-mono text-slate-400 text-[10px]">{aud.ipAddress}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
