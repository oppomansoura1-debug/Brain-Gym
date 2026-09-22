import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Teacher, 
  Student, 
  EducationalGroup, 
  AcademicStage, 
  Subject, 
  FinancialTransaction, 
  AttendanceRecord, 
  StudentAssessment,
  CenterSettings,
  User,
  ChatMessage,
  CalendarTask
} from '../types';

// Helper to remove undefined fields because Firestore rejects undefined
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  });
  return cleaned as T;
}

export async function testConnection(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    return true;
  } catch (err) {
    console.warn('Firebase connection check:', err);
    return false;
  }
}

// ==========================================
// 1. TEACHERS SYNC
// ==========================================
export function subscribeTeachers(
  onUpdate: (teachers: Teacher[]) => void, 
  initialFallback: Teacher[]
): () => void {
  const colRef = collection(db, 'teachers');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((t) => {
          const docRef = doc(db, 'teachers', t.id);
          batch.set(docRef, cleanForFirestore(t));
        });
        await batch.commit();
        return; // onSnapshot will fire again with committed data
      } catch (err) {
        console.error('Error seeding initial teachers to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: Teacher[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Teacher);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore teachers subscription error:', error);
  });

  return unsubscribe;
}

export async function saveTeacherToCloud(teacher: Teacher): Promise<void> {
  const docRef = doc(db, 'teachers', teacher.id);
  await setDoc(docRef, cleanForFirestore(teacher), { merge: true });
}

export async function deleteTeacherFromCloud(teacherId: string): Promise<void> {
  const docRef = doc(db, 'teachers', teacherId);
  await deleteDoc(docRef);
}

// ==========================================
// 2. STUDENTS SYNC
// ==========================================
export function subscribeStudents(
  onUpdate: (students: Student[]) => void, 
  initialFallback: Student[]
): () => void {
  const colRef = collection(db, 'students');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((s) => {
          const docRef = doc(db, 'students', s.id);
          batch.set(docRef, cleanForFirestore(s));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial students to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: Student[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Student);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore students subscription error:', error);
  });

  return unsubscribe;
}

export async function saveStudentToCloud(student: Student): Promise<void> {
  const docRef = doc(db, 'students', student.id);
  await setDoc(docRef, cleanForFirestore(student), { merge: true });
}

export async function deleteStudentFromCloud(studentId: string): Promise<void> {
  const docRef = doc(db, 'students', studentId);
  await deleteDoc(docRef);
}

// ==========================================
// 3. GROUPS SYNC
// ==========================================
export function subscribeGroups(
  onUpdate: (groups: EducationalGroup[]) => void, 
  initialFallback: EducationalGroup[]
): () => void {
  const colRef = collection(db, 'groups');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((g) => {
          const docRef = doc(db, 'groups', g.id);
          batch.set(docRef, cleanForFirestore(g));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial groups to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: EducationalGroup[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as EducationalGroup);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore groups subscription error:', error);
  });

  return unsubscribe;
}

export async function saveGroupToCloud(group: EducationalGroup): Promise<void> {
  const docRef = doc(db, 'groups', group.id);
  await setDoc(docRef, cleanForFirestore(group), { merge: true });
}

export async function deleteGroupFromCloud(groupId: string): Promise<void> {
  const docRef = doc(db, 'groups', groupId);
  await deleteDoc(docRef);
}

// ==========================================
// 4. ACADEMIC STAGES SYNC
// ==========================================
export function subscribeStages(
  onUpdate: (stages: AcademicStage[]) => void, 
  initialFallback: AcademicStage[]
): () => void {
  const colRef = collection(db, 'stages');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((stg) => {
          const docRef = doc(db, 'stages', stg.id);
          batch.set(docRef, cleanForFirestore(stg));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial stages to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: AcademicStage[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AcademicStage);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore stages subscription error:', error);
  });

  return unsubscribe;
}

export async function saveStageToCloud(stage: AcademicStage): Promise<void> {
  const docRef = doc(db, 'stages', stage.id);
  await setDoc(docRef, cleanForFirestore(stage), { merge: true });
}

