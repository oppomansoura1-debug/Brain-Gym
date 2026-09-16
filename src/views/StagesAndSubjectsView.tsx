import React, { useState } from 'react';
import { AcademicStage, Subject, Teacher } from '../types';
import { BookOpen, Layers, Plus, Edit3, Trash2, X, Users } from 'lucide-react';

interface StagesAndSubjectsViewProps {
  stages: AcademicStage[];
  subjects: Subject[];
  teachers: Teacher[];
  onAddStage: (stage: AcademicStage) => void;
  onAddSubject: (subject: Subject) => void;
}

export const StagesAndSubjectsView: React.FC<StagesAndSubjectsViewProps> = ({
  stages,
  subjects,
  teachers,
  onAddStage,
  onAddSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'subjects'>('stages');
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  // Stage form
  const [stageName, setStageName] = useState('');
  const [stageCode, setStageCode] = useState('');
  const [stageLevel, setStageLevel] = useState<'primary' | 'preparatory' | 'secondary'>('secondary');

  // Subject form
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subStageId, setSubStageId] = useState(stages[0]?.id || '');
  const [subTeacherId, setSubTeacherId] = useState(teachers[0]?.id || '');
  const [subFee, setSubFee] = useState(350);
  const [subSessions, setSubSessions] = useState(2);

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    const newStage: AcademicStage = {
      id: `stage_${Date.now()}`,
      name: stageName,
      code: stageCode || `STG-${stages.length + 1}`,
      level: stageLevel,
      academicYear: '2026/2027',
      groupsCount: 2,
      studentsCount: 0,
    };
    onAddStage(newStage);
    setShowAddStageModal(false);
    setStageName('');
    setStageCode('');
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const stg = stages.find(s => s.id === subStageId);
    const tchr = teachers.find(t => t.id === subTeacherId);

    const newSubject: Subject = {
      id: `sub_${Date.now()}`,
      name: subName,
      code: subCode || `SUB-${subjects.length + 1}`,
      stageId: subStageId,
      stageName: stg ? stg.name : 'المرحلة الدراسية',
      teacherId: subTeacherId,
      teacherName: tchr ? tchr.name : 'معلم المادة',
      monthlyFee: Number(subFee),
      sessionsPerWeek: Number(subSessions),
    };

    onAddSubject(newSubject);
    setShowAddSubjectModal(false);
    setSubName('');
    setSubCode('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>المراحل الدراسية والمناهج التعليمية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إعداد الصفوف الدراسية، المواد الأساسية، تسعير الاشتراكات، وجداول الحصص
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('stages')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'stages' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              المراحل والصفوف ({stages.length})
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'subjects' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              المواد التعليمية ({subjects.length})
            </button>
          </div>

          {activeTab === 'stages' ? (
            <button
              onClick={() => setShowAddStageModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مرحلة</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة</span>
            </button>
          )}
        </div>
      </div>

      {/* Stages Tab */}
      {activeTab === 'stages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {stage.code}
                </span>
                <span className="text-xs text-slate-400 font-medium">العام الدراسي: {stage.academicYear}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-3">{stage.name}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 block text-[11px]">عدد المجموعات</span>
                  <span className="font-bold text-slate-900 text-sm">{stage.groupsCount} مجموعات</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 block text-[11px]">الطلاب المقيدون</span>
                  <span className="font-bold text-indigo-600 text-sm">{stage.studentsCount} طالب</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {sub.monthlyFee} ج.م / شهر
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">{sub.name}</h3>
                <span className="text-xs text-slate-500 block mb-3">{sub.stageName}</span>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">معلم المادة:</span>
                    <strong className="text-slate-800">{sub.teacherName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحصص الأسبوعية:</span>
                    <strong className="text-indigo-600">{sub.sessionsPerWeek} حصص أسبوعياً</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">إضافة مرحلة / صف دراسي</h3>
              <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الصف والمرحلة:</label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="مثال: الصف الثاني الإعدادي"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كود المرحلة:</label>
                  <input
                    type="text"
                    value={stageCode}
                    onChange={(e) => setStageCode(e.target.value)}
                    placeholder="PREP-2"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المستوى التعليمي:</label>
                  <select
                    value={stageLevel}
                    onChange={(e) => setStageLevel(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="primary">ابتدائي</option>
                    <option value="preparatory">إعدادي</option>
                    <option value="secondary">ثانوي</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  حفظ المرحلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">إضافة مادة تعليمية جديدة</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المادة التعليمية:</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="مثال: الكيمياء العضوية"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المرحلة التابعة لها:</label>
                  <select
                    value={subStageId}
                    onChange={(e) => setSubStageId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المعلم المسؤول:</label>
                  <select
                    value={subTeacherId}
                    onChange={(e) => setSubTeacherId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الاشتراك الشهري (ج.م):</label>
                  <input
                    type="number"
                    value={subFee}
                    onChange={(e) => setSubFee(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الحصص في الأسبوع:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subSessions}
                    onChange={(e) => setSubSessions(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
