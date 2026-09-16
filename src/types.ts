export type UserRole = 'admin' | 'data_entry' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar: string;
  assignedSubject?: string;
  assignedStages?: string[];
}

export interface AcademicStage {
  id: string;
  name: string;
  code: string;
  level: 'primary' | 'preparatory' | 'secondary';
  academicYear: string;
  groupsCount: number;
  studentsCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  stageId: string;
  stageName: string;
  teacherId: string;
  teacherName: string;
  monthlyFee: number;
  sessionsPerWeek: number;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId?: string;
  subjectId: string;
  subjectName: string;
  stages: string[];
  salaryType: 'fixed' | 'percentage' | 'per_student';
  rate: number;
  totalStudents: number;
  joinDate: string;
  active: boolean;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  nationalId?: string;
  stageId: string;
  stageName: string;
  groupName: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentJob?: string;
  address?: string;
  enrollmentDate: string;
  status: 'active' | 'suspended' | 'graduated';
  monthlyFee: number;
  balance: number; // positive = center owes him, negative = student owes center
  attendanceRate: number;
  averageScore: number;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  stageName: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  parentNotified: boolean;
  timestamp: string;
}

export interface StudentAssessment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  stageName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  examTitle: string;
  examType: 'monthly' | 'quiz' | 'midterm' | 'final' | 'homework';
  maxScore: number;
  score: number;
  percentage: number;
  examDate: string;
  feedback?: string;
  needsSupport: boolean;
}

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'fawry' | 'vodafone_cash' | 'visa_mastercard' | 'instapay';

export type FinancialCategory = 
  | 'tuition_fee'
  | 'books_materials'
  | 'exam_fee'
  | 'teacher_salary'
  | 'center_rent'
  | 'electricity_water'
  | 'stationery_printing'
  | 'maintenance'
  | 'marketing'
  | 'refreshments'
  | 'other';

export interface FinancialTransaction {
  id: string;
  invoiceNumber: string;
  type: TransactionType;
  category: FinancialCategory;
  categoryName: string;
  amount: number;
  studentId?: string;
  studentName?: string;
  teacherId?: string;
  teacherName?: string;
  date: string;
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  referenceNumber?: string;
  description: string;
  recordedBy: string;
  status: 'completed' | 'pending' | 'refunded';
}

export type NotificationType = 
  | 'absence_alert'
  | 'grade_warning'
  | 'financial_due'
  | 'backup_success'
  | 'security_event'
  | 'payment_received'
  | 'system_info';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRole: 'all' | 'admin' | 'data_entry' | 'teacher';
  timestamp: string;
  read: boolean;
  studentId?: string;
  linkTab?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  sizeKb: number;
  checksum: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed';
  encrypted: boolean;
  recordsCount: number;
}

export interface CenterSettings {
  centerName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  currency: string;
  autoBackupIntervalMinutes: number; // e.g. 60 min
  lastAutoBackupTime?: string;
  encryptionAlgorithm: string; // "AES-256-GCM / SHA-256"
  enableInstantParentSms: boolean;
  enableAbsenceWarningThreshold: number; // e.g. 2 absences
  fawryMerchantCode: string;
  vodafoneCashWallet: string;
  instapayHandle: string;
}
