import React, { useState } from 'react';
import { Teacher, Subject, FinancialTransaction } from '../types';
import { 
  GraduationCap, 
  Plus, 
  Phone, 
  Mail, 
  DollarSign, 
  CheckCircle2, 
  CreditCard, 
  Edit3, 
  Trash2,
  X
} from 'lucide-react';

interface TeachersManagementViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onRecordTeacherPayout: (transaction: FinancialTransaction) => void;
}

export const TeachersManagementView: React.FC<TeachersManagementViewProps> = ({
  teachers,
  subjects,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onRecordTeacherPayout,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacherForPayout, setSelectedTeacherForPayout] = useState<Teacher | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(5000);
  const [payoutMethod, setPayoutMethod] = useState<'cash' | 'instapay' | 'vodafone_cash'>('instapay');

  // Add teacher form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formSalaryType, setFormSalaryType] = useState<'percentage' | 'per_student' | 'fixed'>('percentage');
  const [formRate, setFormRate] = useState<number>(70);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const sub = subjects.find(s => s.id === formSubjectId);
    const newTeacher: Teacher = {
      id: `tchr_${Date.now()}`,
      name: formName,
      phone: formPhone,
      email: formEmail || `${formPhone}@educenter.eg`,
      subjectId: formSubjectId,
      subjectName: sub ? sub.name : 'مادة تعليمية',
      stages: ['المرحلة الثانوية'],
      salaryType: formSalaryType,
      rate: Number(formRate),
      totalStudents: 35,
      joinDate: new Date().toISOString().split('T')[0],
      active: true,
    };

    onAddTeacher(newTeacher);
    setShowAddModal(false);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
  };

  const handleConfirmPayout = () => {
    if (!selectedTeacherForPayout || payoutAmount <= 0) return;

    const methodNames = {
      cash: 'خزينة المركز (نقدي)',
      instapay: 'إنستاباي (InstaPay)',
      vodafone_cash: 'محفظة فودافون كاش',
    };

    const newTxn: FinancialTransaction = {
      id: `txn_payout_${Date.now()}`,
      invoiceNumber: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'expense',
      category: 'teacher_salary',
      categoryName: 'مستحقات ومعاشات المعلمين',
      amount: Number(payoutAmount),
      teacherId: selectedTeacherForPayout.id,
      teacherName: selectedTeacherForPayout.name,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: payoutMethod,
      paymentMethodName: methodNames[payoutMethod],
      referenceNumber: `PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `صرف مستحقات المعلم ${selectedTeacherForPayout.name} عن حصص ${selectedTeacherForPayout.subjectName}`,
      recordedBy: 'إدارة شؤون المعلمين والحسابات',
      status: 'completed',
    };

    onRecordTeacherPayout(newTxn);
    setSelectedTeacherForPayout(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>إدارة الكادر التعليمي وهيئة التدريس</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة المعلمين، المواد التخصصية، احتساب نسب الحصص، وصرف المستحقات
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلم جديد</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((teacher) => {
          // Estimated monthly revenue generated
          const estShare = teacher.salaryType === 'percentage'
            ? `${teacher.rate}% من الاشتراكات`
            : teacher.salaryType === 'per_student'
            ? `${teacher.rate} ج.م / لكل طالب`
            : `${teacher.rate.toLocaleString()} ج.م راتب ثابت`;

          return (
            <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                      {teacher.name.split(' ')[1]?.[0] || teacher.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                      <span className="text-xs text-indigo-600 font-semibold block">{teacher.subjectName}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${teacher.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {teacher.active ? 'نشط' : 'متوقف'}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> الهاتف:
                    </span>
                    <span className="font-mono font-medium text-slate-800">{teacher.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <DollarSign className="w-3.5 h-3.5" /> نظام المحاسبة:
                    </span>
                    <span className="font-bold text-slate-900">{estShare}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">إجمالي طلاب المجموعات:</span>
                    <span className="font-bold text-indigo-600">{teacher.totalStudents} طالب</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">المراحل المكلف بها:</span>
                    <div className="flex flex-wrap gap-1">
                      {teacher.stages.map((stg, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {stg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-2 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/2${teacher.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </a>

                <button
                  onClick={() => {
                    setSelectedTeacherForPayout(teacher);
                    setPayoutAmount(teacher.salaryType === 'fixed' ? teacher.rate : 8000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>صرف المستحقات</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">إضافة معلم جديد للمركز</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المعلم ثلاثي أو رباعي:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: أ. إبراهيم عبد الرحمن الشافعي"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01011223344"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المادة الدراسية:</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">طريقة الحساب:</label>
                  <select
                    value={formSalaryType}
                    onChange={(e) => setFormSalaryType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="per_student">مبلغ محدد لكل طالب</option>
                    <option value="fixed">راتب شهري مقطوع</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القيمة / النسبة:</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  حفظ المعلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Payout Modal */}
      {selectedTeacherForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">صرف مستحقات المعلم: {selectedTeacherForPayout.name}</h3>
              <button onClick={() => setSelectedTeacherForPayout(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-600">المادة: <strong className="text-slate-900">{selectedTeacherForPayout.subjectName}</strong></p>
                <p className="text-slate-600 mt-1">إجمالي الطلاب المسجلين: <strong className="text-indigo-600">{selectedTeacherForPayout.totalStudents} طالب</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المبلغ المراد صرفه (جنيه مصري):</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-base font-black text-slate-900 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">طريقة التحويل / الصرف:</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="instapay">تحويل فوري إنستاباي (InstaPay)</option>
                  <option value="vodafone_cash">محفظة فودافون كاش</option>
                  <option value="cash">نقداً من خزينة المركز</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForPayout(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayout}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  تأكيد الصرف وتوليد سند المصروف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
