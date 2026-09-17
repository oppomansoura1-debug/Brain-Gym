import React, { useState } from 'react';
import { 
  Student, 
  AcademicStage, 
  Subject, 
  AttendanceRecord, 
  AttendanceStatus 
} from '../types';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send,
  Filter
} from 'lucide-react';
import { exportAttendanceToExcel } from '../services/exportExcel';

interface AttendanceViewProps {
  students: Student[];
  stages: AcademicStage[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  onRecordAttendance: (records: AttendanceRecord[]) => void;
  onSendParentAlert: (student: Student, status: AttendanceStatus, subjectName: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  stages,
  subjects,
  attendanceRecords,
  onRecordAttendance,
  onSendParentAlert,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>(stages[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Temporary local state for the session roll call before saving
  const [sessionRoll, setSessionRoll] = useState<Record<string, AttendanceStatus>>({});
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  // Filter students by selected stage
  const stageStudents = students.filter(s => s.stageId === selectedStageId);
  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const activeStage = stages.find(s => s.id === selectedStageId) || stages[0];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setSessionRoll(prev => ({
      ...prev,
      [studentId]: status
    }));

    // If marked absent or late, trigger notification option
    const student = students.find(s => s.id === studentId);
    if (student && (status === 'absent' || status === 'late')) {
      onSendParentAlert(student, status, activeSubject?.name || 'الحصة الدراسية');
      setAlertFeedback(`تم إرسال إشعار فوري لولي أمر الطالب ${student.name} (${status === 'absent' ? 'غياب' : 'تأخير'})`);
      setTimeout(() => setAlertFeedback(null), 3000);
    }
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    stageStudents.forEach(s => {
      updated[s.id] = status;
    });
    setSessionRoll(updated);
  };

  const handleSaveAttendance = () => {
    const newRecords: AttendanceRecord[] = stageStudents.map(std => {
      const status = sessionRoll[std.id] || 'present';
      return {
        id: `att_${std.id}_${selectedDate}`,
        studentId: std.id,
        studentName: std.name,
        studentCode: std.code,
        stageName: activeStage?.name || std.stageName,
        groupName: std.groupName,
        subjectId: activeSubject?.id || '',
        subjectName: activeSubject?.name || 'مادة دراسية',
        teacherId: activeSubject?.teacherId || '',
        date: selectedDate,
        status,
        parentNotified: status === 'absent' || status === 'late',
        timestamp: `${selectedDate} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
      };
    });

    onRecordAttendance(newRecords);
    setAlertFeedback('تم حفظ وتثبيت كشف الحضور والغياب بنجاح في قاعدة البيانات.');
    setTimeout(() => setAlertFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            <span>نظام تسجيل ومتابعة الحضور والغياب اللحظي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل حضور المجموعات، إرسال إشعارات فورية لأولياء الأمور، وتتبع تنبيهات الغياب المتكرر
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAttendanceToExcel(attendanceRecords)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير السجل إكسل</span>
          </button>
        </div>
      </div>

      {alertFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{alertFeedback}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">المرحلة الدراسية والصف:</label>
          <select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">المادة الدراسية:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
          >
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name} ({sub.teacherName})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الحصة:</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Quick Roll Call Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-900">تعيين سريع لكافة طلاب المجموعة:</span>
          <button
            onClick={() => markAll('present')}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            الكل حاضر
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            الكل غائب
          </button>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>حفظ وتثبيت الكشف رسمياً</span>
        </button>
      </div>

      {/* Students Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">كشف الطلاب المقيدين ({stageStudents.length} طالب)</h3>
            <p className="text-[11px] text-slate-500">{activeStage?.name} - {activeSubject?.name}</p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{selectedDate}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {stageStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              لا يوجد طلاب مسجلين في هذه المرحلة حالياً
            </div>
          ) : (
            stageStudents.map((std) => {
              const currentStatus = sessionRoll[std.id] || 'present';
              const isAtRisk = std.attendanceRate < 75;

              return (
                <div key={std.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  
                  {/* Student Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {std.code.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{std.name}</span>
                        {isAtRisk && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> تنبيه غياب متكرر ({std.attendanceRate}%)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {std.groupName} • هاتف ولي الأمر: <span className="font-mono">{std.parentPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Switcher Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    
                    {/* Present */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      حاضر
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      غائب
                    </button>

                    {/* Late */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'late')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentStatus === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      متأخر
                    </button>

                    {/* Excused */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'excused')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentStatus === 'excused'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      معذور
                    </button>

                    {/* Instant WhatsApp Parent Alert */}
                    <a
                      href={`https://wa.me/2${std.parentPhone}?text=${encodeURIComponent(`السلام عليكم، سنتر الأوائل التعليمي: نحيط سيادتكم علماً بأن الطالب/ة (${std.name}) تم تسجيل حالة (${currentStatus === 'absent' ? 'غياب' : currentStatus === 'late' ? 'تأخير' : 'حضور'}) في حصة ${activeSubject.name} بتاريخ ${selectedDate}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition ml-1"
                      title="إرسال رسالة فورية لولي الأمر عبر واتساب"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
