import React, { useState } from 'react';
import { 
  Teacher, 
  Student, 
  Subject, 
  AttendanceRecord, 
  StudentAssessment, 
  AttendanceStatus 
} from '../types';
import { 
  UserCheck, 
  Award, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar,
  Send,
  Users
} from 'lucide-react';

interface TeacherPortalViewProps {
  currentTeacher: Teacher;
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  assessments: StudentAssessment[];
  onRecordAttendance: (records: AttendanceRecord[]) => void;
  onAddAssessment: (assessment: StudentAssessment) => void;
  onSendParentAlert: (student: Student, status: AttendanceStatus, subjectName: string) => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  currentTeacher,
  students,
  subjects,
  attendanceRecords,
  assessments,
  onRecordAttendance,
  onAddAssessment,
  onSendParentAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'roll_call' | 'enter_grades' | 'student_alerts'>('roll_call');
  const [selectedGroup, setSelectedGroup] = useState<string>('مجموعة النخبة (أ)');
  const [sessionRoll, setSessionRoll] = useState<Record<string, AttendanceStatus>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Grade entry state
  const [gradeStudentId, setGradeStudentId] = useState(students[0]?.id || '');
  const [examTitle, setExamTitle] = useState('اختبار نصف الفصل الدراسي');
  const [examScore, setExamScore] = useState<number>(55);
  const [maxScore, setMaxScore] = useState<number>(60);
  const [notes, setNotes] = useState('تفاعل ممتاز في الحصة وحل الواجب كاملاً');

  // Filter students for teacher's groups/stages
  const teacherStudents = students; // Can filter by assigned stages or groups
  const highAbsenceStudents = teacherStudents.filter(s => s.attendanceRate < 75);
  const strugglingStudents = assessments.filter(a => a.needsSupport);

  const handleRollChange = (studentId: string, status: AttendanceStatus) => {
    setSessionRoll(prev => ({
      ...prev,
      [studentId]: status
    }));

    if (status === 'absent' || status === 'late') {
      const student = students.find(s => s.id === studentId);
      if (student) {
        onSendParentAlert(student, status, currentTeacher.subjectName);
      }
    }
  };