export async function deleteStageFromCloud(stageId: string): Promise<void> {
  const docRef = doc(db, 'stages', stageId);
  await deleteDoc(docRef);
}

// ==========================================
// 5. SUBJECTS SYNC
// ==========================================
export function subscribeSubjects(
  onUpdate: (subjects: Subject[]) => void, 
  initialFallback: Subject[]
): () => void {
  const colRef = collection(db, 'subjects');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((sub) => {
          const docRef = doc(db, 'subjects', sub.id);
          batch.set(docRef, cleanForFirestore(sub));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial subjects to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: Subject[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Subject);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore subjects subscription error:', error);
  });

  return unsubscribe;
}

export async function saveSubjectToCloud(subject: Subject): Promise<void> {
  const docRef = doc(db, 'subjects', subject.id);
  await setDoc(docRef, cleanForFirestore(subject), { merge: true });
}

export async function deleteSubjectFromCloud(subjectId: string): Promise<void> {
  const docRef = doc(db, 'subjects', subjectId);
  await deleteDoc(docRef);
}

// ==========================================
// 6. TRANSACTIONS SYNC
// ==========================================
export function subscribeTransactions(
  onUpdate: (txns: FinancialTransaction[]) => void, 
  initialFallback: FinancialTransaction[]
): () => void {
  const colRef = collection(db, 'transactions');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((txn) => {
          const docRef = doc(db, 'transactions', txn.id);
          batch.set(docRef, cleanForFirestore(txn));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial transactions to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: FinancialTransaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FinancialTransaction);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore transactions subscription error:', error);
  });

  return unsubscribe;
}

export async function saveTransactionToCloud(txn: FinancialTransaction): Promise<void> {
  const docRef = doc(db, 'transactions', txn.id);
  await setDoc(docRef, cleanForFirestore(txn), { merge: true });
}

export async function deleteTransactionFromCloud(txnId: string): Promise<void> {
  const docRef = doc(db, 'transactions', txnId);
  await deleteDoc(docRef);
}

// ==========================================
// 7. ATTENDANCE & ASSESSMENTS SYNC
// ==========================================
export function subscribeAttendance(
  onUpdate: (records: AttendanceRecord[]) => void,
  initialFallback: AttendanceRecord[]
): () => void {
  const colRef = collection(db, 'attendance');
  let hasSeeded = false;

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((r) => {
          batch.set(doc(db, 'attendance', r.id), cleanForFirestore(r));
        });
        await batch.commit();
        return;
      } catch (e) {
        console.error('Error seeding attendance:', e);
      }
    }
    if (!snapshot.empty) {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as AttendanceRecord));
      onUpdate(items);
    }
  });
}

export async function saveAttendanceToCloud(record: AttendanceRecord): Promise<void> {
  await setDoc(doc(db, 'attendance', record.id), cleanForFirestore(record), { merge: true });
}

export function subscribeAssessments(
  onUpdate: (items: StudentAssessment[]) => void,
  initialFallback: StudentAssessment[]
): () => void {
  const colRef = collection(db, 'assessments');
  let hasSeeded = false;

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((a) => {
          batch.set(doc(db, 'assessments', a.id), cleanForFirestore(a));
        });
        await batch.commit();
        return;
      } catch (e) {
        console.error('Error seeding assessments:', e);
      }
    }
    if (!snapshot.empty) {
      const items: StudentAssessment[] = [];
      snapshot.forEach((d) => items.push(d.data() as StudentAssessment));
      onUpdate(items);
    }
  });
}

export async function saveAssessmentToCloud(item: StudentAssessment): Promise<void> {
  await setDoc(doc(db, 'assessments', item.id), cleanForFirestore(item), { merge: true });
}

