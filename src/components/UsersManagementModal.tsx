import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Lock,
  User as UserIcon,
  Mail,
  Search
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, updatedData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form State for Adding
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('data_entry');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State for Editing
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('data_entry');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showPasswordsInList, setShowPasswordsInList] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordsInList(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditEmail(user.email || '');
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setShowEditPassword(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setErrorMsg('');
  };

  const handleSaveEdit = (userId: string) => {
    if (!editName.trim() || !editUsername.trim() || !editPassword.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول الإلزامية (الاسم، اسم المستخدم، كلمة المرور).');
      return;
    }

    // Check username uniqueness
    const exists = users.some(u => u.id !== userId && (u.username.toLowerCase() === editUsername.toLowerCase() || (editEmail && u.email && u.email.toLowerCase() === editEmail.toLowerCase())));
    if (exists) {
      setErrorMsg('اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل بحساب آخر.');
      return;
    }

    onUpdateUser(userId, {
      name: editName.trim(),
      username: editUsername.trim(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      role: editRole
    });

    setEditingUserId(null);
    setSuccessMsg('تم تحديث بيانات المستخدم بنجاح.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setErrorMsg('يرجى إدخال الاسم، اسم المستخدم، وكلمة المرور.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 4 خانات.');
      return;
    }

    // Check duplicate
    const exists = users.some(u => 
      u.username.toLowerCase() === newUsername.toLowerCase() || 
      (newEmail && u.email && u.email.toLowerCase() === newEmail.toLowerCase())
    );

    if (exists) {
      setErrorMsg('اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً!');
      return;
    }

    onAddUser({
      name: newName.trim(),
      username: newUsername.trim(),
      email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@braingym.center`,
      password: newPassword.trim(),
      role: newRole
    });

    setSuccessMsg(`تم إنشاء حساب ${newName} بنجاح بصلاحية: ${getRoleBadgeText(newRole)}.`);
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('data_entry');
    setActiveTab('list');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      setErrorMsg('لا يمكن حذف حسابك الحالي الذي تستخدمه لتسجيل الدخول!');
      return;
    }

    if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب المستخدم: "${userName}" نهائياً من النظام؟`)) {
      onDeleteUser(userId);
      setSuccessMsg(`تم حذف حساب "${userName}" بنجاح.`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            مدير عام
          </span>
        );
      case 'data_entry':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserIcon className="w-3.5 h-3.5" />
            مدخل بيانات
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Users className="w-3.5 h-3.5" />
            معلم
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadgeText = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'مدير عام';
      case 'data_entry': return 'مدخل بيانات';
      case 'teacher': return 'معلم';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                إدارة المستخدمين وصلاحيات الدخول
                <span className="text-xs font-normal px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  خاص بالمدير العام فقط
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                إضافة مستخدمين جدد، وتعديل الأسماء، بيانات الدخول، وكلمات المرور للمنظومة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('list'); setEditingUserId(null); }}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>قائمة المستخدمين المسجلين ({users.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('create'); setEditingUserId(null); setErrorMsg(''); }}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === 'create'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم جديد</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="relative mb-2 w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم أو اسم المستخدم..."
                className="w-full pl-3 pr-9 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">لا يوجد مستخدمين مطابقين للبحث</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;
                    const isCurrentUser = user.id === currentUser.id;
                    const isPasswordVisible = showPasswordsInList[user.id];

                    if (isEditing) {
                      return (
                        <div key={user.id} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                              تعديل حساب المستخدم: {user.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(user.id)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                حفظ التعديلات
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">الاسم الكامل:</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">اسم المستخدم (للدخول):</label>
                              <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">نوع الصلاحية / الدور:</label>
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value as UserRole)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-semibold"
                              >
                                <option value="admin">مدير عام (Admin)</option>
                                <option value="data_entry">مسؤول إدخال بيانات (Data Entry)</option>
                                <option value="teacher">بوابة المعلم (Teacher)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">البريد الإلكتروني:</label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
                              <div className="relative">
                                <input
                                  type={showEditPassword ? "text" : "password"}
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 pl-9"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditPassword(!showEditPassword)}
                                  className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
                                >
                                  {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={user.id} 
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isCurrentUser 
                            ? 'bg-slate-50/80 border-indigo-300 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : user.role === 'teacher'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            {user.name.charAt(0)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                              {getRoleBadge(user.role)}
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                  أنت (حسابك الحالي)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1 font-mono">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                <strong className="text-slate-700 font-semibold">اسم المستخدم:</strong> {user.username}
                              </span>
                              {user.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  {user.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Password display & action buttons */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {/* Password viewer */}
                          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-mono font-bold text-slate-800">
                              {isPasswordVisible ? user.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                              title={isPasswordVisible ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                            >
                              {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(user)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
                              title="تعديل بيانات المستخدم أو كلمة المرور"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>

                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => handleDelete(user.id, user.name)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                                title="حذف هذا المستخدم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add New User Tab */
            <form onSubmit={handleCreateSubmit} className="max-w-2xl mx-auto space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  بيانات حساب المستخدم الجديد
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك إنشاء حساب جديد لأي فئة (مدير عام، مدخل بيانات، أو معلم) وتحديد كلمة المرور الخاصة به مباشرة.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم الكامل للمستخدم: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: أحمد مصطفى النبراوي"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    فئة وصلاحية الحساب: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="data_entry">مسؤول إدخال بيانات وشؤون طلاب (Data Entry)</option>
                    <option value="teacher">بوابة المعلم (Teacher)</option>
                    <option value="admin">مدير عام للنظام بكافة الصلاحيات (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المستخدم للدخول (Username): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.replace(/\s+/g, '_'))}
                    placeholder="مثال: ahmed_entry أو math_teacher2"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    البريد الإلكتروني (اختياري):
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ahmed@braingym.center"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    كلمة المرور المبدئية: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور قوية للحساب..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition cursor-pointer"
                >
                  إلغاء والعودة للقائمة
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد إنشاء المستخدم</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            يتم تخزين بيانات وتعديلات المستخدمين محلياً وبشكل مشفر في النظام
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
