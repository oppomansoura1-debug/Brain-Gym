import React from 'react';
import { 
  FinancialTransaction, 
  Student, 
  Teacher, 
  AcademicStage, 
  AttendanceRecord, 
  StudentAssessment,
  SystemNotification
} from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  CreditCard, 
  AlertTriangle, 
  ShieldCheck, 
  UserX,
  Award,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  UserCog
} from 'lucide-react';
import { exportFinancialReportToExcel } from '../services/exportExcel';

interface AdminDashboardViewProps {
  students?: Student[];
  teachers?: Teacher[];
  stages?: AcademicStage[];
  transactions?: FinancialTransaction[];
  attendance?: AttendanceRecord[];
  attendanceRecords?: AttendanceRecord[];
  assessments?: StudentAssessment[];
  notifications?: SystemNotification[];
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenPaymentGateway?: () => void;
  onOpenPaymentModal?: () => void;
  onOpenBackupSecurity?: () => void;
  onOpenBackupModal?: () => void;
  onOpenUsersManagement?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  students = [],
  teachers = [],
  stages = [],
  transactions = [],
  attendance = [],
  attendanceRecords = [],
  assessments = [],
  notifications = [],
  onNavigateTab,
  onNavigate,
  onOpenPaymentGateway,
  onOpenPaymentModal,
  onOpenBackupSecurity,
  onOpenBackupModal,
  onOpenUsersManagement,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const safeStages = Array.isArray(stages) ? stages : [];
  const safeAttendance = Array.isArray(attendance) && attendance.length > 0 
    ? attendance 
    : (Array.isArray(attendanceRecords) ? attendanceRecords : []);

  const handleNavigate = onNavigateTab || onNavigate || (() => {});
  const handlePayment = onOpenPaymentGateway || onOpenPaymentModal || (() => {});
  const handleBackup = onOpenBackupSecurity || onOpenBackupModal || (() => {});

  // Financial metrics
  const totalIncome = safeTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = safeTransactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Total students with unpaid balances
  const debtStudents = safeStudents.filter(s => s.balance < 0);
  const totalDebtAmount = Math.abs(debtStudents.reduce((sum, s) => sum + s.balance, 0));

  // Average attendance rate
  const avgAttendanceRate = safeStudents.length > 0
    ? Math.round(safeStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / safeStudents.length)
    : 0;

  // High absence students (attendance < 75%)
  const highAbsenceStudents = safeStudents.filter(s => s.attendanceRate < 75);

  // Underperforming students (score < 60%)
  const strugglingStudents = safeAssessments.filter(a => a.needsSupport || a.percentage < 60);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-200 backdrop-blur-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>لوحة الإدارة التنفيذية والرقابة المالية الذكية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              أهلاً بك، المدير العام
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              تقارير مركزية فورية لمتابعة إيرادات ومصروفات المركز، نسب الحضور والغياب، وأداء الطلاب ومستحقات المعلمين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportFinancialReportToExcel(safeTransactions)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير ملف Excel المالي</span>
            </button>

            <button
              onClick={handlePayment}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>تحصيل إلكتروني</span>
            </button>

            <button
              onClick={handleBackup}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>نسخ احتياطي مشفر</span>
            </button>

            {onOpenUsersManagement && (
              <button
                onClick={onOpenUsersManagement}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-rose-900/30"
              >
                <UserCog className="w-4 h-4" />
                <span>إدارة وصلاحيات المستخدمين</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات والمتحصلات</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalIncome.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>مشتمل اشتراكات ومذكرات الطلاب</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي المصروفات والتشغيل</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalExpense.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-2">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>إيجار، رواتب معلمين، ومطبوعات</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">صافي الأرباح التشغيلية</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${netProfit >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
            {netProfit.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-2">
            <span>هامش الربحية الصافي:</span>
            <span className="font-bold text-indigo-600">{profitMargin}%</span>
          </div>
        </div>

        {/* Students & Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">الطلاب ونسبة الالتزام</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{students.length}</span>
            <span className="text-xs text-slate-500">طالب مسجل</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-2">
            <span>متوسط الحضور بالمركز:</span>
            <span className={`font-bold ${avgAttendanceRate >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {avgAttendanceRate}%
            </span>
          </div>
        </div>

      </div>

      {/* Critical Alerts & Follow-up Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Alerts (Students at risk of absence) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                <UserX className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                تنبيهات الغياب المتكرر ({highAbsenceStudents.length} طلاب بحاجة لمتابعة)
              </h3>
            </div>
            <button
              onClick={() => handleNavigate('attendance')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>كشف الحضور</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {highAbsenceStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد حالات غياب متكرر حرجة حالياً</p>
            ) : (
              highAbsenceStudents.map((std) => (
                <div key={std.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{std.name}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {std.stageName} • هاتف الوالد: {std.parentPhone}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold inline-block">
                      حضور {std.attendanceRate}%
                    </span>
                    <a
                      href={`https://wa.me/2${std.parentPhone}?text=${encodeURIComponent(`تحية طيبة من إدارة سنتر الأوائل التعليمي بخصوص الطالب ${std.name}، يرجى التواصل معنا لمتابعة نسبة الحضور والغياب.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline block mt-1 font-semibold"
                    >
                      مراسلة واتساب
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Performance Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                تنبيهات الدرجات ومستوى الطلاب ({strugglingStudents.length})
              </h3>
            </div>
            <button
              onClick={() => handleNavigate('assessments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>سجل التقييمات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {strugglingStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">كافة نتائج الطلاب الحالية ضمن المعدل الآمن</p>
            ) : (
              strugglingStudents.map((asm) => (
                <div key={asm.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{asm.studentName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {asm.subjectName} • {asm.examTitle}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[11px] font-bold inline-block">
                      {asm.score} من {asm.maxScore} ({asm.percentage.toFixed(0)}%)
                    </span>
                    <span className="text-[10px] text-amber-800 block mt-1 font-medium">
                      يحتاج حصة دعم تقوية
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Financial Transactions Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">آخر المعاملات المالية والإيصالات</h3>
            <p className="text-xs text-slate-500">حركات الخزينة وبوابات الدفع الإلكتروني المباشرة</p>
          </div>
          <button
            onClick={() => handleNavigate('finance')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كل التقارير المالية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-3">رقم الإيصال</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">البيان والتفاصيل</th>
                <th className="p-3">وسيلة الدفع</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-800">{t.invoiceNumber}</td>
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.type === 'income' ? 'إيراد / تحصيل' : 'مصروف / تشغيل'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">{t.description}</td>
                  <td className="p-3 text-slate-600">{t.paymentMethodName}</td>
                  <td className={`p-3 font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ج.م
                  </td>
                  <td className="p-3 text-slate-500">{t.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