// ==========================================
// 8. CENTER SETTINGS & USERS
// ==========================================
export function subscribeSettings(
  onUpdate: (settings: CenterSettings) => void,
  initialFallback: CenterSettings
): () => void {
  const docRef = doc(db, 'centerSettings', 'main');

  return onSnapshot(docRef, async (snap) => {
    if (!snap.exists()) {
      try {
        await setDoc(docRef, cleanForFirestore(initialFallback));
      } catch (e) {
        console.error('Error seeding settings:', e);
      }
    } else {
      const cloudData = snap.data() as CenterSettings;
      // If cloud data still has the old address or old phone, synchronize with the new official data
      if (
        cloudData.address !== initialFallback.address ||
        cloudData.phone !== initialFallback.phone
      ) {
        const updated = {
          ...cloudData,
          address: initialFallback.address,
          phone: initialFallback.phone,
          fawryMerchantCode: initialFallback.fawryMerchantCode,
          vodafoneCashWallet: initialFallback.vodafoneCashWallet
        };
        setDoc(docRef, cleanForFirestore(updated), { merge: true }).catch(console.error);
        onUpdate(updated);
        return;
      }
      onUpdate(cloudData);
    }
  });
}

export async function saveSettingsToCloud(settings: CenterSettings): Promise<void> {
  await setDoc(doc(db, 'centerSettings', 'main'), cleanForFirestore(settings), { merge: true });
}

export function subscribeUsers(
  onUpdate: (users: User[]) => void,
  initialFallback: User[]
): () => void {
  const colRef = collection(db, 'users');
  let hasSeeded = false;

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((u) => {
          batch.set(doc(db, 'users', u.id), cleanForFirestore(u));
        });
        await batch.commit();
        return;
      } catch (e) {
        console.error('Error seeding users:', e);
      }
    }
    if (!snapshot.empty) {
      const items: User[] = [];
      snapshot.forEach((d) => items.push(d.data() as User));

      // Ensure any initial user (such as Hanan) is persisted in Firestore if missing
      const missingInitial = initialFallback.filter(
        (fu) => !items.some((iu) => iu.id === fu.id || iu.username.toLowerCase() === fu.username.toLowerCase())
      );
      if (missingInitial.length > 0) {
        try {
          const batch = writeBatch(db);
          missingInitial.forEach((mu) => {
            batch.set(doc(db, 'users', mu.id), cleanForFirestore(mu));
            items.push(mu);
          });
          batch.commit().catch(console.error);
        } catch (err) {
          console.error('Error auto-syncing new admin users:', err);
        }
      }

      onUpdate(items);
    }
  });
}

export async function saveUserToCloud(user: User): Promise<void> {
  await setDoc(doc(db, 'users', user.id), cleanForFirestore(user), { merge: true });
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId));
}

// ==========================================
// 10. MANUAL FULL CLOUD SYNC & RECOVERY
// ==========================================
export interface ManualSyncPayload {
  students: Student[];
  teachers: Teacher[];
  groups: EducationalGroup[];
  stages: AcademicStage[];
  subjects: Subject[];
  transactions: FinancialTransaction[];
  attendanceRecords: AttendanceRecord[];
  assessments: StudentAssessment[];
  centerSettings: CenterSettings;
  users: User[];
  messages?: ChatMessage[];
  calendarTasks?: CalendarTask[];
}

export interface ManualSyncResult {
  success: boolean;
  message: string;
  totalSynced: number;
  timestamp: string;
}

