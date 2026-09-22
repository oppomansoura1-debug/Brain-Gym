import React, { useState, useMemo } from 'react';
import { AcademicStage, Subject, Teacher } from '../types';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Users, 
  Table as TableIcon, 
  LayoutGrid, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { INITIAL_STAGES } from '../data/initialData';

interface StagesAndSubjectsViewProps {
  stages: AcademicStage[];
  subjects: Subject[];
  teachers: Teacher[];
  onAddStage: (stage: AcademicStage) => void;
  onAddSubject: (subject: Subject) => void;
  onUpdateStage?: (stage: AcademicStage) => void;
  onDeleteStage?: (stageId: string) => void;
  onUpdateSubject?: (subject: Subject) => void;
  onDeleteSubject?: (subjectId: string) => void;
  hideFinancials?: boolean;
}

const PRESET_MAIN_STAGES = [
  '-- التحضيري',
  '-- القرآن',
  '-- التخاطب',
  'الابتدائية',
  'الاعدادية',
  'الثانويه',
];

const PRESET_GRADES = [
  '--',
  'الصف الاول',
  'الصف الثاني',
  'الصف الثالث',
  'الصف الرابع',
  'الصف الخامس',
  'الصف السادس',
];

export const StagesAndSubjectsView: React.FC<StagesAndSubjectsViewProps> = ({
  stages,
  subjects,
  teachers,
  onAddStage,
  onAddSubject,
  onUpdateStage,
  onDeleteStage,
  onUpdateSubject,
  onDeleteSubject,
  hideFinancials = false,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'subjects'>('stages');
  const [stagesViewMode, setStagesViewMode] = useState<'table' | 'cards'>('table');
  const [selectedMainStageFilter, setSelectedMainStageFilter] = useState<string>('all');
  const [selectedSubjectStageFilter, setSelectedSubjectStageFilter] = useState<string>('all');
  
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<AcademicStage | null>(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Stage form state
  const [stageMain, setStageMain] = useState<string>('الابتدائية');
  const [customMainStage, setCustomMainStage] = useState<string>('');
  const [stageGrade, setStageGrade] = useState<string>('الصف الاول');
  const [customGrade, setCustomGrade] = useState<string>('');
  const [stageName, setStageName] = useState('');
  const [stageCode, setStageCode] = useState('');
  const [stageLevel, setStageLevel] = useState<'special' | 'kindergarten' | 'primary' | 'preparatory' | 'secondary'>('primary');
  const [stageGroupsCount, setStageGroupsCount] = useState<number>(3);
  const [stageStudentsCount, setStageStudentsCount] = useState<number>(30);

  // Subject form
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subStageId, setSubStageId] = useState(stages[0]?.id || '');
  const [subTeacherId, setSubTeacherId] = useState(teachers[0]?.id || '');
  const [subMainStage, setSubMainStage] = useState<string>('الابتدائية');
  const [subFee, setSubFee] = useState(350);
  const [subSessions, setSubSessions] = useState(2);

  // Filter stages based on selected main stage
  const filteredStages = useMemo(() => {
    if (selectedMainStageFilter === 'all') return stages;
    return stages.filter(stg => (stg.mainStage || '') === selectedMainStageFilter);
  }, [stages, selectedMainStageFilter]);

  // Unique main stages for filter tabs
  const mainStageOptions = useMemo(() => {
    const set = new Set<string>();
    PRESET_MAIN_STAGES.forEach(s => set.add(s));
    stages.forEach(s => {
      if (s.mainStage) set.add(s.mainStage);
    });
    return Array.from(set);
  }, [stages]);

  // Unique stages for subject filter
  const subjectMainStageOptions = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach(s => {
      if (s.mainStage) set.add(s.mainStage);
    });
    return Array.from(set);
  }, [subjects]);

  // Filter subjects based on selected stage filter
  const filteredSubjects = useMemo(() => {
    if (selectedSubjectStageFilter === 'all') return subjects;
    return subjects.filter(s => (s.mainStage || '') === selectedSubjectStageFilter);
  }, [subjects, selectedSubjectStageFilter]);

  const openAddStageModal = () => {
    setEditingStage(null);
    setStageMain('الابتدائية');
    setCustomMainStage('');
    setStageGrade('الصف الاول');
    setCustomGrade('');
    setStageName('الابتدائية - الصف الاول');
    setStageCode('PRI-1');
    setStageLevel('primary');
    setStageGroupsCount(3);
    setStageStudentsCount(30);
    setShowAddStageModal(true);
  };

  const openEditStageModal = (stg: AcademicStage) => {
    setEditingStage(stg);
    setStageMain(PRESET_MAIN_STAGES.includes(stg.mainStage) ? stg.mainStage : 'custom');
    if (!PRESET_MAIN_STAGES.includes(stg.mainStage)) {
      setCustomMainStage(stg.mainStage);
    } else {
      setCustomMainStage('');
    }
    const currentGrade = stg.grade || '--';
    setStageGrade(PRESET_GRADES.includes(currentGrade) ? currentGrade : 'custom');
    if (!PRESET_GRADES.includes(currentGrade)) {
      setCustomGrade(currentGrade);
    } else {
      setCustomGrade('');
    }
    setStageName(stg.name);
    setStageCode(stg.code);
    setStageLevel((stg.level as any) || 'primary');
    setStageGroupsCount(stg.groupsCount || 2);
    setStageStudentsCount(stg.studentsCount || 0);
    setShowAddStageModal(true);
  };

  // Auto-generate name and code when main stage or grade changes (if not editing or if user wants default)
  const handleMainStageChange = (newMain: string) => {
    setStageMain(newMain);
    const effectiveMain = newMain === 'custom' ? customMainStage : newMain;
    
    // Auto adjust grade for special categories
    let effectiveGrade = stageGrade;
    if (newMain.startsWith('--')) {
      effectiveGrade = '--';
      setStageGrade('--');
    } else if (stageGrade === '--') {
      effectiveGrade = 'الصف الاول';
      setStageGrade('الصف الاول');
    }

    updateAutoNameAndCode(effectiveMain, effectiveGrade);
  };

  const handleGradeChange = (newGrade: string) => {
    setStageGrade(newGrade);
    const effectiveMain = stageMain === 'custom' ? customMainStage : stageMain;
    const effectiveGrade = newGrade === 'custom' ? customGrade : newGrade;
    updateAutoNameAndCode(effectiveMain, effectiveGrade);
  };

  const updateAutoNameAndCode = (main: string, grade: string) => {
    let generatedName = '';
    let generatedCode = '';
    let generatedLevel: 'special' | 'kindergarten' | 'primary' | 'preparatory' | 'secondary' = 'primary';

    if (main === '-- التحضيري') {
      generatedName = 'التحضيري';
      generatedCode = 'PRE-01';
      generatedLevel = 'special';
    } else if (main === '-- القرآن') {
      generatedName = 'القرآن الكريم';
      generatedCode = 'QRN-01';
      generatedLevel = 'special';
    } else if (main === '-- التخاطب') {
      generatedName = 'التخاطب وتنمية المهارات';
      generatedCode = 'SPH-01';
      generatedLevel = 'special';
    } else if (main === 'الابتدائية') {
      generatedName = grade && grade !== '--' ? `الابتدائية - ${grade}` : 'المرحلة الابتدائية';
      generatedLevel = 'primary';
      const gradeNumMap: Record<string, string> = {
        'الصف الاول': '1',
        'الصف الثاني': '2',
        'الصف الثالث': '3',
        'الصف الرابع': '4',
        'الصف الخامس': '5',
        'الصف السادس': '6',
      };
      generatedCode = `PRI-${gradeNumMap[grade] || '1'}`;
    } else if (main === 'الاعدادية') {
      generatedName = grade && grade !== '--' ? `الاعدادية - ${grade}` : 'المرحلة الاعدادية';
      generatedLevel = 'preparatory';
      const gradeNumMap: Record<string, string> = {
        'الصف الاول': '1',
        'الصف الثاني': '2',
        'الصف الثالث': '3',
      };
      generatedCode = `PREP-${gradeNumMap[grade] || '1'}`;
    } else if (main === 'الثانويه') {
      generatedName = grade && grade !== '--' ? `الثانويه - ${grade}` : 'المرحلة الثانوية';
      generatedLevel = 'secondary';
      const gradeNumMap: Record<string, string> = {
        'الصف الاول': '1',
        'الصف الثاني': '2',
        'الصف الثالث': '3',
      };
      generatedCode = `SEC-${gradeNumMap[grade] || '1'}`;
    } else {
      generatedName = grade && grade !== '--' ? `${main} - ${grade}` : main;
      generatedCode = `STG-${stages.length + 1}`;
    }

    setStageName(generatedName);
    setStageCode(generatedCode);
    setStageLevel(generatedLevel);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMainStage = stageMain === 'custom' ? (customMainStage.trim() || 'مرحلة أساسية') : stageMain;
    const finalGrade = stageGrade === 'custom' ? (customGrade.trim() || '--') : stageGrade;
    const computedName = stageName.trim() || (finalGrade && finalGrade !== '--' ? `${finalMainStage} - ${finalGrade}` : finalMainStage);

    if (editingStage) {
      const updated: AcademicStage = {
        ...editingStage,
        name: computedName,
        mainStage: finalMainStage,
        grade: finalGrade,
        code: stageCode || editingStage.code,
        level: stageLevel,
        groupsCount: Number(stageGroupsCount) || 2,
        studentsCount: Number(stageStudentsCount) || 0,
      };
      if (onUpdateStage) {
        onUpdateStage(updated);
      }
    } else {
      const newStage: AcademicStage = {
        id: `stage_${Date.now()}`,
        name: computedName,
        mainStage: finalMainStage,
        grade: finalGrade,
        code: stageCode || `STG-${stages.length + 1}`,
        level: stageLevel,
        academicYear: '2026/2027',
        groupsCount: Number(stageGroupsCount) || 2,
        studentsCount: Number(stageStudentsCount) || 0,
      };
      onAddStage(newStage);
    }

    setShowAddStageModal(false);
    setEditingStage(null);
  };

  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSubName('');
    setSubCode('');
    setSubStageId(stages[0]?.id || '');
    setSubTeacherId(teachers[0]?.id || '');
    setSubMainStage('الابتدائية');
    setSubFee(250);
    setSubSessions(2);
    setShowAddSubjectModal(true);
  };

  const openEditSubjectModal = (sub: Subject) => {
    setEditingSubject(sub);
    setSubName(sub.name);
    setSubCode(sub.code);
    setSubStageId(sub.stageId);
    setSubTeacherId(sub.teacherId);
    setSubMainStage(sub.mainStage || 'الابتدائية');
    setSubFee(sub.monthlyFee);
    setSubSessions(sub.sessionsPerWeek);
    setShowAddSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const stg = stages.find(s => s.id === subStageId);
    const tchr = teachers.find(t => t.id === subTeacherId);

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        name: subName.trim(),
        code: subCode.trim() || editingSubject.code,
        stageId: subStageId,
        stageName: stg ? stg.name : editingSubject.stageName,
        mainStage: subMainStage || stg?.mainStage || editingSubject.mainStage || 'الابتدائية',
        stageLevel: stg?.level || editingSubject.stageLevel,
        teacherId: subTeacherId,
        teacherName: tchr ? tchr.name : editingSubject.teacherName,
        monthlyFee: Number(subFee),
        sessionsPerWeek: Number(subSessions),
      };
      if (onUpdateSubject) {
        onUpdateSubject(updated);
      }
    } else {
      const newSubject: Subject = {
        id: `sub_${Date.now()}`,
        name: subName.trim(),
        code: subCode.trim() || `SUB-${subjects.length + 1}`,
        stageId: subStageId,
        stageName: stg ? stg.name : 'المرحلة الدراسية',
        mainStage: subMainStage || stg?.mainStage || 'الابتدائية',
        stageLevel: stg?.level || 'primary',
        teacherId: subTeacherId,
        teacherName: tchr ? tchr.name : 'معلم المادة',
        monthlyFee: Number(subFee),
        sessionsPerWeek: Number(subSessions),
      };
      onAddSubject(newSubject);
    }

    setShowAddSubjectModal(false);
    setEditingSubject(null);
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
            <span>المراحل الدراسية والصفوف والمناهج</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدول المراحل الدراسية الأساسية والصفوف المعتمدة، المواد المقررة، وتسعير الاشتراكات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              onClick={openAddStageModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صف / مرحلة</span>
            </button>
          ) : (
            <button
              onClick={openAddSubjectModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة</span>
            </button>
          )}
        </div>
      </div>

      {/* Stages Tab */}
      {activeTab === 'stages' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Filter Pills + View Switcher */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Filter by Main Stage */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 ml-2">المرحلة الأساسية:</span>
              <button
                onClick={() => setSelectedMainStageFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedMainStageFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الكل ({stages.length})
              </button>
              {mainStageOptions.map((mainStage) => {
                const count = stages.filter(s => (s.mainStage || '') === mainStage).length;
                return (
                  <button
                    key={mainStage}
                    onClick={() => setSelectedMainStageFilter(mainStage)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedMainStageFilter === mainStage
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mainStage} ({count})
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
              <button
                onClick={() => setStagesViewMode('table')}
                title="عرض جدول المراحل والصفوف المعتمد"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  stagesViewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول المراحل والصفوف</span>
              </button>
              <button
                onClick={() => setStagesViewMode('cards')}
                title="عرض البطاقات"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  stagesViewMode === 'cards'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>بطاقات</span>
              </button>
            </div>
          </div>

          {/* 1. TABLE VIEW (EXACTLY MATCHING USER'S IMAGE STRUCTURE) */}
          {stagesViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-sm font-bold text-slate-900">
                    جدول المراحل الدراسية الاساسية والصفوف
                  </h3>
                  <span className="text-xs text-slate-500 mr-2">
                    (إجمالي {filteredStages.length} بند مسجل)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  العام الأكاديمي المعتمد: 2026/2027
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      {/* Left Header from the image: المراحل الدراسية الاساسية */}
                      <th className="py-3.5 px-6 font-black text-slate-800 border-l border-slate-200">
                        المراحل الدراسية الاساسية
                      </th>
                      {/* Right Header from the image: الصف */}
                      <th className="py-3.5 px-6 font-black text-slate-800 border-l border-slate-200">
                        الصف
                      </th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 border-l border-slate-200">الكود</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 border-l border-slate-200">المجموعات</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 border-l border-slate-200">الطلاب المقيدون</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                    {filteredStages.map((stage, index) => {
                      const isSpecial = stage.mainStage?.startsWith('--');
                      return (
                        <tr 
                          key={stage.id} 
                          className={`hover:bg-indigo-50/40 transition ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                            {index + 1}
                          </td>

                          {/* المراحل الدراسية الاساسية */}
                          <td className="py-3 px-6 border-l border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                isSpecial 
                                  ? 'bg-amber-500' 
                                  : stage.mainStage === 'الابتدائية' 
                                  ? 'bg-emerald-500' 
                                  : stage.mainStage === 'الاعدادية' 
                                  ? 'bg-blue-500' 
                                  : 'bg-indigo-500'
                              }`}></span>
                              <span className="font-bold text-sm text-slate-900">
                                {stage.mainStage || stage.name}
                              </span>
                            </div>
                          </td>

                          {/* الصف */}
                          <td className="py-3 px-6 font-bold border-l border-slate-200">
                            {stage.grade && stage.grade !== '--' ? (
                              <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200/80">
                                {stage.grade}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-sm px-2">
                                --
                              </span>
                            )}
                          </td>

                          {/* الكود */}
                          <td className="py-3 px-4 border-l border-slate-200">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {stage.code}
                            </span>
                          </td>

                          {/* المجموعات */}
                          <td className="py-3 px-4 font-semibold text-slate-700 border-l border-slate-200">
                            {stage.groupsCount} مجموعات
                          </td>

                          {/* الطلاب المقيدون */}
                          <td className="py-3 px-4 font-bold text-indigo-700 border-l border-slate-200">
                            {stage.studentsCount} طالب
                          </td>

                          {/* إجراءات */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditStageModal(stage)}
                                title="تعديل المرحلة أو الصف"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {onDeleteStage && (
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف ${stage.name}؟`)) {
                                      onDeleteStage(stage.id);
                                    }
                                  }}
                                  title="حذف"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. CARDS VIEW */}
          {stagesViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStages.map((stage) => (
                <div key={stage.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {stage.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{stage.mainStage}</span>
                  </div>
                  
                  <h3 className="font-bold text-base text-slate-900 mb-1">{stage.name}</h3>
                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                    <span>الصف: <strong className="text-slate-800">{stage.grade || '--'}</strong></span>
                  </div>

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

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditStageModal(stage)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    {onDeleteStage && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${stage.name}؟`)) {
                            onDeleteStage(stage.id);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer mr-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* Controls Bar: Stage Filter for Subjects */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 ml-1">تصفية حسب المرحلة:</span>
              <button
                onClick={() => setSelectedSubjectStageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedSubjectStageFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({subjects.length})
              </button>
              {subjectMainStageOptions.map((stageName) => {
                const count = subjects.filter(s => s.mainStage === stageName).length;
                return (
                  <button
                    key={stageName}
                    onClick={() => setSelectedSubjectStageFilter(stageName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedSubjectStageFilter === stageName
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{stageName}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              إجمالي المعروض: <strong className="text-slate-800">{filteredSubjects.length}</strong> مادة
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => (
              <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {sub.mainStage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {sub.mainStage}
                        </span>
                      )}
                      {!hideFinancials && (
                        <span className="text-xs font-bold text-slate-900">
                          {sub.monthlyFee} ج.م / شهر
                        </span>
                      )}
                    </div>
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

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-medium">
                    كود: {sub.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditSubjectModal(sub)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
                      title="تعديل المادة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    {onDeleteSubject && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف مادة (${sub.name})؟`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                        title="حذف المادة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold">لا توجد مواد تعليمية مطابقة في هذا التصنيف</p>
              <button
                onClick={openAddSubjectModal}
                className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                إضافة مادة الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Stage Modal */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  {editingStage ? 'تعديل المرحلة أو الصف الدراسي' : 'إضافة مرحلة أو صف دراسي جديد'}
                </h3>
              </div>
              <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="p-5 space-y-4 text-xs">
              
              {/* اختيار المرحلة الأساسية والصف */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    المرحلة الدراسية الأساسية:
                  </label>
                  <select
                    value={stageMain}
                    onChange={(e) => handleMainStageChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRESET_MAIN_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="custom">+ مرحلة أساسية مخصصة...</option>
                  </select>
                  {stageMain === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customMainStage}
                      onChange={(e) => {
                        setCustomMainStage(e.target.value);
                        updateAutoNameAndCode(e.target.value, stageGrade);
                      }}
                      placeholder="اكتب اسم المرحلة الأساسية..."
                      className="mt-2 w-full border border-indigo-300 rounded-lg px-2.5 py-1.5 bg-white text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    الصف الدراسي:
                  </label>
                  <select
                    value={stageGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRESET_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="custom">+ صف دراسي مخصص...</option>
                  </select>
                  {stageGrade === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customGrade}
                      onChange={(e) => {
                        setCustomGrade(e.target.value);
                        updateAutoNameAndCode(stageMain === 'custom' ? customMainStage : stageMain, e.target.value);
                      }}
                      placeholder="اكتب اسم الصف (مثال: الصف الأول المطور)..."
                      className="mt-2 w-full border border-indigo-300 rounded-lg px-2.5 py-1.5 bg-white text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">كود المرحلة / الصف:</label>
                  <input
                    type="text"
                    value={stageCode}
                    onChange={(e) => setStageCode(e.target.value)}
                    placeholder="PRI-1"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-mono text-slate-900 uppercase font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">يتم توليد الكود والاسم تلقائياً ويمكنك تعديل الكود إن رغبت.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {editingStage ? 'حفظ التعديلات' : 'إضافة للجدول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  {editingSubject ? 'تعديل المادة التعليمية' : 'إضافة مادة تعليمية جديدة'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowAddSubjectModal(false);
                  setEditingSubject(null);
                }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">اسم المادة التعليمية:</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="مثال: الرياضيات"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كود المادة:</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="SUB-01"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المرحلة الأساسية:</label>
                  <select
                    value={subMainStage}
                    onChange={(e) => {
                      const newMain = e.target.value;
                      setSubMainStage(newMain);
                      // Auto pick a matching stage if available
                      const matchedStage = stages.find(s => s.mainStage === newMain);
                      if (matchedStage) setSubStageId(matchedStage.id);
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold text-slate-800"
                  >
                    <option value="الابتدائية">المرحلة الابتدائية</option>
                    <option value="الاعدادية">المرحلة الاعدادية</option>
                    <option value="الثانوية">المرحلة الثانوية</option>
                    <option value="رياض الأطفال">رياض الأطفال</option>
                    <option value="تعليم حر وتأسيس">تعليم حر وتأسيس</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الصف التابع له:</label>
                  <select
                    value={subStageId}
                    onChange={(e) => {
                      setSubStageId(e.target.value);
                      const stg = stages.find(s => s.id === e.target.value);
                      if (stg && stg.mainStage) {
                        setSubMainStage(stg.mainStage);
                      }
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.mainStage})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المعلم المسؤول:</label>
                <select
                  value={subTeacherId}
                  onChange={(e) => setSubTeacherId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
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
                    max="8"
                    value={subSessions}
                    onChange={(e) => setSubSessions(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setEditingSubject(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {editingSubject ? 'حفظ التعديلات' : 'إضافة المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
