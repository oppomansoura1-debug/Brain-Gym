import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  Bell, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  User as UserIcon,
  Tag,
  Sparkles
} from 'lucide-react';
import { CalendarTask, User } from '../types';

interface CalendarTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  tasks: CalendarTask[];
  onAddTask: (task: Omit<CalendarTask, 'id'>) => void;
  onUpdateTask: (task: CalendarTask) => void;
  onDeleteTask: (taskId: string) => void;
  onTriggerNotification?: (title: string, message: string) => void;
}

export const CalendarTasksModal: React.FC<CalendarTasksModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onTriggerNotification,
}) => {
  // Navigation: Year & Month
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('12:00');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<'exam' | 'attendance' | 'fees' | 'parent_call' | 'admin' | 'general'>('admin');
  const [newAssignedTo, setNewAssignedTo] = useState<string>('all');
  const [newReminderBefore, setNewReminderBefore] = useState<number>(15);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday

  // Arabic days headers (Saturday to Friday)
  const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  // Adjust starting index so 0 corresponds to Saturday (Saturday is 6 in JS standard getDay())
  // In JS: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // We want: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const adjustedStartIndex = (startingDayOfWeek + 1) % 7;

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < adjustedStartIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  // Previous & Next Month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by tab
    if (filterTab === 'today') {
      if (task.date !== todayStr) return false;
    } else if (filterTab === 'upcoming') {
      if (task.completed || task.date < todayStr) return false;
    } else if (filterTab === 'completed') {
      if (!task.completed) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Tasks for the selected day in calendar
  const selectedDayTasks = tasks.filter((t) => t.date === selectedDateStr);

  // Helper to get category text & badge style
  const getCategoryMeta = (cat: CalendarTask['category']) => {
    switch (cat) {
      case 'exam':
        return { label: 'اختبارات وتقييم', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'attendance':
        return { label: 'حضور وغياب', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'fees':
        return { label: 'أقساط ومصروفات', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'parent_call':
        return { label: 'تواصل أولياء أمور', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'admin':
        return { label: 'مهمة إدارية', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: 'مهمة عامة', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const getPriorityMeta = (p: CalendarTask['priority']) => {
    switch (p) {
      case 'high':
        return { label: 'أولوية عاجلة', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'medium':
        return { label: 'أولوية متوسطة', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'أولوية عادية', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // Submit New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedUser = users.find((u) => u.id === newAssignedTo);

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      date: newDate,
      time: newTime,
      priority: newPriority,
      category: newCategory,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      assignedTo: newAssignedTo,
      assignedToName: newAssignedTo === 'all' ? 'الجميع' : assignedUser?.name || 'محدد',
      completed: false,
      reminderMinutesBefore: newReminderBefore,
      reminded: false
    });

    if (onTriggerNotification) {
      onTriggerNotification(
        'تم جدولة مهمة جديدة بنجاح',
        `تمت إضافة "${newTitle.trim()}" ليوم ${newDate} الساعة ${newTime}`
      );
    }

    // Reset and close
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[94vh] sm:h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>التقويم السحابي المتزامن وجدول المهام والتذكيرات</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  مزامنة لحظية
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                جدولة وتذكير بمواعيد الحصص، رصد الحضور، الاختبارات، والمتابعات الإدارية مع إشعارات آلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة جديدة</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split between Calendar and Task Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Calendar Left/Main Pane */}
          <div className="w-full md:w-7/12 p-4 sm:p-6 border-b md:border-b-0 md:border-l border-slate-200 overflow-y-auto flex flex-col">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {monthNamesArabic[month]} {year}
                </h3>
                <button
                  onClick={handleTodayMonth}
                  className="px-2 py-0.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                >
                  اليوم
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {daysArray.map((dayNum, index) => {
                if (dayNum === null) {
                  return <div key={`empty-${index}`} className="h-14 sm:h-16 rounded-xl bg-slate-50/50" />;
                }

                const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                const isToday = dateString === todayStr;
                const isSelected = dateString === selectedDateStr;
                const dayTasks = tasks.filter((t) => t.date === dateString);
                const hasPending = dayTasks.some((t) => !t.completed);

                return (
                  <button
                    key={dateString}
                    onClick={() => setSelectedDateStr(dateString)}
                    className={`h-14 sm:h-16 p-1 rounded-xl flex flex-col justify-between items-center transition relative cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                        : isToday
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-extrabold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold">{dayNum}</span>

                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className={`text-[10px] px-1 rounded-full font-extrabold ${
                            isSelected
                              ? 'bg-white text-indigo-700'
                              : hasPending
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {dayTasks.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary bar */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  مهام يوم: {selectedDateStr} ({selectedDayTasks.length} مهام مسجلة)
                </span>
              </div>
              <button
                onClick={() => {
                  setNewDate(selectedDateStr);
                  setShowAddModal(true);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة لهذا اليوم</span>
              </button>
            </div>
          </div>

          {/* Right Tasks List & Reminders Pane */}
          <div className="w-full md:w-5/12 bg-slate-50/50 flex flex-col overflow-hidden">
            
            {/* Tabs Filter Bar */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-2 text-xs font-bold">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    filterTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterTab('today')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    filterTab === 'today' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اليوم ({tasks.filter((t) => t.date === todayStr).length})
                </button>
                <button
                  onClick={() => setFilterTab('upcoming')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    filterTab === 'upcoming' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  القادمة
                </button>
                <button
                  onClick={() => setFilterTab('completed')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    filterTab === 'completed' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  المكتملة
                </button>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">الفئة:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 outline-hidden"
                >
                  <option value="all">جميع الفئات</option>
                  <option value="exam">اختبارات وتقييم</option>
                  <option value="attendance">حضور وغياب</option>
                  <option value="fees">أقساط ومصروفات</option>
                  <option value="parent_call">تواصل أولياء أمور</option>
                  <option value="admin">إدارية</option>
                </select>
              </div>
            </div>

            {/* Task Cards List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="p-3 bg-slate-100 rounded-full mb-2 text-slate-400">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">لا توجد مهام مطابقة</span>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكنك إضافة مهام وتذكيرات جديدة لمزامنتها مع بقية فريق العمل.
                  </p>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const cat = getCategoryMeta(t.category);
                  const pri = getPriorityMeta(t.priority);
                  const isTaskToday = t.date === todayStr;

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl border transition ${
                        t.completed
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : isTaskToday
                          ? 'bg-white border-indigo-200 shadow-sm'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateTask({
                                ...t,
                                completed: !t.completed,
                                completedAt: !t.completed ? new Date().toISOString() : undefined
                              });
                            }}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                              t.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-indigo-500 bg-white'
                            }`}
                          >
                            {t.completed && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1">
                            <h4 className={`text-xs sm:text-sm font-bold text-slate-900 ${t.completed ? 'line-through text-slate-400' : ''}`}>
                              {t.title}
                            </h4>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {t.description}
                              </p>
                            )}

                            {/* Badges & Meta */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {/* Date & Time */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 ${
                                isTaskToday ? 'bg-indigo-50 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{t.date} {t.time || ''}</span>
                              </span>

                              {/* Category */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${cat.color}`}>
                                {cat.label}
                              </span>

                              {/* Priority */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${pri.color}`}>
                                {pri.label}
                              </span>

                              {/* Assigned To */}
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                                <UserIcon className="w-3 h-3 text-slate-400" />
                                <span>{t.assignedToName || 'الجميع'}</span>
                              </span>

                              {/* Reminder badge */}
                              {t.reminderMinutesBefore !== undefined && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 flex items-center gap-0.5 font-medium">
                                  <Bell className="w-3 h-3" />
                                  <span>تذكير قبل {t.reminderMinutesBefore} د</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteTask(t.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Modal for Creating a New Task */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  <span>إضافة مهمة جديدة وجدولة تذكير</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان المهمة <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: تسجيل حضور المجموعات المسائية، رصد درجات الاختبار..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التفاصيل والملاحظات (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="اكتب ملاحظات إضافية لتوضيح المطلوب من فريق العمل..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      التاريخ المحدد
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      التوقيت (الساعة)
                    </label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      فئة المهمة
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value="attendance">حضور وغياب</option>
                      <option value="exam">اختبارات ونتائج</option>
                      <option value="fees">أقساط ومصروفات</option>
                      <option value="parent_call">تواصل أولياء أمور</option>
                      <option value="admin">إدارية وتنظيمية</option>
                      <option value="general">عامة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الأولوية
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value="high">عاجلة وقصوى</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">عادية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تعيين المهمة إلى
                    </label>
                    <select
                      value={newAssignedTo}
                      onChange={(e) => setNewAssignedTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value="all">فريق العمل بالكامل (الجميع)</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role === 'admin' ? 'مدير' : u.role === 'data_entry' ? 'مدخل بيانات' : 'معلم'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      موعد إرسال إشعار التنبيه
                    </label>
                    <select
                      value={newReminderBefore}
                      onChange={(e) => setNewReminderBefore(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value={0}>في نفس الموعد تماماً</option>
                      <option value={15}>قبل الموعد بـ 15 دقيقة</option>
                      <option value={30}>قبل الموعد بـ 30 دقيقة</option>
                      <option value={60}>قبل الموعد بساعة واحدة</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    حفظ وجدولة المهمة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
