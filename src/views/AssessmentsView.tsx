import React, { useState } from 'react';
import { 
  StudentAssessment, 
  Student, 
  AcademicStage, 
  Subject 
} from '../types';
import { 
  Award, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  X
} from 'lucide-react';
import { exportAssessmentsToExcel } from '../services/exportExcel';

interface AssessmentsViewProps {
  assessments: StudentAssessment[];
  students: Student[];
  stages: AcademicStage[];
  subjects: Subject[];
  onAddAssessment: (assessment: StudentAssessment) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  assessments,
  students,
  stages,
  subjects,
  onAddAssessment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [formStudentId, setFormStudentId] = useState(students[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formExamTitle, setFormExamTitle] = useState('امتحان شامل على الوحدة الأولى');
  const [formExamType, setFormExamType] = useState<StudentAssessment['examType']>('monthly');
  const [formMaxScore, setFormMaxScore] = useState<number>(60);
  const [formScore, setFormScore] = useState<number>(55);
  const [formFeedback, setFormFeedback] = useState<string>('مستوى ممتاز مع التزام بالخطوات');

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = a.studentName.includes(searchTerm) || a.examTitle.includes(searchTerm);
    const matchesSubject = selectedSubjectId === 'all' || a.subjectId === selectedSubjectId;
    return matchesSearch && matchesSubject;
  });

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find(s => s.id === formStudentId);
    const sub = subjects.find(s => s.id === formSubjectId);
    if (!std || !sub) return;

    const percentage = (Number(formScore) / Number(formMaxScore)) * 100;
    const needsSupport = percentage < 60;

    const newAssessment: StudentAssessment = {
      id: `asm_${Date.now()}`,
      studentId: std.id,
      studentName: std.name,
      studentCode: std.code,
      stageName: std.stageName,
      subjectId: sub.id,
      subjectName: sub.name,
      teacherId: sub.teacherId,
      examTitle: formExamTitle,
      examType: formExamType,
      maxScore: Number(formMaxScore),
      score: Number(formScore),
      percentage,
      examDate: new Date().toISOString().split('T')[0],
      feedback: formFeedback,
      needsSupport,
    };

    onAddAssessment(newAssessment);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>سجل التقييمات الشهرية وأداء الطلاب</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            رصد درجات الامتحانات، نسب النجاح، ورصد الطلاب الذين يحتاجون لدعم إضافي
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAssessmentsToExcel(assessments)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير الدرجات إكسل</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>رصد درجة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الطالب أو عنوان الاختبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
          >
            <option value="all">كافة المواد الدراسية</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">الطالب</th>
                <th className="p-3.5">المادة والمرحلة</th>
                <th className="p-3.5">عنوان الاختبار</th>
                <th className="p-3.5">الدرجة والنسبة</th>
                <th className="p-3.5">مستوى الأداء</th>
                <th className="p-3.5">توجيهات المعلم</th>
                <th className="p-3.5">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    لا توجد تقييمات مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((asm) => (
                  <tr key={asm.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{asm.studentName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{asm.studentCode}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-indigo-900 font-semibold">{asm.subjectName}</div>
                      <div className="text-[11px] text-slate-500">{asm.stageName}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{asm.examTitle}</td>
                    <td className="p-3.5 font-black text-sm">
                      <span className={asm.needsSupport ? 'text-rose-600' : 'text-emerald-600'}>
                        {asm.score} / {asm.maxScore}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal mr-1.5">
                        ({asm.percentage.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3.5">
                      {asm.needsSupport ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> بحاجة لدعم
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> متفوق
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{asm.feedback || '-'}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{asm.examDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assessment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">رصد درجة تقييم / امتحان لطالب</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اختر الطالب:</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.stageName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المادة الدراسية:</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نوع الاختبار:</label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="monthly">امتحان شهري</option>
                    <option value="quiz">كويز سريع</option>
                    <option value="midterm">نصف العام</option>
                    <option value="homework">واجب أسبوعي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">عنوان الاختبار:</label>
                <input
                  type="text"
                  required
                  value={formExamTitle}
                  onChange={(e) => setFormExamTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدرجة الحاصل عليها:</label>
                  <input
                    type="number"
                    required
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-black text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدرجة العظمى (من):</label>
                  <input
                    type="number"
                    required
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات وتقييم المعلم:</label>
                <textarea
                  rows={2}
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  حفظ الدرجة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