  const handleSaveRollCall = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRecords: AttendanceRecord[] = teacherStudents.map(std => {
      const status = sessionRoll[std.id] || 'present';
      return {
        id: `att_tch_${std.id}_${Date.now()}`,
        studentId: std.id,
        studentName: std.name,
        studentCode: std.code,
        stageName: std.stageName,
        groupName: selectedGroup,
        subjectId: currentTeacher.subjectId,
        subjectName: currentTeacher.subjectName,
        teacherId: currentTeacher.id,
        date: today,
        status,
        parentNotified: status === 'absent' || status === 'late',
        timestamp: `${today} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
      };
    });

    onRecordAttendance(newRecords);
    setSavedFeedback('تم رصد الحصة وإرسال التنبيهات الفورية لأولياء أمور الطلاب الغائبين!');
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find(s => s.id === gradeStudentId);
    if (!std) return;

    const percentage = (Number(examScore) / Number(maxScore)) * 100;
    const newAssessment: StudentAssessment = {
      id: `asm_tch_${Date.now()}`,
      studentId: std.id,
      studentName: std.name,
      studentCode: std.code,
      stageName: std.stageName,
      subjectId: currentTeacher.subjectId,
      subjectName: currentTeacher.subjectName,
      teacherId: currentTeacher.id,
      examTitle,
      examType: 'monthly',
      maxScore: Number(maxScore),
      score: Number(examScore),
      percentage,
      examDate: new Date().toISOString().split('T')[0],
      feedback: notes,
      needsSupport: percentage < 60,
    };

    onAddAssessment(newAssessment);
    setSavedFeedback(`تم حفظ ورصد درجة الطالب ${std.name} بنجاح!`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-lg text-emerald-400">
            {currentTeacher.name.split(' ')[1]?.[0] || 'م'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-300 font-semibold">بوابة المعلم التفاعلية</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                {currentTeacher.subjectName}
              </span>
            </div>
            <h2 className="text-xl font-black mt-0.5">{currentTeacher.name}</h2>
            <p className="text-xs text-slate-300">
              إدارة مجموعاتك الدراسية، تسجيل حضور الحصة اللحظي، وإرسال تنبيهات الدرجات لأولياء الأمور
            </p>
          </div>
        </div>

        <div className="text-left bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
          <span className="text-slate-400 block">إجمالي طلابك النشطين:</span>
          <span className="text-xl font-black text-emerald-400">{teacherStudents.length} طالب</span>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('roll_call')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'roll_call'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>تحضير حصة اليوم (Roll Call)</span>
        </button>

        <button
          onClick={() => setActiveTab('enter_grades')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'enter_grades'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>رصد درجات الاختبارات والواجبات</span>
        </button>

        <button
          onClick={() => setActiveTab('student_alerts')}
          className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'student_alerts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>تنبيهات الطلاب الحرجة ({highAbsenceStudents.length + strugglingStudents.length})</span>
        </button>
      </div>

      {/* Roll Call Tab */}
      {activeTab === 'roll_call' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700">المجموعة الحالية:</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
              >
                <option value="مجموعة النخبة (أ)">مجموعة النخبة (أ)</option>
                <option value="مجموعة العباقرة (ب)">مجموعة العباقرة (ب)</option>
                <option value="مجموعة (ج)">مجموعة (ج)</option>
              </select>
            </div>

            <button
              onClick={handleSaveRollCall}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الحضور وإرسال الإشعارات للغائبين</span>
            </button>
          </div>

          {/* Students list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {teacherStudents.map((std) => {
              const status = sessionRoll[std.id] || 'present';
              return (
                <div key={std.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{std.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({std.code})</span>
                      {std.attendanceRate < 75 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                          غياب متكرر
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {std.stageName} • نسبة الحضور السابقة: {std.attendanceRate}%
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRollChange(std.id, 'present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      حاضر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRollChange(std.id, 'absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        status === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      غائب
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRollChange(std.id, 'late')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        status === 'late' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      متأخر
                    </button>

                    <a
                      href={`https://wa.me/2${std.parentPhone}?text=${encodeURIComponent(`أهلاً بك، أ. ${currentTeacher.name} - مدرس ${currentTeacher.subjectName}: نود إعلامكم بحالة حضور الطالب/ة ${std.name}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition"
                      title="مراسلة ولي الأمر مباشرة عبر واتساب"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enter Grades Tab */}
      {activeTab === 'enter_grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-slate-900 mb-4">رصد درجات اختبار أو واجب شهري</h3>

          <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اختر الطالب:</label>
              <select
                value={gradeStudentId}
                onChange={(e) => setGradeStudentId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
              >
                {teacherStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.groupName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">عنوان الاختبار أو الواجب:</label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">درجة الطالب:</label>
                <input
                  type="number"
                  required
                  value={examScore}
                  onChange={(e) => setExamScore(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الدرجة العظمى (من):</label>
                <input
                  type="number"
                  required
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ملاحظات المعلم وتوصيات الدعم:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توجيهات للطالب أو إشعار لولي الأمر..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              حفظ وتثبيت النتيجة
            </button>
          </form>
        </div>
      )}

      {/* Critical Alerts Tab */}
      {activeTab === 'student_alerts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Absence Warnings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>طلاب تخطوا نسبة الغياب المسموح بها</span>
              </h3>
              <div className="space-y-2">
                {highAbsenceStudents.map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-[11px] text-slate-500">ولي الأمر: {s.parentPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/2${s.parentPhone}?text=${encodeURIComponent(`تحية طيبة، أ. ${currentTeacher.name}: نلفت انتباهكم لغياب الطالب ${s.name} المتكرر في مادة ${currentTeacher.subjectName}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                    >
                      تنبيه واتساب
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Grade Warnings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>طلاب بحاجة لتقوية وتدني درجات</span>
              </h3>
              <div className="space-y-2">
                {strugglingStudents.map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{a.studentName}</span>
                      <span className="text-[11px] text-slate-600">{a.examTitle}: {a.score}/{a.maxScore}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                      {a.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
