import * as XLSX from 'xlsx';
import { FinancialTransaction, Student, AttendanceRecord, StudentAssessment } from '../types';

export function exportFinancialReportToExcel(
  transactions: FinancialTransaction[] = [], 
  centerName = 'سنتر الأوائل التعليمي'
) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalIncome = safeTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = safeTransactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Prepare Transactions Table
  const transactionRows = safeTransactions.map((t, idx) => ({
    'م': idx + 1,
    'رقم الإيصال / الفاتورة': t.invoiceNumber,
    'التاريخ': t.date,
    'نوع المعاملة': t.type === 'income' ? 'إيراد / تحصيل' : 'مصروف / نفقات',
    'البند / التصنيف': t.categoryName,
    'البيان والتفاصيل': t.description,
    'المبلغ (جنيه مصري)': t.amount,
    'طريقة الدفع': t.paymentMethodName,
    'الطرف المعني': t.studentName || t.teacherName || 'المركز',
    'رقم المعاملة البنكية': t.referenceNumber || '-',
    'المسؤول': t.recordedBy,
    'حالة الدفع': t.status === 'completed' ? 'مكتمل' : t.status === 'pending' ? 'معلق' : 'مسترد'
  }));

  // Prepare Financial Summary Sheet
  const summaryRows = [
    { 'البيان الإحصائي': 'المركز التعليمي', 'القيمة': centerName },
    { 'البيان الإحصائي': 'تاريخ استخراج التقرير', 'القيمة': new Date().toLocaleDateString('ar-EG') },
    { 'البيان الإحصائي': 'إجمالي الإيرادات والمتحصلات', 'القيمة': `${totalIncome.toLocaleString()} ج.م` },
    { 'البيان الإحصائي': 'إجمالي المصروفات والتشغيل', 'القيمة': `${totalExpense.toLocaleString()} ج.م` },
    { 'البيان الإحصائي': 'صافي الأرباح التشغيلية', 'القيمة': `${netProfit.toLocaleString()} ج.م` },
    { 'البيان الإحصائي': 'إجمالي عدد المعاملات المسجلة', 'القيمة': transactions.length },
    { 'البيان الإحصائي': 'نسبة الربحية التشغيلية', 'القيمة': totalIncome > 0 ? `${((netProfit / totalIncome) * 100).toFixed(1)}%` : '0%' }
  ];

  // Prepare Gateway Breakdown
  const gateways = ['fawry', 'vodafone_cash', 'visa_mastercard', 'instapay', 'cash'] as const;
  const gatewayNames: Record<string, string> = {
    cash: 'خزينة المركز (كاش)',
    fawry: 'فوري (Fawry Pay)',
    vodafone_cash: 'محافظ إلكترونية (فودافون كاش)',
    visa_mastercard: 'فيزا وماستركارد (Cards)',
    instapay: 'إنستاباي (InstaPay)'
  };

  const gatewayRows = gateways.map(gw => {
    const sum = safeTransactions
      .filter(t => t.paymentMethod === gw && t.status === 'completed')
      .reduce((acc, curr) => acc + (curr.type === 'income' ? curr.amount : -curr.amount), 0);
    return {
      'بوابة الدفع': gatewayNames[gw],
      'إجمالي الحركة الصافية': `${sum.toLocaleString()} ج.م`
    };
  });

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  // Add Transactions Sheet
  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  // Auto-fit column widths approximately
  wsTransactions['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
    { wch: 35 }, { wch: 15 }, { wch: 20 }, { wch: 22 }, { wch: 18 },
    { wch: 20 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsTransactions, 'سجل المعاملات المالية');

  // Add Summary Sheet
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'المؤشرات والملخص المالي');

  // Add Gateway Sheet
  const wsGateway = XLSX.utils.json_to_sheet(gatewayRows);
  wsGateway['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, wsGateway, 'بوابات الدفع');

  // Generate binary and trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `التقرير_المالي_${centerName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
}

export function exportStudentsToExcel(students: Student[] = [], centerName = 'سنتر الأوائل') {
  const safeStudents = Array.isArray(students) ? students : [];
  const rows = safeStudents.map((s, idx) => ({
    'م': idx + 1,
    'كود الطالب': s.code,
    'اسم الطالب': s.name,
    'المرحلة الدراسية': s.stageName,
    'المجموعة': s.groupName,
    'هاتف الطالب': s.phone,
    'ولي الأمر': s.parentName,
    'هاتف ولي الأمر': s.parentPhone,
    'الاشتراك الشهري': s.monthlyFee,
    'الرصيد المالي': s.balance === 0 ? 'مسدد بالكامل' : `${s.balance} ج.م`,
    'نسبة الحضور': `${s.attendanceRate}%`,
    'متوسط الدرجات': `${s.averageScore}%`,
    'الحالة': s.status === 'active' ? 'نشط ومستمر' : s.status === 'suspended' ? 'معلق' : 'متخرج',
    'ملاحظات': s.notes || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 24 }, { wch: 25 }, { wch: 18 },
    { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة الطلاب');
  XLSX.writeFile(wb, `سجل_الطلاب_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportAttendanceToExcel(records: AttendanceRecord[] = []) {
  const safeRecords = Array.isArray(records) ? records : [];
  const statusLabels: Record<string, string> = {
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'معذور / إذن مسبق'
  };

  const rows = safeRecords.map((r, idx) => ({
    'م': idx + 1,
    'التاريخ': r.date,
    'كود الطالب': r.studentCode,
    'اسم الطالب': r.studentName,
    'المرحلة': r.stageName,
    'المجموعة': r.groupName,
    'المادة الدراسية': r.subjectName,
    'حالة الحضور': statusLabels[r.status] || r.status,
    'إشعار ولي الأمر': r.parentNotified ? 'تم الإرسال (WhatsApp/SMS)' : 'لم يرسل',
    'الملاحظات': r.notes || '-',
    'وقت التسجيل': r.timestamp
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'كشف الحضور والغياب');
  XLSX.writeFile(wb, `سجل_الحضور_والغياب_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportAssessmentsToExcel(assessments: StudentAssessment[] = []) {
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const rows = safeAssessments.map((a, idx) => ({
    'م': idx + 1,
    'كود الطالب': a.studentCode,
    'اسم الطالب': a.studentName,
    'المرحلة': a.stageName,
    'المادة': a.subjectName,
    'عنوان الاختبار / التقييم': a.examTitle,
    'الدرجة المحققة': a.score,
    'الدرجة العظمى': a.maxScore,
    'النسبة المئوية': `${a.percentage.toFixed(1)}%`,
    'مستوى الطالب': a.percentage >= 85 ? 'ممتاز' : a.percentage >= 75 ? 'جيد جداً' : a.percentage >= 60 ? 'جيد' : 'بحاجة لدعم عاجل',
    'يحتاج متابعة خاصة': a.needsSupport ? 'نعم (تنبيه مفعل)' : 'لا',
    'ملاحظات وتوجيهات المعلم': a.feedback || '-',
    'تاريخ التقييم': a.examDate
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقييمات ودرجات الطلاب');
  XLSX.writeFile(wb, `تقارير_الأداء_والدرجات_${new Date().toISOString().split('T')[0]}.xlsx`);
}
