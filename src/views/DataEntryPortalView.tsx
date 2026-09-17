import React, { useState } from 'react';
import { 
  Student, 
  AcademicStage, 
  FinancialTransaction, 
  PaymentMethod, 
  Subject,
  AttendanceStatus 
} from '../types';
import { 
  Database, 
  UserPlus, 
  CreditCard, 
  Printer, 
  Receipt, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

interface DataEntryPortalViewProps {
  students: Student[];
  stages: AcademicStage[];
  subjects: Subject[];
  transactions: FinancialTransaction[];
  onAddStudent: (student: Student) => void;
  onOpenPaymentGateway: () => void;
  onAddExpenseVoucher: (txn: FinancialTransaction) => void;
  onViewReceipt: (txn: FinancialTransaction) => void;
}

export const DataEntryPortalView: React.FC<DataEntryPortalViewProps> = ({
  students,
  stages,
  subjects,
  transactions,
  onAddStudent,
  onOpenPaymentGateway,
  onAddExpenseVoucher,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_enroll' | 'quick_expense' | 'recent_vouchers'>('quick_enroll');

  // Quick enroll form
  const [stdName, setStdName] = useState('');
  const [stdStageId, setStdStageId] = useState(stages[0]?.id || '');
  const [stdPhone, setStdPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Quick Expense Voucher
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(150);
  const [expCategory, setExpCategory] = useState<'stationery_printing' | 'refreshments' | 'maintenance' | 'other'>('stationery_printing');
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('cash');
  const [expSuccess, setExpSuccess] = useState(false);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdName.trim()) return;

    const stg = stages.find(s => s.id === stdStageId);
    const newStudent: Student = {
      id: `std_${Date.now()}`,
      code: `STD-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`,
      name: stdName,
      stageId: stdStageId,
      stageName: stg ? stg.name : 'المرحلة الدراسية',
      groupName: 'غير مسجل بمجموعة',
      phone: stdPhone,
      parentName,
      parentPhone,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      monthlyFee: 0,
      balance: 0,
      attendanceRate: 100,
      averageScore: 90,
    };

    onAddStudent(newStudent);
    setEnrollSuccess(true);
    setStdName('');
    setStdPhone('');
    setParentName('');
    setParentPhone('');
    setTimeout(() => setEnrollSuccess(false), 3000);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;

    const categoryNames = {
      stationery_printing: 'مستلزمات مكتبية وطباعة',
      refreshments: 'بوفيه وضيافة واستقبال',
      maintenance: 'صيانة وتجهيزات قاعات',
      other: 'مصروفات تشغيل يومية',
    };

    const methodNames: Record<PaymentMethod, string> = {
      cash: 'خزينة المركز (نقدي)',
      fawry: 'فوري (Fawry)',
      vodafone_cash: 'فودافون كاش',
      visa_mastercard: 'بطاقة ائتمان',
      instapay: 'إنستاباي',
    };

    const newTxn: FinancialTransaction = {
      id: `txn_exp_${Date.now()}`,
      invoiceNumber: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'expense',
      category: expCategory,
      categoryName: categoryNames[expCategory],
      amount: Number(expAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: expPaymentMethod,
      paymentMethodName: methodNames[expPaymentMethod],
      description: expTitle,
      recordedBy: 'سارة محمود (مدخل بيانات)',
      status: 'completed',
    };

    onAddExpenseVoucher(newTxn);
    setExpSuccess(true);
    setExpTitle('');
    setExpAmount(150);
    setTimeout(() => setExpSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-l from-indigo-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Database className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide">بوابة العمليات السريعة</span>
            <h2 className="text-xl font-black">واجهة مسؤول إدخال البيانات والتحصيل</h2>
            <p className="text-xs text-indigo-200 mt-0.5">تسجيل فوري للطلاب، إصدار إيصالات السداد، ورصد المصروفات اليومية</p>
          </div>
        </div>

        <button
          onClick={onOpenPaymentGateway}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/30 transition cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>تحصيل قسط طالب فوري</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('quick_enroll')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'quick_enroll'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>تسجيل طالب جديد</span>
        </button>

        <button
          onClick={() => setActiveTab('quick_expense')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'quick_expense'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>تسجيل سند مصروف يومي</span>
        </button>

        <button
          onClick={() => setActiveTab('recent_vouchers')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'recent_vouchers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>إيصالاتي المسجلة اليوم</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'quick_enroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">استمارة قيد طالب سريع بالمركز</h3>
            <span className="text-xs text-slate-400">كود الطالب يتم إنشاؤه آلياً</span>
          </div>

          {enrollSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تسجيل الطالب بنجاح وإدراجه في كشوف الحضور والغياب!</span>
            </div>
          )}

          <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم الطالب رباعي:</label>
              <input
                type="text"
                required
                value={stdName}
                onChange={(e) => setStdName(e.target.value)}
                placeholder="اسم الطالب بالكامل..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المرحلة الدراسية والصف:</label>
                <select
                  value={stdStageId}
                  onChange={(e) => setStdStageId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-medium"
                >
                  {Array.from(new Set(stages.map(s => s.mainStage || 'أخرى'))).map(mainCat => (
                    <optgroup key={mainCat} label={`المرحلة: ${mainCat}`}>
                      {stages.filter(s => (s.mainStage || 'أخرى') === mainCat).map(stg => (
                        <option key={stg.id} value={stg.id}>
                          {stg.grade && stg.grade !== '--' ? `${mainCat} - ${stg.grade}` : stg.name} ({stg.code})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم هاتف الطالب:</label>
                <input
                  type="tel"
                  value={stdPhone}
                  onChange={(e) => setStdPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم ولي الأمر:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="الأب أو الأم..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">هاتف ولي الأمر (لإشعارات الحضور):</label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="011..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                تأكيد التسجيل وإضافة الطالب
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'quick_expense' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">تسجيل إيصال مصروفات ونفقات يومية</h3>
            <span className="text-xs text-slate-400">سند صرف للخزينة</span>
          </div>

          {expSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تسجيل سند الصرف بنجاح وتحديث حساب الخزينة!</span>
            </div>
          )}

          <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">بيان المصروف:</label>
              <input
                type="text"
                required
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="مثال: شراء أوراق تصوير A4 وأقلام سبورة..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المبلغ (جنيه مصري):</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-black text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">تصنيف البند:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="stationery_printing">أدوات مكتبية ومطبوعات</option>
                  <option value="refreshments">بوفيه واستقبال</option>
                  <option value="maintenance">صيانة</option>
                  <option value="other">مصروفات أخرى</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">طريقة الدفع:</label>
              <select
                value={expPaymentMethod}
                onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
              >
                <option value="cash">نقداً من الخزينة</option>
                <option value="vodafone_cash">فودافون كاش</option>
                <option value="instapay">إنستاباي</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                تسجيل سند الصرف
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'recent_vouchers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900">سجل المعاملات المسجلة حديثاً</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">رقم الإيصال</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">البيان</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">وسيلة الدفع</th>
                  <th className="p-3 text-center">طباعة سند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{t.invoiceNumber}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.type === 'income' ? 'سند قبض' : 'سند صرف'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{t.description}</td>
                    <td className={`p-3 font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount} ج.م
                    </td>
                    <td className="p-3 text-slate-600">{t.paymentMethodName}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onViewReceipt(t)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="طباعة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
