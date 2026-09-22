import React, { useState } from 'react';
import { Student, AcademicStage } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { exportStudentsToExcel } from '../services/exportExcel';

interface StudentsManagementViewProps {
  students: Student[];
  stages: AcademicStage[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onPayForStudent: (studentId: string) => void;
  hideFinancials?: boolean;
}

export const StudentsManagementView: React.FC<StudentsManagementViewProps> = ({
  students,
  stages,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onPayForStudent,
  hideFinancials = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formStageId, setFormStageId] = useState(stages[0]?.id || '');
  const [formPhone, setFormPhone] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formMonthlyFee, setFormMonthlyFee] = useState<number>(300);
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormStageId(stages[0]?.id || '');
    setFormPhone('');
    setFormParentName('');
    setFormParentPhone('');
    setFormMonthlyFee(300);
    setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (std: Student) => {
    setEditingStudent(std);
    setFormName(std.name);
    setFormStageId(std.stageId);
    setFormPhone(std.phone);
    setFormParentName(std.parentName);
    setFormParentPhone(std.parentPhone);
    setFormMonthlyFee(std.monthlyFee || 300);
    setFormNotes(std.notes || '');
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('يرجى إدخال اسم الطالب');
      return;
    }

    const stageObj = stages.find(s => s.id === formStageId);
    const stageName = stageObj ? stageObj.name : 'المرحلة الثانوية';

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: formName,
        stageId: formStageId,
        stageName,
        phone: formPhone,
        parentName: formParentName,
        parentPhone: formParentPhone,
        monthlyFee: Number(formMonthlyFee) >= 0 ? Number(formMonthlyFee) : editingStudent.monthlyFee,
        notes: formNotes,
      };
      onUpdateStudent(updated);
    } else {
      const newStd: Student = {
        id: `std_${Date.now()}`,
        code: `STD-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`,
        name: formName,
        stageId: formStageId,
        stageName,
        groupName: 'غير مسجل بمجموعة',
        phone: formPhone,
        parentName: formParentName,
        parentPhone: formParentPhone,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        monthlyFee: Number(formMonthlyFee) >= 0 ? Number(formMonthlyFee) : 0,
        balance: 0,
        attendanceRate: 100,
        averageScore: 90,
        notes: formNotes,
        enrolledGroupIds: [],
        enrolledSubjectIds: [],
      };
      onAddStudent(newStd);
    }

    setShowAddModal(false);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.includes(searchTerm) || 
      s.code.includes(searchTerm) || 
      s.phone.includes(searchTerm) || 
      s.parentPhone.includes(searchTerm);
    const matchesStage = selectedStage === 'all' || s.stageId === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>إدارة شؤون الطلاب والاشتراكات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل الطلاب المعتمد، متابعة الرصيد المالي، نسب الحضور، وبيانات التواصل مع أولياء الأمور
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportStudentsToExcel(students)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسل</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="البحث باسم الطالب، كود الطالب، أو رقم هاتف ولي الأمر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full md:w-72">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">جميع المراحل والصفوف ({stages.length})</option>
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
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">الطالب والكود</th>
                <th className="p-3.5">المرحلة والصف</th>
                <th className="p-3.5">أرقام التواصل</th>
                {!hideFinancials && <th className="p-3.5">الاشتراك والوضع المالي</th>}
                <th className="p-3.5">الحضور والأداء</th>
                <th className="p-3.5 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={hideFinancials ? 5 : 6} className="text-center py-10 text-slate-400">
                    لا توجد بيانات مطابقة لخيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Student Info */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{std.name}</div>
                      <div className="font-mono text-[11px] text-indigo-600 font-semibold mt-0.5">{std.code}</div>
                    </td>

                    {/* Stage & Group */}
                    <td className="p-3.5">
                      <div className="text-slate-800 font-semibold">{std.stageName}</div>
                      {std.groupName && std.groupName !== 'غير مسجل بمجموعة' ? (
                        <div className="text-[11px] text-indigo-600 font-medium mt-0.5">{std.groupName}</div>
                      ) : (
                        <div className="text-[11px] text-slate-400 mt-0.5">مقيد بالمركز</div>
                      )}
                    </td>

                    {/* Contact & Parent */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{std.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>الوالد: {std.parentName} ({std.parentPhone})</span>
                        <a
                          href={`https://wa.me/2${std.parentPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-bold"
                          title="محادثة واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5 inline" />
                        </a>
                      </div>
                    </td>

                    {/* Finance (Hidden for data entry) */}
                    {!hideFinancials && (
                      <td className="p-3.5">
                        <div className="text-slate-900 font-semibold">
                          {std.monthlyFee > 0 ? `${std.monthlyFee} ج.م / شهر` : 'حسب المواد المسجلة'}
                        </div>
                        {std.balance < 0 ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>مستحق: {Math.abs(std.balance)} ج.م</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مسدد بالكامل</span>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Attendance & Score */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">حضور:</span>
                        <span className={`font-bold ${std.attendanceRate >= 85 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {std.attendanceRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-500">متوسط الدرجات:</span>
                        <span className="font-bold text-indigo-600">{std.averageScore}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!hideFinancials && (
                          <button
                            onClick={() => onPayForStudent(std.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                            title="تحصيل وسداد إلكتروني"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(std)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          title="تعديل البيانات"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف بيانات الطالب ${std.name}؟`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">
                {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد بالمركز'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الطالب رباعي:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله محمود السعيد"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المرحلة الدراسية والصف:</label>
                  <select
                    value={formStageId}
                    onChange={(e) => setFormStageId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-medium"
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
                  <label className="block font-semibold text-slate-700 mb-1">هاتف الطالب الشخصي:</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم ولي الأمر:</label>
                  <input
                    type="text"
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    placeholder="اسم الأب أو الأم"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">هاتف ولي الأمر (واتساب):</label>
                  <input
                    type="text"
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="01122334455"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الاشتراك الشهري للطالب (ج.م):</label>
                <input
                  type="number"
                  min={0}
                  value={formMonthlyFee}
                  onChange={(e) => setFormMonthlyFee(Number(e.target.value))}
                  placeholder="300"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">تحديد الاشتراك المالي للطالب أثناء تسجيل أو تعديل البيانات</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="أي ملاحظات خاصة بالطالب..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'تحديث البيانات' : 'حفظ الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
