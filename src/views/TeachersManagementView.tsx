import React, { useState, useMemo } from 'react';
import { Teacher, Subject, AcademicStage, FinancialTransaction } from '../types';
import { 
  GraduationCap, 
  Plus, 
  Phone, 
  CheckCircle2, 
  CreditCard, 
  Edit3, 
  Trash2,
  X,
  BookOpen,
  Layers,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

interface TeachersManagementViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  stages?: AcademicStage[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onRecordTeacherPayout: (transaction: FinancialTransaction) => void;
  hideFinancials?: boolean;
}

const DEFAULT_MAIN_STAGES = [
  'الثانويه',
  'الاعدادية',
  'الابتدائية',
  '-- التحضيري',
  '-- القرآن',
  '-- التخاطب'
];

const DEFAULT_GRADES_MAP: Record<string, string[]> = {
  'الثانويه': ['الصف الاول', 'الصف الثاني', 'الصف الثالث'],
  'الاعدادية': ['الصف الاول', 'الصف الثاني', 'الصف الثالث'],
  'الابتدائية': ['الصف الاول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  '-- التحضيري': ['المستوى التمهيدي الأول', 'المستوى التمهيدي الثاني', 'جميع المستويات'],
  '-- القرآن': ['جزء عم وتبارك', 'حفظ متقدم وتجويد', 'حلقات التحفيظ'],
  '-- التخاطب': ['جلسات فردية', 'تأهيل وتخاطب', 'جميع الفئات'],
};

// أسماء المواد التخصصية نقية فقط بدون الصفوف
const BASE_CLEAN_SUBJECTS = [
  'رياضيات',
  'عربي',
  'انجليزي',
  'علوم',
  'دراسات',
  'فيزياء',
  'كيمياء',
  'احياء',
  'تاريخ',
  'جغرافيا',
  'فلسفة ومنطق',
  'علم نفس واجتماع',
  'جيولوجيا',
  'فرنسي',
  'المانى',
  'ايطالي',
  'Math',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'حاسب آلي وتكنولوجيا',
  'القرآن الكريم والتجويد',
  'تخاطب وتأهيل',
];

export const TeachersManagementView: React.FC<TeachersManagementViewProps> = ({
  teachers,
  subjects,
  stages = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onRecordTeacherPayout,
  hideFinancials = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  const [selectedTeacherForPayout, setSelectedTeacherForPayout] = useState<Teacher | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(5000);
  const [payoutMethod, setPayoutMethod] = useState<'cash' | 'instapay' | 'vodafone_cash'>('instapay');

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  
  // Assignments state: (المادة التخصصية - المرحلة الدراسية - الصف الدراسي - سعر المادة بالشهر)
  const [formStages, setFormStages] = useState<string[]>([]);
  const [formAssignmentSubject, setFormAssignmentSubject] = useState<string>('رياضيات');
  const [selectedMainStage, setSelectedMainStage] = useState<string>('الثانويه');
  const [selectedGrade, setSelectedGrade] = useState<string>('الصف الاول');
  const [formStagePrice, setFormStagePrice] = useState<number>(300);

  // Derive unique clean subject names (without stage or grade)
  const cleanSubjectNames = useMemo(() => {
    const set = new Set<string>(BASE_CLEAN_SUBJECTS);
    if (subjects && subjects.length > 0) {
      subjects.forEach(s => {
        const clean = s.name.replace(/\s*\([^)]*\)/g, '').trim();
        if (clean) set.add(clean);
      });
    }
    return Array.from(set);
  }, [subjects]);

  // Derive unique main stages from props or defaults
  const availableMainStages = useMemo(() => {
    if (stages && stages.length > 0) {
      const fromStages = Array.from(new Set(stages.map(s => s.mainStage).filter(Boolean)));
      if (fromStages.length > 0) return fromStages;
    }
    return DEFAULT_MAIN_STAGES;
  }, [stages]);

  // Derive grades for the currently selected main stage
  const availableGradesForCurrentStage = useMemo(() => {
    if (stages && stages.length > 0) {
      const matching = stages.filter(s => s.mainStage === selectedMainStage && s.grade);
      if (matching.length > 0) {
        return Array.from(new Set(matching.map(s => s.grade!)));
      }
    }
    return DEFAULT_GRADES_MAP[selectedMainStage] || ['الصف الاول', 'الصف الثاني', 'الصف الثالث'];
  }, [stages, selectedMainStage]);

  // Keep selectedGrade valid when selectedMainStage changes
  const handleMainStageChange = (newMainStage: string) => {
    setSelectedMainStage(newMainStage);
    const validGrades = stages && stages.length > 0
      ? Array.from(new Set(stages.filter(s => s.mainStage === newMainStage && s.grade).map(s => s.grade!)))
      : DEFAULT_GRADES_MAP[newMainStage] || ['الصف الاول', 'الصف الثاني', 'الصف الثالث'];
    
    if (validGrades.length > 0) {
      setSelectedGrade(validGrades[0]);
    }
  };

  // Add assignment: (المادة التخصصية - المرحلة الدراسية - الصف الدراسي - سعر المادة بالشهر)
  const handleAddAssignment = () => {
    const priceVal = Number(formStagePrice) > 0 ? formStagePrice : 0;
    const assignmentLabel = `${formAssignmentSubject} - ${selectedMainStage} - ${selectedGrade} - سعر المادة بالشهر: ${priceVal} ج.م`;
    const prefix = `${formAssignmentSubject} - ${selectedMainStage} - ${selectedGrade}`;
    
    setFormStages(prev => {
      // If same subject, stage, and grade already exists, update its price with new value
      const filtered = prev.filter(s => !s.startsWith(prefix));
      return [...filtered, assignmentLabel];
    });
  };

  // Remove assignment
  const handleRemoveStage = (assignmentToRemove: string) => {
    setFormStages(prev => prev.filter(s => s !== assignmentToRemove));
  };

  // Open modal for new teacher
  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormName('');
    setFormCode(`TCH-${String(teachers.length + 1).padStart(2, '0')}`);
    setFormPhone('');
    setFormEmail('');
    
    const defaultSubject = cleanSubjectNames[0] || 'رياضيات';
    setFormAssignmentSubject(defaultSubject);

    const defaultStage = availableMainStages[0] || 'الثانويه';
    setSelectedMainStage(defaultStage);
    const grades = DEFAULT_GRADES_MAP[defaultStage] || ['الصف الاول'];
    setSelectedGrade(grades[0] || 'الصف الاول');
    setFormStagePrice(300);
    setFormStages([`${defaultSubject} - ${defaultStage} - ${grades[0] || 'الصف الاول'} - سعر المادة بالشهر: 300 ج.م`]);

    setShowAddModal(true);
  };

  // Open modal for editing existing teacher
  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name);
    setFormCode(teacher.code || `TCH-${teacher.id.replace(/\D/g, '') || '01'}`);
    setFormPhone(teacher.phone);
    setFormEmail(teacher.email);

    const matchedSubject = cleanSubjectNames.find(cs => 
      teacher.subjectName.toLowerCase().includes(cs.toLowerCase())
    ) || cleanSubjectNames[0] || 'رياضيات';
    setFormAssignmentSubject(matchedSubject);

    // Normalize existing stages so each has a subject prefix
    let normalized = (teacher.stages || []).map(stg => {
      const hasSubjectPrefix = cleanSubjectNames.some(cs => stg.startsWith(cs + ' - '));
      if (!hasSubjectPrefix) {
        return `${matchedSubject} - ${stg}`;
      }
      return stg;
    });

    if (normalized.length === 0) {
      normalized = [`${matchedSubject} - الثانويه - الصف الاول - سعر المادة بالشهر: 300 ج.م`];
    }

    setFormStages(normalized);
    setSelectedMainStage(availableMainStages[0] || 'الثانويه');
    setSelectedGrade(availableGradesForCurrentStage[0] || 'الصف الاول');
    setFormStagePrice(300);

    setShowAddModal(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let finalStages = formStages;
    if (finalStages.length === 0) {
      const priceVal = Number(formStagePrice) > 0 ? formStagePrice : 0;
      finalStages = [`${formAssignmentSubject} - ${selectedMainStage} - ${selectedGrade} - سعر المادة بالشهر: ${priceVal} ج.م`];
    }

    // Extract all distinct subjects assigned to this teacher
    const distinctSubjects: string[] = Array.from(
      new Set(
        finalStages.map(stg => {
          const parts = stg.split(' - ');
          return parts[0]?.trim();
        }).filter((x): x is string => Boolean(x))
      )
    );
    const combinedSubjectNames = distinctSubjects.length > 0 
      ? distinctSubjects.join(' ، ') 
      : formAssignmentSubject;

    const matchedSub = subjects.find(s => 
      distinctSubjects.some((sub: string) => s.name.trim().toLowerCase().includes(sub.toLowerCase()))
    );
    const subjectId = matchedSub ? matchedSub.id : `sub_${Date.now()}`;

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        name: formName.trim(),
        code: formCode.trim() || editingTeacher.code || `TCH-01`,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim() || 'teacher'}@educenter.eg`,
        subjectId: subjectId,
        subjectName: combinedSubjectNames,
        stages: finalStages,
      };
      onUpdateTeacher(updated);
    } else {
      const newTeacher: Teacher = {
        id: `tchr_${Date.now()}`,
        code: formCode.trim() || `TCH-${String(teachers.length + 1).padStart(2, '0')}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim() || 'teacher'}@educenter.eg`,
        subjectId: subjectId,
        subjectName: combinedSubjectNames,
        stages: finalStages,
        salaryType: 'percentage',
        rate: 0,
        totalStudents: 0,
        joinDate: new Date().toISOString().split('T')[0],
        active: true,
      };
      onAddTeacher(newTeacher);
    }

    setShowAddModal(false);
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

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchQuery = !searchQuery.trim() || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.phone.includes(searchQuery);

      const matchStage = filterStage === 'all' || 
        t.stages.some(stg => stg.includes(filterStage));

      return matchQuery && matchStage;
    });
  }, [teachers, searchQuery, filterStage]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>إدارة الكادر التعليمي وهيئة التدريس</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل المعلمين، إمكانية تدريس أكثر من مادة لمختلف المراحل والصفوف الدراسية مع سعر المادة بالشهر
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلم جديد للمركز</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المعلم، المادة، الكود، أو الهاتف..."
            className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">المرحلة:</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="all">جميع المراحل</option>
            {availableMainStages.map(stg => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => {
          return (
            <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                      {teacher.name.split(' ')[1]?.[0] || teacher.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                        {teacher.code && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {teacher.code}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-600 font-black block mt-0.5">{teacher.subjectName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${teacher.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {teacher.active ? 'نشط' : 'متوقف'}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(teacher)}
                      title="تعديل بيانات المعلم"
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من رغبتك في حذف المعلم ${teacher.name}؟`)) {
                          onDeleteTeacher(teacher.id);
                        }
                      }}
                      title="حذف المعلم"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> الهاتف:
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{teacher.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <BookOpen className="w-3.5 h-3.5" /> المواد المكلف بها:
                    </span>
                    <span className="font-black text-slate-900 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-100">
                      {teacher.subjectName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">إجمالي طلاب المجموعات:</span>
                    <span className="font-bold text-indigo-600">{teacher.totalStudents} طالب</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1.5 font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{hideFinancials ? 'المواد والمراحل والصفوف المكلف بها:' : 'المواد والمراحل والصفوف والأسعار الشهرية:'}</span>
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {teacher.stages && teacher.stages.length > 0 ? (
                        teacher.stages.map((stg, i) => {
                          const parts = stg.split(' - ');
                          const subName = parts[0];
                          const rest = parts.slice(1).join(' - ');
                          const displayRest = hideFinancials ? (rest || stg).replace(/\s*-\s*سعر المادة بالشهر:[^]*$/, '') : (rest || stg);
                          return (
                            <div key={i} className="text-[11px] font-semibold bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 p-2 rounded-lg flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                                  {subName}
                                </span>
                                <span className="text-slate-700 font-bold">{displayRest}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-slate-400">لم تحدد مراحل ومواد بعد</span>
                      )}
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

                {!hideFinancials && (
                  <button
                    onClick={() => {
                      setSelectedTeacherForPayout(teacher);
                      setPayoutAmount(5000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>صرف المستحقات</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-400/20">
                  <GraduationCap className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    {editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد للمركز'}
                  </h3>
                  <p className="text-[11px] text-indigo-200 mt-0.5">
                    تحديد المواد التخصصية، المراحل، الصفوف الدراسية وسعر المادة بالشهر
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* اسم المعلم وكوده */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">اسم المعلم ثلاثي أو رباعي:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: أ. محمد عبد الله النجار"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">كود المعلم:</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="TCH-01"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* بيانات الاتصال (الهاتف والبريد) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم الهاتف (واتساب):</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-mono font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">البريد الإلكتروني (اختياري):</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="teacher@educenter.eg"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* قسم: المادة التخصصية والمرحلة الدراسية والصف الدراسي وسعر المادة بالشهر */}
              {/* (المادة التخصصية - المرحلة الدراسية - الصف الدراسي - سعر المادة بالشهر) */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl space-y-3">
                
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-indigo-950">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>المادة التخصصية والمرحلة والصف الدراسي وسعر المادة بالشهر:</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-md">
                    (يمكن إضافة أكثر من مادة ومرحلة)
                  </span>
                </div>

                {/* شريط اختيار المادة والمرحلة والصف وسعر الشهر وزر الإضافة */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
                  
                  {/* 1. اسم المادة التخصصية (قائمة منسدلة فقط بدون الصف) */}
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>المادة التخصصية:</span>
                    </label>
                    <select
                      value={formAssignmentSubject}
                      onChange={(e) => setFormAssignmentSubject(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs"
                    >
                      {cleanSubjectNames.map((subName) => (
                        <option key={subName} value={subName}>{subName}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. المرحلة الدراسية */}
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">المرحلة الدراسية:</label>
                    <select
                      value={selectedMainStage}
                      onChange={(e) => handleMainStageChange(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs"
                    >
                      {availableMainStages.map((stg) => (
                        <option key={stg} value={stg}>{stg}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. الصف الدراسي */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">الصف الدراسي:</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs"
                    >
                      {availableGradesForCurrentStage.map((grd) => (
                        <option key={grd} value={grd}>{grd}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4. سعر المادة بالشهر */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">سعر الشهر (ج.م):</label>
                    <input
                      type="number"
                      min="0"
                      value={formStagePrice}
                      onChange={(e) => setFormStagePrice(Number(e.target.value))}
                      placeholder="300"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900 font-black focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs"
                    />
                  </div>

                  {/* 5. زر إضافة التكليف */}
                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddAssignment}
                      className="w-full h-[38px] flex items-center justify-center gap-1 px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                      title="إضافة المادة والمرحلة والصف وسعر الشهر"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>

                </div>

                {/* قائمة المواد والمراحل والصفوف والأسعار المحددة للمعلم */}
                <div>
                  <label className="block font-bold text-indigo-950 mb-1.5 text-[11px]">
                    المواد والمراحل والصفوف المكلف بها المعلم ({formStages.length}):
                  </label>
                  
                  {formStages.length === 0 ? (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-indigo-200 text-slate-500 text-center text-xs flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>حدد المادة، المرحلة، الصف، وسعر المادة بالشهر ثم اضغط "إضافة"</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                      {formStages.map((stg) => {
                        const parts = stg.split(' - ');
                        const subName = parts[0];
                        const rest = parts.slice(1).join(' - ');

                        return (
                          <div
                            key={stg}
                            className="flex items-center justify-between bg-white border border-indigo-200 text-indigo-950 px-3 py-2 rounded-xl shadow-xs font-bold text-xs"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{subName}</span>
                              </span>
                              <span className="text-slate-800 text-xs font-bold">{rest || stg}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveStage(stg)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition cursor-pointer shrink-0"
                              title="حذف هذا التكليف"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* أزرار الإجراءات */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTeacher ? 'تحديث بيانات المعلم' : 'حفظ المعلم بالمركز'}</span>
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
                <p className="text-slate-600">المواد: <strong className="text-slate-900">{selectedTeacherForPayout.subjectName}</strong></p>
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
