import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  User,
  Student, 
  Teacher, 
  AcademicStage, 
  Subject, 
  EducationalGroup,
  FinancialTransaction, 
  AttendanceRecord, 
  StudentAssessment, 
  SystemNotification,
  AttendanceStatus,
  CenterSettings,
  AuditLog,
  BackupLog,
  ChatMessage,
  CalendarTask
} from './types';
import { 
  INITIAL_USERS,
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_STAGES, 
  INITIAL_SUBJECTS, 
  INITIAL_GROUPS,
  INITIAL_TRANSACTIONS, 
  INITIAL_ATTENDANCE, 
  INITIAL_ASSESSMENTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MESSAGES,
  INITIAL_CALENDAR_TASKS
} from './data/initialData';
import { getBackupHistoryLogs } from './services/securityBackup';
import { 
  testConnection,
  subscribeTeachers,
  saveTeacherToCloud,
  deleteTeacherFromCloud,
  subscribeStudents,
  saveStudentToCloud,
  deleteStudentFromCloud,
  subscribeGroups,
  saveGroupToCloud,
  deleteGroupFromCloud,
  subscribeStages,
  saveStageToCloud,
  deleteStageFromCloud,
  subscribeSubjects,
  saveSubjectToCloud,
  deleteSubjectFromCloud,
  subscribeTransactions,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  subscribeAttendance,
  saveAttendanceToCloud,
  subscribeAssessments,
  saveAssessmentToCloud,
  subscribeSettings,
  saveSettingsToCloud,
  subscribeUsers,
  saveUserToCloud,
  deleteUserFromCloud,
  subscribeMessages,
  saveMessageToCloud,
  subscribeCalendarTasks,
  saveCalendarTaskToCloud,
  deleteCalendarTaskFromCloud,
  forceManualFullSync
} from './services/firebaseSync';
import { Check, AlertCircle } from 'lucide-react';
import { checkStageSuitability } from './utils/stageUtils';

// UI Components
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { NotificationsModal } from './components/NotificationsModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BackupSecurityModal } from './components/BackupSecurityModal';
import { UsersManagementModal } from './components/UsersManagementModal';
import { InternalChatModal } from './components/InternalChatModal';
import { CalendarTasksModal } from './components/CalendarTasksModal';

// Views
import { AdminDashboardView } from './views/AdminDashboardView';
import { StudentsManagementView } from './views/StudentsManagementView';
import { TeachersManagementView } from './views/TeachersManagementView';
import { GroupsManagementView } from './views/GroupsManagementView';
import { StagesAndSubjectsView } from './views/StagesAndSubjectsView';
import { FinancialView } from './views/FinancialView';
import { AttendanceView } from './views/AttendanceView';
import { AssessmentsView } from './views/AssessmentsView';
import { DataEntryPortalView } from './views/DataEntryPortalView';
import { TeacherPortalView } from './views/TeacherPortalView';

