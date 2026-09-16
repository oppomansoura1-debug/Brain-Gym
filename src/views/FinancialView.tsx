import React, { useState } from 'react';
import { 
  FinancialTransaction, 
  FinancialCategory, 
  PaymentMethod, 
  TransactionType,
  Student 
} from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Plus, 
  Printer, 
  Search, 
  Filter, 
  CreditCard,
  Building,
  Zap,
  BookOpen,
  PieChart,
  CheckCircle2,
  X
} from 'lucide-react';
import { exportFinancialReportToExcel } from '../services/exportExcel';

interface FinancialViewProps {
  transactions: FinancialTransaction[];
  students: Student[];
  onAddTransaction: (txn: FinancialTransaction) => void;
  onViewReceipt: (txn: FinancialTransaction) => void;
  onOpenPaymentGateway: () => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  transactions,
  students,
  onAddTransaction,
  onViewReceipt,
  onOpenPaymentGateway,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<FinancialCategory>('center_rent');
  const [formAmount, setFormAmount] = useState<number>(1000);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('cash');
  const [formRecipient, setFormRecipient] = useState<string>('');

  // Computations
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Filtered transactions
  const filteredTxns = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesGateway = filterGateway === 'all' || t.paymentMethod === filterGateway;
    const matchesSearch = 
      t.invoiceNumber.includes(searchTerm) || 
      t.description.includes(searchTerm) || 
      (t.studentName && t.studentName.includes(searchTerm)) ||
      (t.teacherName && t.teacherName.includes(searchTerm));
    return matchesType && matchesGateway && matchesSearch;
  });

  const categoryNames: Record<FinancialCategory, string> = {
    tuition_fee: 'اشتراكات ومصروفات شهرية',
    books_materials: 'مذكرات وكتب تعليمية',
    exam_fee: 'رسوم امتحانات وتدريب',
    teacher_salary: 'رواتب ونسب المعلمين',
    center_rent: 'إيجار مقر المركز',
    electricity_water: 'مرافق (كهرباء، مياه، إنترنت)',
    stationery_printing: 'أدوات مكتبية ومطبوعات',
    maintenance: 'صيانة وتجهيزات',
    marketing: 'دعاية وإعلانات',
    refreshments: 'ضيافة وبوفيه',
    other: 'مصروفات أخرى متنوعة'
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || formAmount <= 0) return;

    const methodNames: Record<PaymentMethod, string> = {
      cash: 'خزينة المركز (نقدي)',
      fawry: 'خدمة فوري (Fawry Pay)',
      vodafone_cash: 'محفظة فودافون كاش',
      visa_mastercard: 'بطاقة ائتمانية (Visa/MasterCard)',
      instapay: 'إنستاباي (InstaPay)',
    };

    const newTxn: FinancialTransaction = {
      id: `txn_${Date.now()}`,
      invoiceNumber: `${formType === 'income' ? 'INV' : 'EXP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: formType,
      category: formCategory,
      categoryName: categoryNames[formCategory],
      amount: Number(formAmount),
      studentName: formType === 'income' ? formRecipient : undefined,
      teacherName: formType === 'expense' && formCategory === 'teacher_salary' ? formRecipient : undefined,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: formPaymentMethod,
      paymentMethodName: methodNames[formPaymentMethod],
      referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      description: formDescription || categoryNames[formCategory],
      recordedBy: 'قسم المحاسبة والمالية',
      status: 'completed',
    };

    onAddTransaction(newTxn);
    setShowAddModal(false);
    setFormDescription('');
    setFormRecipient('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>التقارير المالية والحسابات والمصروفات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل الخزينة، إيرادات الاشتراكات، بنود النفقات، وطباعة السندات الرسمية المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportFinancialReportToExcel(transactions)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير ملف Excel</span>
          </button>

          <button
            onClick={onOpenPaymentGateway}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>بوابة التحصيل الإلكتروني</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سند جديد</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات المحصلة</span>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
              +{totalIncome.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">اشتراكات ومذكرات الطلاب</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">إجمالي المصروفات والتشغيل</span>
            <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">
              -{totalExpense.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">رواتب وإيجار وفواتير</span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">صافي الأرباح التشغيلية</span>
            <div className={`text-2xl font-black tracking-tight mt-1 ${netProfit >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
              {netProfit.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              نسبة هامش الربح: {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث برقم الإيصال، اسم الطالب/المعلم، أو البيان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold text-slate-700"
          >
            <option value="all">كل الحركات (إيراد + مصروف)</option>
            <option value="income">إيرادات ومتحصلات فقط</option>
            <option value="expense">مصروفات وتشغيل فقط</option>
          </select>

          <select
            value={filterGateway}
            onChange={(e) => setFilterGateway(e.target.value)}
            className="text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold text-slate-700"
          >
            <option value="all">كافة وسائل الدفع</option>
            <option value="cash">خزينة المركز (نقدي)</option>
            <option value="fawry">فوري (Fawry Pay)</option>
            <option value="vodafone_cash">فودافون كاش ومحافظ</option>
            <option value="visa_mastercard">فيزا وماستركارد</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">رقم الإيصال</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">النوع والتصنيف</th>
                <th className="p-3.5">البيان والطرف المعني</th>
                <th className="p-3.5">وسيلة السداد</th>
                <th className="p-3.5">المبلغ</th>
                <th className="p-3.5 text-center">معاينة وطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    لا توجد معاملات مطابقة للفلتر
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{t.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{t.date}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.type === 'income' ? 'إيراد' : 'مصروف'}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">{t.categoryName}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{t.description}</div>
                      {(t.studentName || t.teacherName) && (
                        <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">
                          {t.studentName ? `الطالب: ${t.studentName}` : `المعلم: ${t.teacherName}`}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium">{t.paymentMethodName}</span>
                      {t.referenceNumber && (
                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{t.referenceNumber}</span>
                      )}
                    </td>
                    <td className={`p-3.5 font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ج.م
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onViewReceipt(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="معاينة وطباعة سند رسمي"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>سند رسمي</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">تسجيل حركة مالية جديدة (سند قبض / صرف)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع المعاملة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormType('income'); setFormCategory('tuition_fee'); }}
                    className={`py-2 rounded-xl font-bold border transition ${
                      formType === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    سند قبض (إيراد)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('expense'); setFormCategory('center_rent'); }}
                    className={`py-2 rounded-xl font-bold border transition ${
                      formType === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    سند صرف (مصروف)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بند المعاملة:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {formType === 'income' ? (
                      <>
                        <option value="tuition_fee">اشتراك شهري</option>
                        <option value="books_materials">مذكرات وكتب</option>
                        <option value="exam_fee">رسوم اختبارات</option>
                        <option value="other">إيرادات أخرى</option>
                      </>
                    ) : (
                      <>
                        <option value="center_rent">إيجار المقر</option>
                        <option value="electricity_water">فواتير كهرباء وإنترنت</option>
                        <option value="stationery_printing">طباعة ومذكرات</option>
                        <option value="teacher_salary">مستحقات معلمين</option>
                        <option value="maintenance">صيانة</option>
                        <option value="marketing">دعاية وتسويق</option>
                        <option value="refreshments">بوفيه وضيافة</option>
                        <option value="other">مصروفات أخرى</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المبلغ بالجنيه:</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">وسيلة الدفع:</label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="cash">خزينة المركز (نقدي)</option>
                  <option value="fawry">فوري (Fawry Pay)</option>
                  <option value="vodafone_cash">فودافون كاش ومحافظ</option>
                  <option value="visa_mastercard">فيزا وماستركارد</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الطرف المعني / المستفيد:</label>
                <input
                  type="text"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  placeholder="اسم الطالب أو الجهة المستفيدة أو المعلم"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">بيان وتفاصيل المعاملة:</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="وصف تفصيلي للمعاملة المالية..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ وتسجيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
