import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  User,
  Student, 
  Teacher, 
  AcademicStage, 
  Subject, 
  FinancialTransaction, 
  AttendanceRecord, 
  StudentAssessment, 
  SystemNotification,
  AttendanceStatus,
  CenterSettings,
  AuditLog,
  BackupLog
} from './types';
import { 
  INITIAL_USERS,
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_STAGES, 
  INITIAL_SUBJECTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_ATTENDANCE, 
  INITIAL_ASSESSMENTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS
} from './data/initialData';
import { getBackupHistoryLogs } from './services/securityBackup';

// UI Components
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { NotificationsModal } from './components/NotificationsModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BackupSecurityModal } from './components/BackupSecurityModal';
import { UsersManagementModal } from './components/UsersManagementModal';

// Views
import { AdminDashboardView } from './views/AdminDashboardView';
import { StudentsManagementView } from './views/StudentsManagementView';
import { TeachersManagementView } from './views/TeachersManagementView';
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
    return saved ? JSON.parse(saved) : INITIAL_USERS;
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

  // Handle Login & Logout
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'data_entry') {
      setActiveTab('data_portal');
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
    return saved ? JSON.parse(saved) : INITIAL_STAGES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('educenter_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
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
          vodafoneCashWallet: '01007041700',
          fawryMerchantCode: '01007041700',
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(getBackupHistoryLogs);

  // Modals
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | undefined>(undefined);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState<FinancialTransaction | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Local storage persistence
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
    setStudents(prev => [newStudent, ...prev]);

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
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (studentId: string) => {
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
    setTransactions(prev => [newTxn, ...prev]);

    // If payment belongs to a student, clear or credit their balance
    if (newTxn.studentId) {
      setStudents(prev => prev.map(std => {
        if (std.id === newTxn.studentId) {
          return {
            ...std,
            balance: Math.min(0, std.balance + newTxn.amount), // settle balance
          };
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
    setTeachers(prev => [teacher, ...prev]);
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === teacher.id ? teacher : t));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  // Financial Handlers
  const handleAddTransaction = (txn: FinancialTransaction) => {
    setTransactions(prev => [txn, ...prev]);
  };

  // Attendance Handlers
  const handleRecordAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords(prev => [...records, ...prev]);

    // Update students attendance rates based on new records
    records.forEach(rec => {
      if (rec.status === 'absent') {
        setStudents(curr => curr.map(s => {
          if (s.id === rec.studentId) {
            const newRate = Math.max(40, s.attendanceRate - 5);
            return { ...s, attendanceRate: newRate };
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
    setAssessments(prev => [assessment, ...prev]);

    // Update student's averageScore
    setStudents(prev => prev.map(s => {
      if (s.id === assessment.studentId) {
        return {
          ...s,
          averageScore: Math.round(assessment.percentage),
        };
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

  // Notifications
  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Encrypted Backup Restoral
  const handleRestoreBackup = (restoredData: Record<string, unknown>) => {
    if (restoredData.students) setStudents(restoredData.students as Student[]);
    if (restoredData.teachers) setTeachers(restoredData.teachers as Teacher[]);
    if (restoredData.stages) setStages(restoredData.stages as AcademicStage[]);
    if (restoredData.subjects) setSubjects(restoredData.subjects as Subject[]);
    if (restoredData.transactions) setTransactions(restoredData.transactions as FinancialTransaction[]);
    if (restoredData.attendanceRecords) setAttendanceRecords(restoredData.attendanceRecords as AttendanceRecord[]);
    if (restoredData.assessments) setAssessments(restoredData.assessments as StudentAssessment[]);
    if (restoredData.notifications) setNotifications(restoredData.notifications as SystemNotification[]);

    alert('تم استعادة واستيراد النسخة الاحتياطية بنجاح وفك التشفير والتحقق من التوقيع الرقمي!');
  };

  // User Management Handlers (Admin Only)
  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr_${Date.now()}`
    };
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
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
    
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Views based on Role and activeTab */}
        
        {/* DATA ENTRY PORTAL */}
        {currentRole === 'data_entry' && (
          <DataEntryPortalView
            students={students}
            stages={stages}
            subjects={subjects}
            transactions={transactions}
            onAddStudent={handleAddStudent}
            onOpenPaymentGateway={() => {
              setSelectedStudentForPayment(undefined);
              setShowPaymentModal(true);
            }}
            onAddExpenseVoucher={handleAddTransaction}
            onViewReceipt={(txn) => {
              setSelectedTransactionForReceipt(txn);
              setShowReceiptModal(true);
            }}
          />
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
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onRecordTeacherPayout={handleAddTransaction}
              />
            )}

            {activeTab === 'stages' && (
              <StagesAndSubjectsView
                stages={stages}
                subjects={subjects}
                teachers={teachers}
                onAddStage={(stage) => setStages(prev => [...prev, stage])}
                onAddSubject={(subject) => setSubjects(prev => [...prev, subject])}
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
            <span className="font-bold text-slate-800">{INITIAL_SETTINGS.centerName}</span>
            <span>•</span>
            <span>{INITIAL_SETTINGS.address}</span>
            <span>•</span>
            <span className="font-mono">{INITIAL_SETTINGS.phone}</span>
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
          onUpdateSettings={(newSt) => setCenterSettings(newSt)}
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

    </div>
  );
}