export default function App() {
  // Users and Authentication State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('educenter_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User[];
        const missing = INITIAL_USERS.filter(
          (iu) => !parsed.some((pu) => pu.id === iu.id || pu.username.toLowerCase() === iu.username.toLowerCase())
        );
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('educenter_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global User Role
  const currentRole: UserRole = currentUser?.role || 'admin';
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persist users and current session
  useEffect(() => {
    localStorage.setItem('educenter_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('educenter_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('educenter_current_user');
    }
  }, [currentUser]);

  // Guard activeTab based on user role
  useEffect(() => {
    if (currentRole === 'data_entry') {
      const allowedDataEntryTabs = ['students', 'teachers', 'groups', 'stages', 'attendance'];
      if (!allowedDataEntryTabs.includes(activeTab)) {
        setActiveTab('students');
      }
    }
  }, [currentRole, activeTab]);

  // Handle Login & Logout
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'data_entry') {
      setActiveTab('students');
    } else if (user.role === 'teacher') {
      setActiveTab('teacher_portal');
    } else {
      setActiveTab('dashboard');
    }

    // Add audit log
    const loginAudit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'تسجيل دخول ناجح للمنظومة',
      user: user.name,
      role: user.role,
      details: `تم التحقق بنجاح من اعتماد المستخدم (${user.email})`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [loginAudit, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      const logoutAudit: AuditLog = {
        id: `aud_${Date.now()}`,
        action: 'تسجيل خروج من المنظومة',
        user: currentUser.name,
        role: currentUser.role,
        details: `قام المستخدم بتسجيل الخروج بأمان`,
        timestamp: new Date().toLocaleString('ar-EG'),
        ipAddress: '192.168.1.1'
      };
      setAuditLogs(prev => [logoutAudit, ...prev]);
    }
    setCurrentUser(null);
  };

  // Core Data State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('educenter_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('educenter_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [stages, setStages] = useState<AcademicStage[]>(() => {
    const saved = localStorage.getItem('educenter_stages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If user has old cache with fewer than 15 stages or missing mainStage field, upgrade to INITIAL_STAGES
        if (Array.isArray(parsed) && parsed.length >= 15 && parsed[0]?.mainStage) {
          return parsed;
        }
      } catch {
        // fallback to INITIAL_STAGES
      }
    }
    return INITIAL_STAGES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('educenter_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Upgrade if saved cache has fewer than 20 subjects or lacks mainStage
        if (Array.isArray(parsed) && parsed.length >= 20 && parsed[0]?.mainStage) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_SUBJECTS;
  });

  const [groups, setGroups] = useState<EducationalGroup[]>(() => {
    const saved = localStorage.getItem('educenter_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_GROUPS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('educenter_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('educenter_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [assessments, setAssessments] = useState<StudentAssessment[]>(() => {
    const saved = localStorage.getItem('educenter_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('educenter_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [centerSettings, setCenterSettings] = useState<CenterSettings>(() => {
    const saved = localStorage.getItem('educenter_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          address: 'المنصورة ش الاديب متفرع من ش الترعه',
          phone: '01110168237',
          vodafoneCashWallet: '01110168237',
          fawryMerchantCode: '01110168237',
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(getBackupHistoryLogs);

  // Messages & Chat State (Internal Messages)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('educenter_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Calendar & Synchronized Tasks State
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>(() => {
    const saved = localStorage.getItem('educenter_calendar_tasks');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_TASKS;
  });

  // Modals
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCalendarTasksModal, setShowCalendarTasksModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | undefined>(undefined);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState<FinancialTransaction | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Manual Cloud Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await forceManualFullSync({
        students,
        teachers,
        groups,
        stages,
        subjects,
        transactions,
        attendanceRecords,
        assessments,
        centerSettings,
        users,
        messages,
        calendarTasks,
      });

      setLastSyncTime(result.timestamp);
      setSyncToast({
        type: 'success',
        message: result.message
      });

      // Add system notification for confirmation
      const notif: SystemNotification = {
        id: `sync_${Date.now()}`,
        title: 'مزامنة وتأكيد سحابي فوري',
        message: `تم التحقق بنجاح وحفظ كافة البيانات في السحابة (${result.totalSynced} عنصر).`,
        type: 'system_info',
        targetRole: 'all',
        timestamp: result.timestamp,
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      setTimeout(() => {
        setSyncToast(null);
      }, 4500);
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setSyncToast({
        type: 'error',
        message: 'تعذر إتمام المزامنة السحابية. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.'
      });
      setTimeout(() => {
        setSyncToast(null);
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-time Cloud Synchronization with Firebase Firestore
  useEffect(() => {
    testConnection();

    const unsubTeachers = subscribeTeachers((cloudTeachers) => {
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachers(cloudTeachers);
      }
    }, INITIAL_TEACHERS);

    const unsubStudents = subscribeStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    }, INITIAL_STUDENTS);

    const unsubGroups = subscribeGroups((cloudGroups) => {
      if (cloudGroups && cloudGroups.length > 0) {
        setGroups(cloudGroups);
      }
    }, INITIAL_GROUPS);

    const unsubStages = subscribeStages((cloudStages) => {
      if (cloudStages && cloudStages.length > 0) {
        setStages(cloudStages);
      }
    }, INITIAL_STAGES);

    const unsubSubjects = subscribeSubjects((cloudSubjects) => {
      if (cloudSubjects && cloudSubjects.length > 0) {
        setSubjects(cloudSubjects);
      }
    }, INITIAL_SUBJECTS);

    const unsubTransactions = subscribeTransactions((cloudTxns) => {
      if (cloudTxns && cloudTxns.length > 0) {
        setTransactions(cloudTxns);
      }
    }, INITIAL_TRANSACTIONS);

    const unsubAttendance = subscribeAttendance((cloudAtt) => {
      if (cloudAtt && cloudAtt.length > 0) {
        setAttendanceRecords(cloudAtt);
      }
    }, INITIAL_ATTENDANCE);

    const unsubAssessments = subscribeAssessments((cloudAss) => {
      if (cloudAss && cloudAss.length > 0) {
        setAssessments(cloudAss);
      }
    }, INITIAL_ASSESSMENTS);

    const unsubSettings = subscribeSettings((cloudSettings) => {
      if (cloudSettings) {
        setCenterSettings(cloudSettings);
      }
    }, INITIAL_SETTINGS);

    const unsubUsers = subscribeUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    }, INITIAL_USERS);

    const unsubMessages = subscribeMessages((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setMessages(cloudMsgs);
      }
    }, INITIAL_MESSAGES);

    const unsubTasks = subscribeCalendarTasks((cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setCalendarTasks(cloudTasks);
      }
    }, INITIAL_CALENDAR_TASKS);

    return () => {
      unsubTeachers();
      unsubStudents();
      unsubGroups();
      unsubStages();
      unsubSubjects();
      unsubTransactions();
      unsubAttendance();
      unsubAssessments();
      unsubSettings();
      unsubUsers();
      unsubMessages();
      unsubTasks();
    };
  }, []);

  // Offline cache backup
  useEffect(() => {
    localStorage.setItem('educenter_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('educenter_calendar_tasks', JSON.stringify(calendarTasks));
  }, [calendarTasks]);

  useEffect(() => {
    localStorage.setItem('educenter_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('educenter_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('educenter_stages', JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem('educenter_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('educenter_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('educenter_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('educenter_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('educenter_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('educenter_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('educenter_settings', JSON.stringify(centerSettings));
  }, [centerSettings]);

  // Automated Task Reminder & Due Checker
  useEffect(() => {
    const checkTaskReminders = () => {
      const now = new Date();
      const nowTime = now.getTime();

      calendarTasks.forEach((task) => {
        if (task.completed || task.reminded) return;

        const reminderMinutes = task.reminderMinutesBefore ?? 15;
        const taskDateTimeStr = `${task.date}T${task.time || '00:00'}`;
        const taskTime = new Date(taskDateTimeStr).getTime();
        const reminderTime = taskTime - (reminderMinutes * 60 * 1000);

        // If current time is within or past reminder window (within reasonable 4 hours)
        if (nowTime >= reminderTime && nowTime <= taskTime + 14400000) {
          const reminderNotif: SystemNotification = {
            id: `task_remind_${task.id}_${Date.now()}`,
            title: `⏰ تذكير بمهمة: ${task.title}`,
            message: `موعد المهمة: ${task.date} في تمام الساعة ${task.time || ''} - المعين: ${task.assignedToName || 'الجميع'}.`,
            type: 'task_reminder',
            targetRole: 'all',
            timestamp: 'الآن',
            read: false
          };

          setNotifications((prev) => [reminderNotif, ...prev]);

          // Mark reminded in state & Cloud to prevent duplicate alerts
          const updatedTask: CalendarTask = { ...task, reminded: true };
          saveCalendarTaskToCloud(updatedTask).catch(console.error);
          setCalendarTasks((prev) => prev.map((t) => t.id === task.id ? updatedTask : t));
        }
      });
    };

    checkTaskReminders();
    const interval = setInterval(checkTaskReminders, 30000);
    return () => clearInterval(interval);
  }, [calendarTasks]);

  // Chat & Messaging Handlers
  const handleSendMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);
    saveMessageToCloud(newMsg).catch(console.error);

    // Create system notification for internal team alert
    if (newMsg.recipientId === 'all' || newMsg.recipientId !== currentUser?.id) {
      const chatNotif: SystemNotification = {
        id: `notif_chat_${Date.now()}`,
        title: `رسالة داخلية جديدة من ${newMsg.senderName}`,
        message: newMsg.text || (newMsg.imageUrl ? 'أرسل صورة مرفقة' : 'أرسل تسجيلاً صوتياً'),
        type: 'chat_message',
        targetRole: 'all',
        timestamp: 'الآن',
        read: false
      };
      setNotifications((prev) => [chatNotif, ...prev]);
    }
  };

  // Calendar Tasks Handlers
  const handleAddCalendarTask = (taskData: Omit<CalendarTask, 'id'>) => {
    const newTask: CalendarTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    setCalendarTasks((prev) => [...prev, newTask]);
    saveCalendarTaskToCloud(newTask).catch(console.error);
  };

  const handleUpdateCalendarTask = (task: CalendarTask) => {
    setCalendarTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
    saveCalendarTaskToCloud(task).catch(console.error);
  };

  const handleDeleteCalendarTask = (taskId: string) => {
    setCalendarTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteCalendarTaskFromCloud(taskId).catch(console.error);
  };

  const handleTriggerCustomNotification = (title: string, message: string) => {
    const notif: SystemNotification = {
      id: `custom_notif_${Date.now()}`,
      title,
      message,
      type: 'task_reminder',
      targetRole: 'all',
      timestamp: 'الآن',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const unreadMessagesCount = messages.filter(
    (m) => currentUser && !m.readBy?.includes(currentUser.id) && m.senderId !== currentUser.id && (m.recipientId === 'all' || m.recipientId === currentUser.id)
  ).length;
  const todayTasksCount = calendarTasks.filter((t) => t.date === todayStr && !t.completed).length;

  // Adapt active tab when switching view
  const handleRoleChange = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
    }
    if (role === 'data_entry') {
      setActiveTab('data_portal');
    } else if (role === 'teacher') {
      setActiveTab('teacher_portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Student Handlers
  const handleAddStudent = (newStudent: Student) => {
    saveStudentToCloud(newStudent).catch(console.error);
    setStudents(prev => [newStudent, ...prev.filter(s => s.id !== newStudent.id)]);

    // Add notification
    const notif: SystemNotification = {
      id: `notif_${Date.now()}`,
      title: 'تسجيل طالب جديد بالمركز',
      message: `تم قيد الطالب ${newStudent.name} بنجاح في ${newStudent.stageName}.`,
      type: 'system_info',
      targetRole: 'admin',
      linkTab: 'students',
      timestamp: 'الآن',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    saveStudentToCloud(updatedStudent).catch(console.error);
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudentFromCloud(studentId).catch(console.error);
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Trigger payment for student
  const handlePayForStudent = (studentId: string) => {
    const std = students.find(s => s.id === studentId);
    setSelectedStudentForPayment(std);
    setShowPaymentModal(true);
  };

  // Payment completed
  const handlePaymentSuccess = (newTxn: FinancialTransaction) => {
    saveTransactionToCloud(newTxn).catch(console.error);
    setTransactions(prev => [newTxn, ...prev.filter(t => t.id !== newTxn.id)]);

    // If payment belongs to a student, clear or credit their balance
    if (newTxn.studentId) {
      setStudents(prev => prev.map(std => {
        if (std.id === newTxn.studentId) {
          const updated = {
            ...std,
            balance: Math.min(0, std.balance + newTxn.amount), // settle balance
          };
          saveStudentToCloud(updated).catch(console.error);
          return updated;
        }
        return std;
      }));
    }

    // Add alert notification
    const notif: SystemNotification = {
      id: `notif_pay_${Date.now()}`,
      title: 'عملية سداد إلكتروني ناجحة',
      message: `تم تحصيل مبلغ ${newTxn.amount} ج.م عبر ${newTxn.paymentMethodName} (إيصال ${newTxn.invoiceNumber}).`,
      type: 'payment_received',
      targetRole: 'all',
      linkTab: 'financial',
      timestamp: 'الآن',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    // Automatically display the printable receipt
    setSelectedTransactionForReceipt(newTxn);
    setShowReceiptModal(true);
  };

  // Teacher Handlers
  const handleAddTeacher = (teacher: Teacher) => {
    saveTeacherToCloud(teacher).catch(console.error);
    setTeachers(prev => [teacher, ...prev.filter(t => t.id !== teacher.id)]);
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    saveTeacherToCloud(teacher).catch(console.error);
    setTeachers(prev => prev.map(t => t.id === teacher.id ? teacher : t));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    deleteTeacherFromCloud(teacherId).catch(console.error);
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  // Group Handlers & Student Subject Enrollment
  const handleAddGroup = (group: EducationalGroup, initialStudentIds?: string[]) => {
    saveGroupToCloud(group).catch(console.error);
    setGroups(prev => [group, ...prev.filter(g => g.id !== group.id)]);

    // If initial students are enrolled in this group/subject, update their profiles
    if (initialStudentIds && initialStudentIds.length > 0) {
      setStudents(prev => prev.map(std => {
        if (initialStudentIds.includes(std.id)) {
          const currentGroups = std.enrolledGroupIds || [];
          const currentSubs = std.enrolledSubjectIds || [];
          const updatedStd = {
            ...std,
            groupName: group.name,
            enrolledGroupIds: Array.from(new Set([...currentGroups, group.id])),
            enrolledSubjectIds: Array.from(new Set([...currentSubs, group.subjectId])),
          };
          saveStudentToCloud(updatedStd).catch(console.error);
          return updatedStd;
        }
        return std;
      }));
    }

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'إنشاء مجموعة تعليمية جديدة',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم إنشاء المجموعة (${group.name}) لمادة (${group.subjectName}) وتعيين المعلم (${group.teacherName})`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleUpdateGroup = (group: EducationalGroup) => {
    saveGroupToCloud(group).catch(console.error);
    setGroups(prev => prev.map(g => g.id === group.id ? group : g));
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroupFromCloud(groupId).catch(console.error);
    const grp = groups.find(g => g.id === groupId);
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setStudents(prev => prev.map(s => {
      const updated = {
        ...s,
        enrolledGroupIds: (s.enrolledGroupIds || []).filter(id => id !== groupId),
      };
      if (s.enrolledGroupIds?.includes(groupId)) {
        saveStudentToCloud(updated).catch(console.error);
      }
      return updated;
    }));

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'حذف مجموعة تعليمية',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم حذف المجموعة (${grp?.name || groupId}) وإلغاء ارتباط الطلاب بها`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleEnrollStudentInGroup = (groupId: string, studentId: string) => {
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;
    const std = students.find(s => s.id === studentId);
    if (!std) return;

    // Academic stage validation: ensure student is suitable for group's stage
    if (!checkStageSuitability(std, grp, stages)) {
      console.warn(`[Academic Suitability Warning]: Student "${std.name}" (${std.stageName}) is not suitable for group "${grp.name}" (${grp.stageName || grp.mainStage})`);
      return;
    }

    // Add student ID to group
    const updatedGroup = {
      ...grp,
      studentIds: Array.from(new Set([...grp.studentIds, studentId])),
    };
    saveGroupToCloud(updatedGroup).catch(console.error);
    setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));

    // Update student enrolled groups and subjects
    setStudents(prev => prev.map(std => {
      if (std.id === studentId) {
        const currentGroups = std.enrolledGroupIds || [];
        const currentSubs = std.enrolledSubjectIds || [];
        const updatedStd = {
          ...std,
          groupName: std.groupName || grp.name,
          enrolledGroupIds: Array.from(new Set([...currentGroups, grp.id])),
          enrolledSubjectIds: Array.from(new Set([...currentSubs, grp.subjectId])),
        };
        saveStudentToCloud(updatedStd).catch(console.error);
        return updatedStd;
      }
      return std;
    }));

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'تسجيل طالب في مادة تعليمية',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم تسجيل الطالب (${std?.name || studentId}) في مادة (${grp.subjectName}) بالمجموعة (${grp.name})`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleRemoveStudentFromGroup = (groupId: string, studentId: string) => {
    const grp = groups.find(g => g.id === groupId);
    if (grp) {
      const updatedGroup = {
        ...grp,
        studentIds: grp.studentIds.filter(id => id !== studentId),
      };
      saveGroupToCloud(updatedGroup).catch(console.error);
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
    }

    setStudents(prev => prev.map(std => {
      if (std.id === studentId) {
        const updatedStd = {
          ...std,
          enrolledGroupIds: (std.enrolledGroupIds || []).filter(id => id !== groupId),
        };
        saveStudentToCloud(updatedStd).catch(console.error);
        return updatedStd;
      }
      return std;
    }));
  };

  const handleAddNewStudentAndEnroll = (newStudentData: Partial<Student>, groupId: string) => {
    const grp = groups.find(g => g.id === groupId);
    const newStudentId = `std_${Date.now()}`;
    const newCode = `STD-2026-${String(students.length + 1).padStart(3, '0')}`;

    const newStudent: Student = {
      id: newStudentId,
      code: newCode,
      name: newStudentData.name || 'طالب جديد',
      stageId: newStudentData.stageId || grp?.stageId || stages[0]?.id || 'stage_sec_1',
      stageName: newStudentData.stageName || grp?.stageName || stages[0]?.name || 'المرحلة الثانوية',
      groupName: grp ? grp.name : (newStudentData.groupName || 'مجموعة عامة'),
      phone: newStudentData.phone || '01000000000',
      parentName: newStudentData.parentName || `ولي أمر ${newStudentData.name}`,
      parentPhone: newStudentData.parentPhone || '01200000000',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      monthlyFee: newStudentData.monthlyFee || grp?.monthlyFee || 300,
      balance: 0,
      attendanceRate: 100,
      averageScore: 90,
      enrolledGroupIds: grp ? [grp.id] : [],
      enrolledSubjectIds: grp ? [grp.subjectId] : [],
    };

    saveStudentToCloud(newStudent).catch(console.error);
    setStudents(prev => [newStudent, ...prev]);

    if (grp) {
      const updatedGroup = {
        ...grp,
        studentIds: Array.from(new Set([...grp.studentIds, newStudentId])),
      };
      saveGroupToCloud(updatedGroup).catch(console.error);
      setGroups(prev => prev.map(g => (g.id === groupId ? updatedGroup : g)));
    }
  };

  // Financial Handlers
  const handleAddTransaction = (txn: FinancialTransaction) => {
    saveTransactionToCloud(txn).catch(console.error);
    setTransactions(prev => [txn, ...prev.filter(t => t.id !== txn.id)]);
  };

  // Attendance Handlers
  const handleRecordAttendance = (records: AttendanceRecord[]) => {
    records.forEach(r => saveAttendanceToCloud(r).catch(console.error));
    setAttendanceRecords(prev => [...records, ...prev]);

    // Update students attendance rates based on new records
    records.forEach(rec => {
      if (rec.status === 'absent') {
        setStudents(curr => curr.map(s => {
          if (s.id === rec.studentId) {
            const newRate = Math.max(40, s.attendanceRate - 5);
            const updated = { ...s, attendanceRate: newRate };
            saveStudentToCloud(updated).catch(console.error);
            return updated;
          }
          return s;
        }));
      }
    });
  };

  const handleSendParentAlert = (student: Student, status: AttendanceStatus, subjectName: string) => {
    const notif: SystemNotification = {
      id: `notif_att_${Date.now()}`,
      title: `تنبيه ${status === 'absent' ? 'غياب' : 'تأخير'} طالب`,
      message: `تم رصد ${status === 'absent' ? 'غياب' : 'تأخير'} الطالب ${student.name} في حصة ${subjectName} وتم إشعار ولي الأمر.`,
      type: 'absence_alert',
      targetRole: 'all',
      linkTab: 'attendance',
      studentId: student.id,
      timestamp: 'الآن',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Assessment Handlers
  const handleAddAssessment = (assessment: StudentAssessment) => {
    saveAssessmentToCloud(assessment).catch(console.error);
    setAssessments(prev => [assessment, ...prev.filter(a => a.id !== assessment.id)]);

    // Update student's averageScore
    setStudents(prev => prev.map(s => {
      if (s.id === assessment.studentId) {
        const updated = {
          ...s,
          averageScore: Math.round(assessment.percentage),
        };
        saveStudentToCloud(updated).catch(console.error);
        return updated;
      }
      return s;
    }));

    if (assessment.needsSupport) {
      const notif: SystemNotification = {
        id: `notif_asm_${Date.now()}`,
        title: 'تنبيه أداء دراسي منخفض',
        message: `حصل الطالب ${assessment.studentName} على ${assessment.score}/${assessment.maxScore} (${assessment.percentage.toFixed(0)}%) في ${assessment.examTitle}.`,
        type: 'grade_warning',
        targetRole: 'teacher',
        linkTab: 'assessments',
        studentId: assessment.studentId,
        timestamp: 'الآن',
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Stages & Subjects Handlers
  const handleAddStage = (stage: AcademicStage) => {
    saveStageToCloud(stage).catch(console.error);
    setStages(prev => [...prev.filter(s => s.id !== stage.id), stage]);
  };

  const handleUpdateStage = (stage: AcademicStage) => {
    saveStageToCloud(stage).catch(console.error);
    setStages(prev => prev.map(s => s.id === stage.id ? stage : s));
  };

  const handleDeleteStage = (stageId: string) => {
    deleteStageFromCloud(stageId).catch(console.error);
    setStages(prev => prev.filter(s => s.id !== stageId));
  };

  const handleAddSubject = (subject: Subject) => {
    saveSubjectToCloud(subject).catch(console.error);
    setSubjects(prev => [...prev.filter(s => s.id !== subject.id), subject]);
  };

  const handleUpdateSubject = (subject: Subject) => {
    saveSubjectToCloud(subject).catch(console.error);
    setSubjects(prev => prev.map(s => s.id === subject.id ? subject : s));
  };

  const handleDeleteSubject = (subjectId: string) => {
    deleteSubjectFromCloud(subjectId).catch(console.error);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  // Notifications
  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Encrypted Backup Restoral
  const handleRestoreBackup = (restoredData: Record<string, unknown>) => {
    if (restoredData.students) {
      const stds = restoredData.students as Student[];
      setStudents(stds);
      stds.forEach(s => saveStudentToCloud(s).catch(console.error));
    }
    if (restoredData.teachers) {
      const tchs = restoredData.teachers as Teacher[];
      setTeachers(tchs);
      tchs.forEach(t => saveTeacherToCloud(t).catch(console.error));
    }
    if (restoredData.stages) {
      const stgs = restoredData.stages as AcademicStage[];
      setStages(stgs);
      stgs.forEach(stg => saveStageToCloud(stg).catch(console.error));
    }
    if (restoredData.subjects) {
      const subs = restoredData.subjects as Subject[];
      setSubjects(subs);
      subs.forEach(sub => saveSubjectToCloud(sub).catch(console.error));
    }
    if (restoredData.transactions) {
      const txns = restoredData.transactions as FinancialTransaction[];
      setTransactions(txns);
      txns.forEach(txn => saveTransactionToCloud(txn).catch(console.error));
    }
    if (restoredData.attendanceRecords) {
      const atts = restoredData.attendanceRecords as AttendanceRecord[];
      setAttendanceRecords(atts);
      atts.forEach(att => saveAttendanceToCloud(att).catch(console.error));
    }
    if (restoredData.assessments) {
      const asms = restoredData.assessments as StudentAssessment[];
      setAssessments(asms);
      asms.forEach(asm => saveAssessmentToCloud(asm).catch(console.error));
    }
    if (restoredData.notifications) setNotifications(restoredData.notifications as SystemNotification[]);

    alert('تم استعادة واستيراد النسخة الاحتياطية بنجاح وفك التشفير ومزامنتها سحابياً!');
  };

  // User Management Handlers (Admin Only)
  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr_${Date.now()}`
    };
    saveUserToCloud(newUser).catch(console.error);
    setUsers(prev => [...prev, newUser]);

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'إنشاء حساب مستخدم جديد',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم إنشاء حساب جديد باسم (${newUser.name}) وصلاحية (${newUser.role})`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updatedData };
        saveUserToCloud(updated).catch(console.error);
        return updated;
      }
      return u;
    }));
    
    // If the updated user is the current active user, update currentUser too
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'تعديل حساب مستخدم',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم تحديث بيانات المستخدم أو كلمة المرور للمعرف (${userId})`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserFromCloud(userId).catch(console.error);
    setUsers(prev => prev.filter(u => u.id !== userId));

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      action: 'حذف حساب مستخدم',
      user: currentUser?.name || 'المدير العام',
      role: 'admin',
      details: `تم حذف الحساب بالمعرف (${userId}) نهائياً من المنظومة`,
      timestamp: new Date().toLocaleString('ar-EG'),
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Current active teacher for Teacher Portal
  const activeTeacher = teachers[0] || INITIAL_TEACHERS[0];

  // If user is not logged in, only show the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        settings={centerSettings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* App Header */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        settings={centerSettings}
        notifications={notifications}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenPaymentGateway={() => {
          setSelectedStudentForPayment(undefined);
          setShowPaymentModal(true);
        }}
        onOpenBackupSecurity={() => setShowBackupModal(true)}
        onOpenUsersManagement={() => setShowUsersModal(true)}
        onLogout={handleLogout}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenChat={() => setShowChatModal(true)}
        unreadMessagesCount={unreadMessagesCount}
        onOpenCalendarTasks={() => setShowCalendarTasksModal(true)}
        todayTasksCount={todayTasksCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Views based on Role and activeTab */}
        
        {/* DATA ENTRY ROLE VIEWS */}
        {currentRole === 'data_entry' && (
          <>
            {activeTab === 'students' && (
              <StudentsManagementView
                students={students}
                stages={stages}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onPayForStudent={handlePayForStudent}
                hideFinancials={true}
              />
            )}

            {activeTab === 'teachers' && (
              <TeachersManagementView
                teachers={teachers}
                subjects={subjects}
                stages={stages}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onRecordTeacherPayout={handleAddTransaction}
                hideFinancials={true}
              />
            )}

            {activeTab === 'groups' && (
              <GroupsManagementView
                groups={groups}
                students={students}
                teachers={teachers}
                subjects={subjects}
                stages={stages}
                onAddGroup={handleAddGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onEnrollStudentInGroup={handleEnrollStudentInGroup}
                onRemoveStudentFromGroup={handleRemoveStudentFromGroup}
                onAddNewStudentAndEnroll={handleAddNewStudentAndEnroll}
                hideFinancials={true}
              />
            )}

            {activeTab === 'stages' && (
              <StagesAndSubjectsView
                stages={stages}
                subjects={subjects}
                teachers={teachers}
                onAddStage={handleAddStage}
                onAddSubject={handleAddSubject}
                onUpdateStage={handleUpdateStage}
                onDeleteStage={handleDeleteStage}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                hideFinancials={true}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                stages={stages}
                subjects={subjects}
                attendanceRecords={attendanceRecords}
                onRecordAttendance={handleRecordAttendance}
                onSendParentAlert={handleSendParentAlert}
              />
            )}
          </>
        )}

        {/* TEACHER PORTAL */}
        {currentRole === 'teacher' && (
          <TeacherPortalView
            currentTeacher={activeTeacher}
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            assessments={assessments}
            onRecordAttendance={handleRecordAttendance}
            onAddAssessment={handleAddAssessment}
            onSendParentAlert={handleSendParentAlert}
          />
        )}

        {/* ADMIN ROLE VIEWS */}
        {currentRole === 'admin' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboardView
                students={students}
                teachers={teachers}
                stages={stages}
                transactions={transactions}
                attendanceRecords={attendanceRecords}
                assessments={assessments}
                notifications={notifications}
                onNavigate={(tab) => setActiveTab(tab)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenPaymentModal={() => {
                  setSelectedStudentForPayment(undefined);
                  setShowPaymentModal(true);
                }}
                onOpenPaymentGateway={() => {
                  setSelectedStudentForPayment(undefined);
                  setShowPaymentModal(true);
                }}
                onOpenBackupModal={() => setShowBackupModal(true)}
                onOpenBackupSecurity={() => setShowBackupModal(true)}
                onOpenUsersManagement={() => setShowUsersModal(true)}
              />
            )}

            {activeTab === 'students' && (
              <StudentsManagementView
                students={students}
                stages={stages}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onPayForStudent={handlePayForStudent}
              />
            )}

            {activeTab === 'teachers' && (
              <TeachersManagementView
                teachers={teachers}
                subjects={subjects}
                stages={stages}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onRecordTeacherPayout={handleAddTransaction}
              />
            )}

            {activeTab === 'groups' && (
              <GroupsManagementView
                groups={groups}
                students={students}
                teachers={teachers}
                subjects={subjects}
                stages={stages}
                onAddGroup={handleAddGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onEnrollStudentInGroup={handleEnrollStudentInGroup}
                onRemoveStudentFromGroup={handleRemoveStudentFromGroup}
                onAddNewStudentAndEnroll={handleAddNewStudentAndEnroll}
              />
            )}

            {activeTab === 'stages' && (
              <StagesAndSubjectsView
                stages={stages}
                subjects={subjects}
                teachers={teachers}
                onAddStage={handleAddStage}
                onAddSubject={handleAddSubject}
                onUpdateStage={handleUpdateStage}
                onDeleteStage={handleDeleteStage}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            )}

            {activeTab === 'finance' && (
              <FinancialView
                transactions={transactions}
                students={students}
                onAddTransaction={handleAddTransaction}
                onViewReceipt={(txn) => {
                  setSelectedTransactionForReceipt(txn);
                  setShowReceiptModal(true);
                }}
                onOpenPaymentGateway={() => {
                  setSelectedStudentForPayment(undefined);
                  setShowPaymentModal(true);
                }}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                stages={stages}
                subjects={subjects}
                attendanceRecords={attendanceRecords}
                onRecordAttendance={handleRecordAttendance}
                onSendParentAlert={handleSendParentAlert}
              />
            )}

            {activeTab === 'assessments' && (
              <AssessmentsView
                assessments={assessments}
                students={students}
                stages={stages}
                subjects={subjects}
                onAddAssessment={handleAddAssessment}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{centerSettings.centerName}</span>
            <span>•</span>
            <span>{centerSettings.address}</span>
            <span>•</span>
            <span className="font-mono">{centerSettings.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>نظام الإدارة الشامل معتمد ومشفّر</span>
            <span>•</span>
            <span>إصدار 2026 v2.5</span>
          </div>
        </div>
      </footer>

      {/* GLOBAL MODALS */}
      
      {/* 1. Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        currentRole={currentRole}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setShowNotificationsModal(false);
        }}
      />

      {/* 2. Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedStudentForPayment(undefined);
        }}
        students={students}
        settings={centerSettings}
        preselectedStudent={selectedStudentForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 3. Printable Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedTransactionForReceipt(null);
        }}
        transaction={selectedTransactionForReceipt}
        settings={centerSettings}
        student={students.find(s => s.id === selectedTransactionForReceipt?.studentId)}
      />

      {/* 4. Encrypted Backup & Security Modal */}
      {showBackupModal && (
        <BackupSecurityModal
          appState={{
            students,
            teachers,
            stages,
            subjects,
            transactions,
            attendanceRecords,
            assessments,
            notifications,
          }}
          settings={centerSettings}
          auditLogs={auditLogs}
          backupLogs={backupLogs}
          onUpdateSettings={(newSt) => {
            setCenterSettings(newSt);
            saveSettingsToCloud(newSt).catch(console.error);
          }}
          onRestoreState={handleRestoreBackup}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      {/* 5. Users Management Modal (Admin Only) */}
      {showUsersModal && (
        <UsersManagementModal
          isOpen={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          users={users}
          currentUser={currentUser}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* 6. Internal Team Chat Modal (Text, Images, Voice Recordings) */}
      {currentUser && (
        <InternalChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          currentUser={currentUser}
          users={users}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* 7. Synchronized Calendar & Tasks Reminder Modal */}
      {currentUser && (
        <CalendarTasksModal
          isOpen={showCalendarTasksModal}
          onClose={() => setShowCalendarTasksModal(false)}
          currentUser={currentUser}
          users={users}
          tasks={calendarTasks}
          onAddTask={handleAddCalendarTask}
          onUpdateTask={handleUpdateCalendarTask}
          onDeleteTask={handleDeleteCalendarTask}
          onTriggerNotification={handleTriggerCustomNotification}
        />
      )}

      {/* 8. Floating Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce-short flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md bg-white/95 text-slate-800 transition-all duration-300 max-w-md">
          <div className={`p-2 rounded-xl shrink-0 ${syncToast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {syncToast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-right">
            <h4 className="text-xs font-black text-slate-900">
              {syncToast.type === 'success' ? 'اكتمال المزامنة السحابية' : 'تنبيه المزامنة السحابية'}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{syncToast.message}</p>
          </div>
          <button
            onClick={() => setSyncToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer rounded-lg hover:bg-slate-100 transition"
            aria-label="إغلاق التنبيه"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