export async function forceManualFullSync(payload: ManualSyncPayload): Promise<ManualSyncResult> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    // Center settings
    batch.set(doc(db, 'centerSettings', 'main'), cleanForFirestore(payload.centerSettings), { merge: true });
    count++;

    // Teachers
    payload.teachers.forEach((t) => {
      batch.set(doc(db, 'teachers', t.id), cleanForFirestore(t), { merge: true });
      count++;
    });

    // Students
    payload.students.forEach((s) => {
      batch.set(doc(db, 'students', s.id), cleanForFirestore(s), { merge: true });
      count++;
    });

    // Groups
    payload.groups.forEach((g) => {
      batch.set(doc(db, 'groups', g.id), cleanForFirestore(g), { merge: true });
      count++;
    });

    // Stages
    payload.stages.forEach((st) => {
      batch.set(doc(db, 'stages', st.id), cleanForFirestore(st), { merge: true });
      count++;
    });

    // Subjects
    payload.subjects.forEach((sub) => {
      batch.set(doc(db, 'subjects', sub.id), cleanForFirestore(sub), { merge: true });
      count++;
    });

    // Transactions (keep up to 100 in initial batch to be safe on Firestore batch limits)
    payload.transactions.slice(0, 100).forEach((tx) => {
      batch.set(doc(db, 'transactions', tx.id), cleanForFirestore(tx), { merge: true });
      count++;
    });

    // Attendance records
    payload.attendanceRecords.slice(0, 100).forEach((att) => {
      batch.set(doc(db, 'attendance', att.id), cleanForFirestore(att), { merge: true });
      count++;
    });

    // Assessments
    payload.assessments.slice(0, 100).forEach((asm) => {
      batch.set(doc(db, 'assessments', asm.id), cleanForFirestore(asm), { merge: true });
      count++;
    });

    // Users
    payload.users.forEach((u) => {
      batch.set(doc(db, 'users', u.id), cleanForFirestore(u), { merge: true });
      count++;
    });

    // Internal Messages (recent up to 50)
    if (payload.messages) {
      payload.messages.slice(-50).forEach((m) => {
        batch.set(doc(db, 'internal_messages', m.id), cleanForFirestore(m), { merge: true });
        count++;
      });
    }

    // Calendar Tasks
    if (payload.calendarTasks) {
      payload.calendarTasks.forEach((t) => {
        batch.set(doc(db, 'calendar_tasks', t.id), cleanForFirestore(t), { merge: true });
        count++;
      });
    }

    await batch.commit();

    const timeStr = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      success: true,
      message: `تمت المزامنة السحابية وتأكيد حفظ ${count} سجلاً بنجاح!`,
      totalSynced: count,
      timestamp: timeStr
    };
  } catch (err: any) {
    console.error('Manual full sync failed:', err);
    throw new Error(err?.message || 'تعذر استكمال المزامنة السحابية');
  }
}

// ==========================================
// 12. INTERNAL MESSAGES SYNC
// ==========================================
export function subscribeMessages(
  onUpdate: (messages: ChatMessage[]) => void,
  initialFallback: ChatMessage[]
): () => void {
  const colRef = collection(db, 'internal_messages');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((m) => {
          const docRef = doc(db, 'internal_messages', m.id);
          batch.set(docRef, cleanForFirestore(m));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial messages to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ChatMessage);
      });
      // Sort chronologically
      items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore messages subscription error:', error);
  });

  return unsubscribe;
}

export async function saveMessageToCloud(message: ChatMessage): Promise<void> {
  const docRef = doc(db, 'internal_messages', message.id);
  await setDoc(docRef, cleanForFirestore(message), { merge: true });
}

// ==========================================
// 13. CALENDAR TASKS SYNC
// ==========================================
export function subscribeCalendarTasks(
  onUpdate: (tasks: CalendarTask[]) => void,
  initialFallback: CalendarTask[]
): () => void {
  const colRef = collection(db, 'calendar_tasks');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded && initialFallback.length > 0) {
      hasSeeded = true;
      try {
        const batch = writeBatch(db);
        initialFallback.forEach((t) => {
          const docRef = doc(db, 'calendar_tasks', t.id);
          batch.set(docRef, cleanForFirestore(t));
        });
        await batch.commit();
        return;
      } catch (err) {
        console.error('Error seeding initial calendar tasks to Firestore:', err);
      }
    }

    if (!snapshot.empty) {
      const items: CalendarTask[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CalendarTask);
      });
      // Sort by date and time
      items.sort((a, b) => {
        const dtA = `${a.date}T${a.time || '00:00'}`;
        const dtB = `${b.date}T${b.time || '00:00'}`;
        return new Date(dtA).getTime() - new Date(dtB).getTime();
      });
      onUpdate(items);
    }
  }, (error) => {
    console.error('Firestore calendar tasks subscription error:', error);
  });

  return unsubscribe;
}

export async function saveCalendarTaskToCloud(task: CalendarTask): Promise<void> {
  const docRef = doc(db, 'calendar_tasks', task.id);
  await setDoc(docRef, cleanForFirestore(task), { merge: true });
}

export async function deleteCalendarTaskFromCloud(taskId: string): Promise<void> {
  const docRef = doc(db, 'calendar_tasks', taskId);
  await deleteDoc(docRef);
}



