import React from 'react';
import { FinancialTransaction, Student, CenterSettings } from '../types';
import { Printer, X, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';
import { BrainGymLogo } from './BrainGymLogo';

interface ReceiptModalProps {
  isOpen?: boolean;
  transaction?: FinancialTransaction | null;
  student?: Student;
  settings?: CenterSettings;
  centerInfo?: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transaction,
  student,
  settings,
  centerInfo,
  onClose,
}) => {
  if (isOpen === false || !transaction) return null;

  const activeSettings = settings || centerInfo || {
    centerName: 'BrainGYM التعليمي',
    phone: '01002003004',
    address: 'شارع المشاية السفلية أمام نادي الحوار، المنصورة، مصر'
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to Arabic words roughly for the receipt
  const formatArabicCurrency = (amount: number) => {
    return `${(amount || 0).toLocaleString()} جنيهاً مصرياً فقط لا غير`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>معاينة إيصال وسند القبض الرسمي</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصال</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt Document */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <BrainGymLogo size="md" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{activeSettings.centerName}</h2>
                <p className="text-xs text-slate-600 mt-1">{activeSettings.address}</p>
                <p className="text-xs text-slate-600">هاتف الإدارة: {activeSettings.phone}</p>
                {activeSettings.taxNumber && (
                  <p className="text-[11px] text-slate-500 mt-0.5">س.ت / رقم ضريبي: {activeSettings.taxNumber}</p>
                )}
              </div>
            </div>

            <div className="text-left">
              <div className="inline-block border-2 border-slate-900 px-3 py-1 text-xs font-bold uppercase rounded bg-slate-50">
                {transaction.type === 'income' ? 'إيصال استلام نقدية / سند قبض' : 'سند صرف مصروفات'}
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 mt-2">رقم: {transaction.invoiceNumber}</p>
              <p className="text-xs text-slate-600">التاريخ: {transaction.date}</p>
            </div>
          </div>

          {/* Body Info */}
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-700 block">وصلنا من الطالب / الجهة:</span>
                <span className="font-bold text-slate-900 text-base">
                  {transaction.studentName || student?.name || transaction.teacherName || 'الخزينة المركزية'}
                </span>
                {student && (
                  <span className="text-xs text-slate-500 block mt-0.5">
                    كود: {student.code} | {student.stageName}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-700 block">المبلغ المدفوع:</span>
                <span className="font-extrabold text-emerald-700 text-lg">
                  {transaction.amount.toLocaleString()} ج.م
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  ({formatArabicCurrency(transaction.amount)})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 rounded-lg p-3">
              <div>
                <span className="text-slate-500">بند التحصيل:</span>{' '}
                <span className="font-semibold text-slate-800">{transaction.categoryName}</span>
              </div>
              <div>
                <span className="text-slate-500">وسيلة الدفع:</span>{' '}
                <span className="font-semibold text-slate-800">{transaction.paymentMethodName}</span>
              </div>
              {transaction.referenceNumber && (
                <div className="col-span-2">
                  <span className="text-slate-500">رقم مرجع العملية الإلكترونية:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800">{transaction.referenceNumber}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-slate-500">البيان:</span>{' '}
                <span className="text-slate-800">{transaction.description}</span>
              </div>
            </div>

            {/* Electronic QR & Verification */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded flex items-center justify-center p-1">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-medium text-slate-700">إيصال معتمد إلكترونياً</p>
                  <p className="flex items-center gap-1 text-emerald-700 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> مشفر بنظام AES-256
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">ID: {transaction.id}</p>
                </div>
              </div>

              <div className="text-center text-xs">
                <p className="text-slate-500 mb-6">توقيع المستلم والختم</p>
                <p className="font-semibold text-slate-800">{transaction.recordedBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>

      </div>
    </div>
  );
};
