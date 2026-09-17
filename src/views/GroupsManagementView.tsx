import React, { useState, useMemo } from 'react';
import { 
  EducationalGroup, 
  Student, 
  Teacher, 
  Subject, 
  AcademicStage 
} from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  UserPlus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  DollarSign, 
  Layers,
  ChevronDown,
  UserCheck,
  Phone,
  ShieldCheck,
  FileSpreadsheet,
  CalendarPlus,
  Coins
} from 'lucide-react';

interface GroupsManagementViewProps {
  groups: EducationalGroup[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  stages: AcademicStage[];
  onAddGroup: (group: EducationalGroup, initialStudentIds?: string[]) => void;
  onUpdateGroup: (group: EducationalGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEnrollStudentInGroup: (groupId: string, studentId: string) => void;
  onRemoveStudentFromGroup: (groupId: string, studentId: string) => void;
  onAddNewStudentAndEnroll?: (student: Partial<Student>, groupId: string) => void;
}

export const GroupsManagementView: React.FC<GroupsManagementViewProps> = ({
  groups,
  students,
  teachers,
  subjects,
  stages,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onEnrollStudentInGroup,
  onRemoveStudentFromGroup,
  onAddNewStudentAndEnroll,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainStageFilter, setSelectedMainStageFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EducationalGroup | null>(null);
  
  // Quick Student Enrollment Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [targetGroupForEnroll, setTargetGroupForEnroll] = useState<EducationalGroup | null>(null);
  const [enrollStudentMode, setEnrollStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>('');
  
  // New student quick-register form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentParentPhone, setNewStudentParentPhone] = useState('');

  // Group Details Roster Modal
  const [rosterGroup, setRosterGroup] = useState<EducationalGroup | null>(null);

  // Success / alert feedback toast
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // ==========================================
  // Form State for "إنشاء مجموعة جديدة"
  // ==========================================
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formMainStage, setFormMainStage] = useState('الثانويه');
  const [formGrade, setFormGrade] = useState('الصف الأول');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  // Multiple schedule days: [ { day: 'السبت', time: '04:00 م - 06:00 م' }, ... ]
  const [scheduleSlots, setScheduleSlots] = useState<{ id: string; day: string; time: string }[]>([
    { id: '1', day: 'السبت', time: '04:00 م - 06:00 م' },
    { id: '2', day: 'الثلاثاء', time: '04:00 م - 06:00 م' }
  ]);
  // Manual Subject Price / Fee input
  const [formSubjectPrice, setFormSubjectPrice] = useState<string>('300');
  const [formNotes, setFormNotes] = useState('');

  // Available Main Stages
  const availableMainStages = useMemo(() => {
    const defaultList = ['الابتدائية', 'الاعدادية', 'الثانويه', '-- القرآن', '-- التحضيري', '-- التخاطب'];
    const fromStages = stages.map(s => s.mainStage).filter(Boolean);
    return Array.from(new Set([...defaultList, ...fromStages]));
  }, [stages]);

  // Available Grades for chosen Main Stage
  const availableGradesForForm = useMemo(() => {
    if (formMainStage === 'الابتدائية') {
      return ['الصف الاول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];
    }
    if (formMainStage === 'الاعدادية') {
      return ['الصف الاول', 'الصف الثاني', 'الصف الثالث'];
    }
    if (formMainStage === 'الثانويه') {
      return ['الصف الاول', 'الصف الثاني', 'الصف الثالث'];
    }
    // For special stages
    const matched = stages.filter(s => s.mainStage === formMainStage).map(s => s.grade || s.name);
    return matched.length > 0 ? Array.from(new Set(matched)) : ['-- عام'];
  }, [formMainStage, stages]);

  // Available Subjects for chosen Main Stage and Grade
  const availableSubjectsForForm = useMemo(() => {
    return subjects.filter(s => {
      const matchMain = !s.mainStage || s.mainStage === formMainStage;
      return matchMain;
    });
  }, [subjects, formMainStage]);

  // Active Subject selected in the form
  const currentSelectedSubject = useMemo(() => {
    return subjects.find(s => s.id === formSubjectId);
  }, [subjects, formSubjectId]);

  // CRITICAL REQUIREMENT:
  // "اسم المعلم (اظهر اسماء المعلمين المسجلين في المادة فقط)"
  const eligibleTeachersForSelectedSubject = useMemo(() => {
    if (!currentSelectedSubject) {
      return [];
    }

    const subName = (currentSelectedSubject.name || '').trim().toLowerCase();
    const subId = currentSelectedSubject.id;
    const subTeacherId = currentSelectedSubject.teacherId;

    const filtered = teachers.filter(t => {
      // 1. Matched by direct teacher ID on subject
      if (subTeacherId && t.id === subTeacherId) return true;
      // 2. Matched by subject ID on teacher
      if (t.subjectId && t.subjectId === subId) return true;
      // 3. Matched by subject name string equality or substring
      const teacherSubName = (t.subjectName || '').trim().toLowerCase();
      if (teacherSubName && subName) {
        if (teacherSubName === subName) return true;
        if (subName.includes(teacherSubName) || teacherSubName.includes(subName)) return true;
      }
      // 4. Matched by teacher name on subject
      if (currentSelectedSubject.teacherName && t.name === currentSelectedSubject.teacherName) return true;

      return false;
    });

    // If no teacher directly matched yet, return at least the assigned teacher or all teachers if none
    if (filtered.length === 0 && currentSelectedSubject.teacherId) {
      const fallback = teachers.filter(t => t.id === currentSelectedSubject.teacherId);
      if (fallback.length > 0) return fallback;
    }

    return filtered;
  }, [currentSelectedSubject, teachers]);

  // Filter eligible teachers by search query (by teacher name or code)
  const filteredTeachersForForm = useMemo(() => {
    const q = teacherSearchQuery.trim().toLowerCase();
    if (!q) return eligibleTeachersForSelectedSubject;
    return eligibleTeachersForSelectedSubject.filter(t => 
      t.name.toLowerCase().includes(q) || 
      (t.code && t.code.toLowerCase().includes(q))
    );
  }, [eligibleTeachersForSelectedSubject, teacherSearchQuery]);

  // Helper to open Add Modal with fresh defaults
  const openAddGroupModal = () => {
    setEditingGroup(null);
    const initialMain = 'الثانويه';
    const initialGrade = 'الصف الأول';
    setFormMainStage(initialMain);
    setFormGrade(initialGrade);

    // Pick first subject matching
    const matchingSubs = subjects.filter(s => !s.mainStage || s.mainStage === initialMain);
    const firstSub = matchingSubs[0] || subjects[0];
    
    setFormSubjectId(firstSub ? firstSub.id : '');
    setFormSubjectPrice(firstSub ? String(firstSub.monthlyFee) : '300');

    // Find teacher for this sub
    let initialTeacherId = '';
    if (firstSub) {
      const tchr = teachers.find(t => t.id === firstSub.teacherId || t.subjectId === firstSub.id);
      initialTeacherId = tchr ? tchr.id : (firstSub.teacherId || teachers[0]?.id || '');
    }
    setFormTeacherId(initialTeacherId);
    setTeacherSearchQuery('');

    const initialCode = `GRP-${Date.now().toString().slice(-4)}`;
    setFormCode(initialCode);
    setFormName(`مجموعة (أ) - ${firstSub?.name || 'مادة'}`);
    setScheduleSlots([
      { id: '1', day: 'السبت', time: '04:00 م - 06:00 م' },
      { id: '2', day: 'الثلاثاء', time: '04:00 م - 06:00 م' }
    ]);
    setFormNotes('');

    setShowAddGroupModal(true);
  };

  // When formMainStage changes, pick corresponding subjects & update name
  const handleMainStageChange = (newMainStage: string) => {
    setFormMainStage(newMainStage);
    const matchingSubs = subjects.filter(s => !s.mainStage || s.mainStage === newMainStage);
    const firstSub = matchingSubs[0] || subjects[0];
    if (firstSub) {
      setFormSubjectId(firstSub.id);
      setFormSubjectPrice(String(firstSub.monthlyFee));
      // Auto-filter teacher
      const tchr = teachers.find(t => t.id === firstSub.teacherId || t.subjectId === firstSub.id);
      setFormTeacherId(tchr ? tchr.id : (firstSub.teacherId || ''));
      setTeacherSearchQuery('');
      setFormName(`مجموعة جديدة - ${firstSub.name}`);
    }
  };

  // When formSubjectId changes, auto-select teacher and fee
  const handleSubjectChange = (newSubjectId: string) => {
    setFormSubjectId(newSubjectId);
    const sub = subjects.find(s => s.id === newSubjectId);
    if (sub) {
      setFormSubjectPrice(String(sub.monthlyFee));
      setFormName(`مجموعة (أ) - ${sub.name}`);
      // Find teachers registered in this subject
      const subName = (sub.name || '').trim().toLowerCase();
      const matched = teachers.filter(t => 
        t.id === sub.teacherId || 
        t.subjectId === sub.id || 
        (t.subjectName && (t.subjectName.toLowerCase().includes(subName) || subName.includes(t.subjectName.toLowerCase())))
      );
      if (matched.length > 0) {
        setFormTeacherId(matched[0].id);
      } else if (sub.teacherId) {
        setFormTeacherId(sub.teacherId);
      }
      setTeacherSearchQuery('');
    }
  };

  // Edit existing group
  const openEditGroupModal = (grp: EducationalGroup) => {
    setEditingGroup(grp);
    setFormName(grp.name);
    setFormCode(grp.code);
    setFormMainStage(grp.mainStage || 'الثانويه');
    setFormGrade(grp.grade || 'الصف الأول');
    setFormSubjectId(grp.subjectId);
    setFormTeacherId(grp.teacherId);
    setTeacherSearchQuery('');
    
    // Parse existing schedule string into slots if formatted with " | "
    if (grp.schedule && grp.schedule.trim()) {
      const parts = grp.schedule.split(' | ');
      const parsedSlots = parts.map((part, idx) => {
        const colonIdx = part.indexOf(':');
        if (colonIdx !== -1) {
          const day = part.slice(0, colonIdx).trim();
          const time = part.slice(colonIdx + 1).trim();
          return { id: String(idx + 1), day: day || 'السبت', time: time || '04:00 م - 06:00 م' };
        }
        return { id: String(idx + 1), day: part.trim() || 'السبت', time: '04:00 م - 06:00 م' };
      });
      setScheduleSlots(parsedSlots.length > 0 ? parsedSlots : [{ id: '1', day: 'السبت', time: '04:00 م - 06:00 م' }]);
    } else {
      setScheduleSlots([{ id: '1', day: 'السبت', time: '04:00 م - 06:00 م' }]);
    }

    setFormSubjectPrice(String(grp.monthlyFee || 300));
    setFormNotes(grp.notes || '');
    setShowAddGroupModal(true);
  };

  // Schedule slot handlers
  const handleAddScheduleSlot = () => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    // pick a day not yet added, or fallback to next day
    const usedDays = new Set(scheduleSlots.map(s => s.day));
    const nextDay = days.find(d => !usedDays.has(d)) || 'الأربعاء';
    setScheduleSlots(prev => [
      ...prev,
      { id: Date.now().toString(), day: nextDay, time: '04:00 م - 06:00 م' }
    ]);
  };

  const handleRemoveScheduleSlot = (slotId: string) => {
    if (scheduleSlots.length <= 1) {
      showToast('يجب تحديد يوم واحد على الأقل للمجموعة.', 'info');
      return;
    }
    setScheduleSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleUpdateScheduleSlot = (slotId: string, field: 'day' | 'time', value: string) => {
    setScheduleSlots(prev => prev.map(s => s.id === slotId ? { ...s, [field]: value } : s));
  };

  // Save Group Form
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSubjectId) return;

    const sub = subjects.find(s => s.id === formSubjectId);
    const tchr = teachers.find(t => t.id === formTeacherId);
    const matchedStage = stages.find(s => s.mainStage === formMainStage && (!s.grade || s.grade === formGrade)) || stages[0];

    // Combine schedule slots into readable text
    const compiledSchedule = scheduleSlots
      .map(s => `${s.day}: ${s.time}`)
      .join(' | ');

    const parsedPrice = parseFloat(formSubjectPrice) || 0;

    if (editingGroup) {
      const updated: EducationalGroup = {
        ...editingGroup,
        name: formName.trim(),
        code: formCode.trim() || editingGroup.code,
        stageId: matchedStage ? matchedStage.id : editingGroup.stageId,
        stageName: matchedStage ? matchedStage.name : `${formMainStage} - ${formGrade}`,
        mainStage: formMainStage,
        grade: formGrade,
        subjectId: formSubjectId,
        subjectName: sub ? sub.name : editingGroup.subjectName,
        teacherId: formTeacherId,
        teacherName: tchr ? tchr.name : (sub?.teacherName || editingGroup.teacherName),
        schedule: compiledSchedule,
        monthlyFee: parsedPrice,
        notes: formNotes,
        studentIds: editingGroup.studentIds || [],
      };
      onUpdateGroup(updated);
      showToast(`تم تعديل بيانات المجموعة "${updated.name}" بنجاح.`);
    } else {
      const newGroup: EducationalGroup = {
        id: `grp_${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim() || `GRP-${Date.now().toString().slice(-4)}`,
        stageId: matchedStage ? matchedStage.id : 'stage_custom',
        stageName: matchedStage ? matchedStage.name : `${formMainStage} - ${formGrade}`,
        mainStage: formMainStage,
        grade: formGrade,
        subjectId: formSubjectId,
        subjectName: sub ? sub.name : 'مادة تعليمية',
        teacherId: formTeacherId,
        teacherName: tchr ? tchr.name : (sub?.teacherName || 'معلم المادة'),
        schedule: compiledSchedule,
        room: '',
        maxCapacity: 100,
        studentIds: [],
        monthlyFee: parsedPrice,
        active: true,
        notes: formNotes,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddGroup(newGroup, []);
      showToast(`تم إنشاء المجموعة التعليمية "${newGroup.name}" بنجاح.`);
    }

    setShowAddGroupModal(false);
  };

  // Open Quick Enrollment Modal for a specific group
  const handleOpenEnrollForGroup = (grp: EducationalGroup) => {
    setTargetGroupForEnroll(grp);
    setSelectedStudentToEnroll('');
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentParentPhone('');
    setEnrollStudentMode('existing');
    setShowEnrollModal(true);
  };

  // Submit Enrollment
  const handleSubmitEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupForEnroll) return;

    if (enrollStudentMode === 'existing') {
      if (!selectedStudentToEnroll) return;
      
      // Check if student already enrolled
      if (targetGroupForEnroll.studentIds.includes(selectedStudentToEnroll)) {
        showToast('الطالب مسجل بالفعل في هذه المجموعة والمادة!', 'info');
        return;
      }

      onEnrollStudentInGroup(targetGroupForEnroll.id, selectedStudentToEnroll);
      const std = students.find(s => s.id === selectedStudentToEnroll);
      showToast(`تم تسجيل الطالب "${std?.name || 'المختار'}" في مادة ${targetGroupForEnroll.subjectName} ومجموعة ${targetGroupForEnroll.name} بنجاح.`);
    } else {
      // New student registration
      if (!newStudentName.trim()) return;
      if (onAddNewStudentAndEnroll) {
        onAddNewStudentAndEnroll({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim() || '01000000000',
          parentPhone: newStudentParentPhone.trim() || '01000000000',
          parentName: `ولي أمر ${newStudentName.trim()}`,
          stageId: targetGroupForEnroll.stageId,
          stageName: targetGroupForEnroll.stageName,
          groupName: targetGroupForEnroll.name,
          monthlyFee: targetGroupForEnroll.monthlyFee,
        }, targetGroupForEnroll.id);
        showToast(`تم إنشاء قيد جديد للطالب "${newStudentName.trim()}" وتسجيله في مادة ${targetGroupForEnroll.subjectName}.`);
      }
    }

    setShowEnrollModal(false);
    // If roster is open, keep it updated
    if (rosterGroup && rosterGroup.id === targetGroupForEnroll.id) {
      setRosterGroup(prev => prev ? {
        ...prev,
        studentIds: [...prev.studentIds, selectedStudentToEnroll]
      } : null);
    }
  };

  // Remove student from group roster
  const handleRemoveStudent = (groupId: string, studentId: string, studentName: string) => {
    if (window.confirm(`هل أنت متأكد من إلغاء تسجيل الطالب "${studentName}" من هذه المجموعة والمادة؟`)) {
      onRemoveStudentFromGroup(groupId, studentId);
      showToast(`تم إلغاء تسجيل الطالب من المجموعة.`);
      if (rosterGroup && rosterGroup.id === groupId) {
        setRosterGroup(prev => prev ? {
          ...prev,
          studentIds: prev.studentIds.filter(id => id !== studentId)
        } : null);
      }
    }
  };

  // Delete Group
  const handleDeleteGroupClick = (grp: EducationalGroup) => {
    if (window.confirm(`هل أنت متأكد من حذف المجموعة التعليمية "${grp.name}"؟ سيتم إلغاء ربط الطلاب المسجلين بها.`)) {
      onDeleteGroup(grp.id);
      showToast(`تم حذف المجموعة التعليمية.`);
      if (rosterGroup?.id === grp.id) setRosterGroup(null);
    }
  };

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Search
      const searchMatch = !searchTerm.trim() || 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

      // Main Stage filter
      const stageMatch = selectedMainStageFilter === 'all' || g.mainStage === selectedMainStageFilter;
      
      // Grade filter
      const gradeMatch = selectedGradeFilter === 'all' || g.grade === selectedGradeFilter;

      // Subject filter
      const subjectMatch = selectedSubjectFilter === 'all' || g.subjectId === selectedSubjectFilter;

      // Teacher filter
      const teacherMatch = selectedTeacherFilter === 'all' || g.teacherId === selectedTeacherFilter;

      return searchMatch && stageMatch && gradeMatch && subjectMatch && teacherMatch;
    });
  }, [groups, searchTerm, selectedMainStageFilter, selectedGradeFilter, selectedSubjectFilter, selectedTeacherFilter]);

  // Overall Statistics
  const totalStudentsInGroups = useMemo(() => {
    const uniqueIds = new Set<string>();
    groups.forEach(g => g.studentIds.forEach(id => uniqueIds.add(id)));
    return uniqueIds.size;
  }, [groups]);

  const totalSeats = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.maxCapacity || 25), 0);
  }, [groups]);

  const occupancyRate = totalSeats > 0 
    ? Math.min(100, Math.round((groups.reduce((acc, g) => acc + g.studentIds.length, 0) / totalSeats) * 100))
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-400/30 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>إدارة الفصول والمجموعات التعليمية والتسجيل</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              المجموعات التعليمية وتسجيل المواد
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              إنشاء وإدارة المجموعات الدراسية لكل مرحلة وصف، وتسجيل الطلاب في المواد مع المعلمين المتخصصين فقط مع تتبع الطاقة الاستيعابية.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openAddGroupModal}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-indigo-900 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600 stroke-[3]" />
              <span>إنشاء مجموعة جديدة</span>
            </button>

            {groups.length > 0 && (
              <button
                onClick={() => handleOpenEnrollForGroup(groups[0])}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل طالب في مادة</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-right">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">إجمالي المجموعات</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">{groups.length}</span>
            <span className="text-[10px] text-indigo-300">مجموعة نشطة حالياً</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">الطلاب بالحصص</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              {groups.reduce((acc, g) => acc + g.studentIds.length, 0)}
            </span>
            <span className="text-[10px] text-slate-300">{totalStudentsInGroups} طالب مسجل مستقل</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">نسبة الإشغال الإجمالية</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 block">{occupancyRate}%</span>
            <span className="text-[10px] text-slate-300">من إجمالي {totalSeats} مقعد</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">المعلمون بالمواد</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">{teachers.length}</span>
            <span className="text-[10px] text-cyan-300">معلم متخصص مسجل</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث باسم المجموعة، المادة، المعلم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs font-semibold text-slate-500">طريقة العرض:</span>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بطاقات
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جدول
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* المرحلة */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">المرحلة الدراسية:</label>
            <select
              value={selectedMainStageFilter}
              onChange={(e) => {
                setSelectedMainStageFilter(e.target.value);
                setSelectedGradeFilter('all');
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">كل المراحل الدراسية</option>
              {availableMainStages.map(stg => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>

          {/* الصف */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">الصف الدراسي:</label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">كل الصفوف</option>
              <option value="الصف الاول">الصف الأول</option>
              <option value="الصف الثاني">الصف الثاني</option>
              <option value="الصف الثالث">الصف الثالث</option>
              <option value="الصف الرابع">الصف الرابع</option>
              <option value="الصف الخامس">الصف الخامس</option>
              <option value="الصف السادس">الصف السادس</option>
            </select>
          </div>

          {/* المادة */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">المادة التعليمية:</label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">كل المواد</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.mainStage || s.stageName})</option>
              ))}
            </select>
          </div>

          {/* المعلم */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">المعلم:</label>
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">كل المعلمين</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.subjectName}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Groups Listing */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">لا توجد مجموعات تعليمية مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            يمكنك تغيير معايير الفلترة أو إنشاء مجموعة تعليمية جديدة لتسجيل الطلاب في المواد.
          </p>
          <button
            onClick={openAddGroupModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء مجموعة جديدة الآن</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGroups.map(group => {
            const enrolledCount = group.studentIds.length;
            const capacity = group.maxCapacity || 25;
            const percentFilled = Math.min(100, Math.round((enrolledCount / capacity) * 100));
            const isFull = enrolledCount >= capacity;

            return (
              <div 
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                        {group.code}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                        {group.mainStage}
                      </span>
                      {group.grade && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {group.grade}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 truncate leading-snug">
                      {group.name}
                    </h3>
                  </div>

                  {/* Actions Dropdown / buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditGroupModal(group)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="تعديل بيانات المجموعة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroupClick(group)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="حذف المجموعة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 text-xs flex-1">
                  
                  {/* Subject and Teacher details */}
                  <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium">المادة التعليمية:</span>
                      <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        {group.subjectName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>معلم المادة:</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {group.teacherName}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Room */}
                  <div className="space-y-1.5 text-slate-600">
                    {group.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">{group.schedule}</span>
                      </div>
                    )}
                    {group.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600">{group.room}</span>
                      </div>
                    )}
                  </div>

                  {/* Students Enrolled / Capacity Progress */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>الطلاب المسجلون:</span>
                      </span>
                      <span className="font-black text-slate-900">
                        <span className={enrolledCount > 0 ? 'text-indigo-600' : 'text-slate-400'}>
                          {enrolledCount}
                        </span>
                        <span className="text-slate-400 text-[11px]"> / {capacity}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          isFull 
                            ? 'bg-rose-500' 
                            : percentFilled > 75 
                            ? 'bg-amber-500' 
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{isFull ? 'المجموعة ممتلئة' : `متبقي ${capacity - enrolledCount} مقعد`}</span>
                      <span className="font-semibold">{group.monthlyFee} ج.م / شهر</span>
                    </div>
                  </div>

                </div>

                {/* Card Footer: Quick Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEnrollForGroup(group)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>تسجيل طالب في المادة</span>
                  </button>

                  <button
                    onClick={() => setRosterGroup(group)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
                    title="عرض كشف الطلاب المسجلين"
                  >
                    كشف الطلاب ({enrolledCount})
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">الكود</th>
                  <th className="py-3 px-4">اسم المجموعة</th>
                  <th className="py-3 px-4">المرحلة والصف</th>
                  <th className="py-3 px-4">المادة التعليمية</th>
                  <th className="py-3 px-4">المعلم المسجل</th>
                  <th className="py-3 px-4">المواعيد والقاعة</th>
                  <th className="py-3 px-4 text-center">الطلاب / السعة</th>
                  <th className="py-3 px-4">الاشتراك</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map(group => {
                  const count = group.studentIds.length;
                  const capacity = group.maxCapacity || 25;
                  return (
                    <tr key={group.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {group.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-black text-slate-900 block">{group.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {group.mainStage} - {group.grade || '--'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md font-bold border border-indigo-100">
                          {group.subjectName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {group.teacherName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{group.schedule || '--'}</div>
                        <div className="text-[10px] text-slate-400">{group.room}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-slate-900">{count}</span>
                        <span className="text-slate-400"> / {capacity}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {group.monthlyFee} ج.م
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEnrollForGroup(group)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                            title="تسجيل طالب في المادة"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>تسجيل طالب</span>
                          </button>
                          <button
                            onClick={() => setRosterGroup(group)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="كشف الطلاب"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditGroupModal(group)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroupClick(group)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ========================================================= */}
      {/* MODAL: إنشاء مجموعة جديدة (Add/Edit Group Modal) */}
      {/* ========================================================= */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-black">
                    {editingGroup ? 'تعديل بيانات المجموعة التعليمية' : 'إنشاء مجموعة تعليمية جديدة'}
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    تحديد المرحلة، الصف، المادة، سعر المادة، المعلم المتخصص، ومواعيد الحصص
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGroup} className="p-6 space-y-4 text-xs">
              
              {/* المرحلة التعليمية والصف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">المرحلة التعليمية:</label>
                  <select
                    value={formMainStage}
                    onChange={(e) => handleMainStageChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    {availableMainStages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">الصف الدراسي:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    {availableGradesForForm.map(grd => (
                      <option key={grd} value={grd}>{grd}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* فصل اسم المادة عن سعر المادة وجعل سعر المادة يقبل الكتابة اليدوية */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100">
                
                {/* اسم المادة (مستقلة تماماً) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-indigo-950 mb-1">اسم المادة:</label>
                  <select
                    required
                    value={formSubjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full border border-indigo-200 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    {availableSubjectsForForm.length === 0 ? (
                      <option value="">لا توجد مواد مسجلة لهذه المرحلة</option>
                    ) : (
                      availableSubjectsForForm.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* سعر المادة (خانة تقبل الكتابة اليدوية) */}
                <div>
                  <label className="block font-bold text-indigo-950 mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-indigo-600" />
                    <span>سعر المادة (ج.م):</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={formSubjectPrice}
                    onChange={(e) => setFormSubjectPrice(e.target.value)}
                    placeholder="مثال: 350"
                    className="w-full border border-indigo-200 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                  <span className="text-[10px] text-indigo-500 font-medium">قابلة للتعديل والكتابة اليدوية</span>
                </div>

              </div>

              {/* اسم المعلم (المسجلين في المادة فقط) + إمكانية البحث باسم المعلم أو كوده */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    اسم المعلم:
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-md">
                    المسجلون في المادة فقط
                  </span>
                </div>

                {/* حقل البحث باسم المعلم أو كوده */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={teacherSearchQuery}
                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                    placeholder="بحث باسم المعلم أو الكود الخاص به..."
                    className="w-full pr-9 pl-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                  {teacherSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTeacherSearchQuery('')}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* قائمة المعلمين المتطابقين */}
                <select
                  required
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {filteredTeachersForForm.length === 0 ? (
                    <option value="">
                      {teacherSearchQuery 
                        ? '-- لم يتم العثور على معلم يطابق كلمة البحث --' 
                        : '-- لا يوجد معلم مسجل لهذه المادة --'}
                    </option>
                  ) : (
                    filteredTeachersForForm.map(tchr => (
                      <option key={tchr.id} value={tchr.id}>
                        {tchr.name} [كود: {tchr.code}] (تخصص: {tchr.subjectName})
                      </option>
                    ))
                  )}
                </select>

                {eligibleTeachersForSelectedSubject.length === 0 && (
                  <p className="text-[10px] text-amber-700">
                    تنبيه: يمكنك تسجيل معلمين لهذه المادة من صفحة "المعلمون".
                  </p>
                )}
              </div>

              {/* المواعيد: اختيار اليوم والميعاد مع إمكانية تحديد أكثر من يوم عبر "إضافة يوم" */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>المواعيد الأسبوعية (اختيار اليوم والميعاد):</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScheduleSlot}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة يوم</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {scheduleSlots.map((slot, index) => (
                    <div key={slot.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] font-bold text-slate-400 w-5">#{index + 1}</span>
                        
                        {/* اختيار اليوم */}
                        <div className="w-36">
                          <select
                            value={slot.day}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'day', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                          >
                            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* تحديد الميعاد */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={slot.time}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'time', e.target.value)}
                            placeholder="مثال: 04:00 م - 06:00 م"
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                          />
                        </div>
                      </div>

                      {/* زر حذف اليوم */}
                      <button
                        type="button"
                        onClick={() => handleRemoveScheduleSlot(slot.id)}
                        disabled={scheduleSlots.length <= 1}
                        title={scheduleSlots.length <= 1 ? 'يجب الإبقاء على موعد واحد على الأقل' : 'حذف هذا اليوم'}
                        className={`p-1.5 rounded-lg transition self-end sm:self-center ${
                          scheduleSlots.length <= 1 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* اسم المجموعة التعريفي والكود */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المجموعة التعريفي:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: مجموعة النخبة (أ) - فيزياء"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود المجموعة:</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="GRP-01"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-mono uppercase font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* ملاحظات إضافية */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية:</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="مثال: تشمل المذكرات والاختبارات الدورية للمجموعة"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingGroup ? 'حفظ التعديلات' : 'تأكيد وإنشاء المجموعة'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: تسجيل طالب في مادة (Enroll Student in Subject/Group) */}
      {/* ========================================================= */}
      {showEnrollModal && targetGroupForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-black">تسجيل طالب في مادة تعليمية</h3>
                  <p className="text-[11px] text-emerald-200">
                    مادة: {targetGroupForEnroll.subjectName} | {targetGroupForEnroll.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Group Snapshot */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">المعلم المسجل للمادة:</span>
                <span className="font-bold text-slate-900">{targetGroupForEnroll.teacherName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">المرحلة والصف:</span>
                <span className="font-bold text-slate-900">{targetGroupForEnroll.mainStage} - {targetGroupForEnroll.grade}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الاشتراك الشهري:</span>
                <span className="font-black text-emerald-700">{targetGroupForEnroll.monthlyFee} ج.م</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEnrollment} className="p-6 space-y-4 text-xs">
              
              {/* Enrollment Mode Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEnrollStudentMode('existing')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    enrollStudentMode === 'existing'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اختيار طالب مقيد بالسنتر
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollStudentMode('new')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    enrollStudentMode === 'new'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  تسجيل طالب جديد فوري
                </button>
              </div>

              {enrollStudentMode === 'existing' ? (
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    اختر الطالب لتسجيله في مادة "{targetGroupForEnroll.subjectName}":
                  </label>
                  <select
                    required
                    value={selectedStudentToEnroll}
                    onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    <option value="">-- اختر من قائمة الطلاب المقيدين --</option>
                    {students.map(std => {
                      const isAlreadyEnrolled = targetGroupForEnroll.studentIds.includes(std.id);
                      return (
                        <option key={std.id} value={std.id} disabled={isAlreadyEnrolled}>
                          {std.name} - كود: {std.code} ({std.stageName}) {isAlreadyEnrolled ? '✓ (مسجل بالفعل)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">اسم الطالب الرباعي:</label>
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="مثال: يوسف محمود حسن علي"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">رقم هاتف الطالب:</label>
                      <input
                        type="tel"
                        value={newStudentPhone}
                        onChange={(e) => setNewStudentPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">رقم ولي الأمر:</label>
                      <input
                        type="tel"
                        value={newStudentParentPhone}
                        onChange={(e) => setNewStudentParentPhone(e.target.value)}
                        placeholder="012XXXXXXXX"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد تسجيل الطالب في المادة</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: كشف الطلاب المسجلين في المجموعة (Roster Modal) */}
      {/* ========================================================= */}
      {rosterGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-black">
                    كشف الطلاب المسجلين - {rosterGroup.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    مادة: {rosterGroup.subjectName} | المعلم: {rosterGroup.teacherName} | {rosterGroup.studentIds.length} طالب
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRosterGroup(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                السعة القصوى: {rosterGroup.studentIds.length} / {rosterGroup.maxCapacity || 25} طالب
              </span>

              <button
                onClick={() => handleOpenEnrollForGroup(rosterGroup)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ تسجيل طالب إضافي في هذه المادة</span>
              </button>
            </div>

            {/* Roster List */}
            <div className="p-6 max-h-[60vh] overflow-y-auto text-xs">
              {rosterGroup.studentIds.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">لا يوجد طلاب مسجلون في هذه المجموعة حالياً</p>
                  <p className="text-slate-500 text-[11px] mt-1">اضغط على زر "تسجيل طالب إضافي" للبدء بإضافة الطلاب.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">الكود</th>
                        <th className="py-2.5 px-3">اسم الطالب</th>
                        <th className="py-2.5 px-3">هاتف الطالب</th>
                        <th className="py-2.5 px-3">هاتف ولي الأمر</th>
                        <th className="py-2.5 px-3">الحالة المالية</th>
                        <th className="py-2.5 px-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rosterGroup.studentIds.map((stdId, idx) => {
                        const std = students.find(s => s.id === stdId);
                        if (!std) return null;
                        return (
                          <tr key={std.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{std.code}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{std.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{std.phone}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{std.parentPhone}</td>
                            <td className="py-2.5 px-3">
                              {std.balance < 0 ? (
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                  عليه {Math.abs(std.balance)} ج.م
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  خالص الحساب
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleRemoveStudent(rosterGroup.id, std.id, std.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="إلغاء تسجيل الطالب من هذه المجموعة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setRosterGroup(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
