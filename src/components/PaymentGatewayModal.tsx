import React, { useState } from 'react';
import { Student, PaymentMethod, FinancialTransaction, CenterSettings } from '../types';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen?: boolean;
  students?: Student[];
  selectedStudentId?: string;
  preselectedStudent?: Student;
  settings?: CenterSettings;
  onPaymentSuccess: (transaction: FinancialTransaction, updatedStudent?: Student) => void;
  onClose: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  students = [],
  selectedStudentId,
  preselectedStudent,
  settings,
  onPaymentSuccess,
  onClose,
}) => {
  if (isOpen === false) return null;

  const safeStudents = Array.isArray(students) ? students : [];

  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(
    preselectedStudent || safeStudents.find(s => s.id === selectedStudentId) || safeStudents[0]
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fawry');
  const [amount, setAmount] = useState<number>(selectedStudent ? Math.abs(selectedStudent.balance) || selectedStudent.monthlyFee : 500);
  const [description, setDescription] = useState<string>('سداد اشتراك شهري لمقررات المركز');
  const [senderPhone, setSenderPhone] = useState<string>(selectedStudent?.parentPhone || '01011223344');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState<string>('4152 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState<string>('KEMAL ELDESOUKY');
  const [expiry, setExpiry] = useState<string>('08/28');
  const [cvv, setCvv] = useState<string>('312');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedFawry, setCopiedFawry] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [fawryCode] = useState<string>(() => String(Math.floor(10000000 + Math.random() * 90000000)));

  const handleStudentChange = (id: string) => {
    const s = students.find(item => item.id === id);
    setSelectedStudent(s);
    if (s) {
      setAmount(Math.abs(s.balance) || s.monthlyFee);
      setSenderPhone(s.parentPhone || s.phone);
    }
  };

  const copyToClipboard = (text: string, type: 'fawry' | 'wallet') => {
    navigator.clipboard.writeText(text);
    if (type === 'fawry') {
      setCopiedFawry(true);
      setTimeout(() => setCopiedFawry(false), 2000);
    } else {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const handleProcessPayment = () => {
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const gatewayNames: Record<PaymentMethod, string> = {
        cash: 'خزينة المركز (نقدي)',
        fawry: 'خدمة فوري (Fawry Pay)',
        vodafone_cash: 'محفظة فودافون كاش الذكية',
        visa_mastercard: 'بطاقة ائتمانية (Visa/MasterCard)',
        instapay: 'شبكة المدفوعات اللحظية (InstaPay)',
      };

      const refNumber = paymentMethod === 'fawry'
        ? `FWRY-${fawryCode}`
        : paymentMethod === 'vodafone_cash'
        ? `VOD-${Math.floor(100000 + Math.random() * 900000)}`
        : paymentMethod === 'visa_mastercard'
        ? `PAY-VIS-${Math.floor(100000 + Math.random() * 900000)}`
        : paymentMethod === 'instapay'
        ? `INSTA-${Math.floor(100000 + Math.random() * 900000)}`
        : `CSH-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTxn: FinancialTransaction = {
        id: `txn_${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'income',
        category: 'tuition_fee',
        categoryName: 'مصروفات اشتراك شهري',
        amount: Number(amount),
        studentId: selectedStudent?.id,
        studentName: selectedStudent?.name,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        paymentMethodName: gatewayNames[paymentMethod],
        referenceNumber: refNumber,
        description: `${description} - ${selectedStudent?.name || ''}`,
        recordedBy: 'بوابة الدفع الإلكتروني المعتمدة',
        status: 'completed',
      };

      let updatedStudent: Student | undefined = undefined;
      if (selectedStudent) {
        updatedStudent = {
          ...selectedStudent,
          balance: (selectedStudent.balance || 0) + Number(amount),
        };
      }

      onPaymentSuccess(newTxn, updatedStudent);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-l from-indigo-700 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">بوابة الدفع والتحصيل الإلكتروني</h2>
              <p className="text-xs text-indigo-200">سداد آمن ومشفر للمصروفات والاشتراكات الدراسية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Student Selection & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                اختر الطالب المعني:
              </label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.code}) - {std.stageName}
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1 px-1">
                  <span>المجموعة: {selectedStudent.groupName}</span>
                  <span className={selectedStudent.balance < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    الرصيد: {selectedStudent.balance} ج.م
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                المبلغ المراد تحصيله (جنيه مصري):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">ج.م</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">المصروف الشهري المقرر: {selectedStudent?.monthlyFee || 0} ج.م</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              اختر وسيلة الدفع الإلكتروني:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Fawry */}
              <button
                type="button"
                onClick={() => setPaymentMethod('fawry')}
                className={`p-3 rounded-xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'fawry' 
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-black text-amber-600 text-sm tracking-wide">FAWRY</span>
                  {paymentMethod === 'fawry' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <span className="text-xs font-bold text-slate-800">خدمة فوري</span>
                <span className="text-[10px] text-slate-500">كود دفع فوري</span>
              </button>

              {/* Vodafone Cash / Wallets */}
              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone_cash')}
                className={`p-3 rounded-xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'vodafone_cash' 
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  {paymentMethod === 'vodafone_cash' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </div>
                <span className="text-xs font-bold text-slate-800">فودافون كاش</span>
                <span className="text-[10px] text-slate-500">المحافظ الذكية</span>
              </button>

              {/* Credit / Debit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('visa_mastercard')}
                className={`p-3 rounded-xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'visa_mastercard' 
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  {paymentMethod === 'visa_mastercard' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <span className="text-xs font-bold text-slate-800">فيزا / ماستركارد</span>
                <span className="text-[10px] text-slate-500">دفع بنكي مباشر</span>
              </button>

              {/* Cash at Center */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'cash' 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  {paymentMethod === 'cash' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-xs font-bold text-slate-800">خزينة المركز</span>
                <span className="text-[10px] text-slate-500">نقداً بالاستقبال</span>
              </button>

            </div>
          </div>

          {/* Dynamic Gateway Details Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            {paymentMethod === 'fawry' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-[11px] text-amber-900 block font-medium">رقم محفظة / كود فوري المعتمد:</span>
                      <span className="text-lg font-mono font-black text-amber-700 tracking-wider">
                        {settings?.fawryMerchantCode || '01007041700'}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(settings?.fawryMerchantCode || '01007041700', 'fawry')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرقم</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">كود سداد الفاتورة المباشر:</span>
                      <span className="text-lg font-mono font-black text-slate-800 tracking-wider">
                        {fawryCode}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(fawryCode, 'fawry')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedFawry ? 'تم النسخ!' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">طريقة السداد عبر فوري:</p>
                  <p>1. توجه لأي منفذ فوري أو استخدم تطبيق MyFawry / محفظة فوري الذكية.</p>
                  <p>2. رقم محفظة فوري المعتمدة للمركز: <strong className="text-amber-700 font-mono text-sm px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">{settings?.fawryMerchantCode || '01007041700'}</strong></p>
                  <p>3. أو اختر خدمة فوري باي وأدخل كود السداد <strong className="text-amber-700 font-mono">{fawryCode}</strong> وسيظهر المبلغ المطلوب ({amount} ج.م).</p>
                  <p className="text-[11px] text-slate-400">صلاحية كود السداد 72 ساعة من وقت الإنشاء.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'vodafone_cash' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">رقم محفظة فودافون كاش المعتمدة:</span>
                    <span className="text-xl font-mono font-bold text-rose-600 tracking-wider">
                      {settings?.vodafoneCashWallet || '01007041700'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(settings?.vodafoneCashWallet || '01007041700', 'wallet')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedWallet ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم المحفظة التي تم التحويل منها للتأكيد:
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="مثال: 01011223344"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'visa_mastercard' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم البطاقة الائتمانية:
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      تاريخ الانتهاء:
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      رمز الأمان (CVV):
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      اسم حامل البطاقة:
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>معاملة مشفرة عبر معيار 3D-Secure المصرفي المعتمد</span>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="text-xs text-slate-600 flex items-start gap-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">سداد نقدي في الخزينة</p>
                  <p>سيتم توريد المبلغ لخزينة المركز الرئيسية وطباعة إيصال استلام رسمي معتمد للطالب فوراً.</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات أو بيان السداد:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>تأمين فوري للبيانات</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPayment}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارِ المعالجة الآمنة...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التحصيل وإصدار الإيصال ({amount.toLocaleString()} ج.م)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
