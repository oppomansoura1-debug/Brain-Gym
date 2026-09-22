import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  X, 
  CheckCheck, 
  Users, 
  Trash2, 
  AlertCircle,
  Paperclip,
  Check
} from 'lucide-react';
import { User, ChatMessage } from '../types';

interface InternalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

export const InternalChatModal: React.FC<InternalChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  messages,
  onSendMessage,
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('all');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Playback State for messages
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRecipientId, isOpen]);

  if (!isOpen) return null;

  // Filter messages for the current conversation
  const filteredMessages = messages.filter((msg) => {
    if (selectedRecipientId === 'all') {
      return msg.recipientId === 'all';
    }
    // Direct message between currentUser and selected user
    return (
      (msg.senderId === currentUser.id && msg.recipientId === selectedRecipientId) ||
      (msg.senderId === selectedRecipientId && (msg.recipientId === currentUser.id || msg.recipientId === 'all'))
    );
  });

  // Calculate unread count per user/channel
  const getUnreadCount = (recipientId: string) => {
    return messages.filter((m) => {
      const isUnread = !m.readBy?.includes(currentUser.id) && m.senderId !== currentUser.id;
      if (recipientId === 'all') {
        return isUnread && m.recipientId === 'all';
      }
      return isUnread && m.senderId === recipientId && m.recipientId === currentUser.id;
    }).length;
  };

  // Image Upload Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('تسجيل الصوت غير مدعوم في متصفحك الحالي.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      // Fallback: simulate audio recording for test/demo environments if mic is blocked
      const confirmDemo = window.confirm(
        'تعذر الوصول للمايكروفون (قد يكون محظوراً في إعدادات المتصفح). هل تريد إرفاق تسجيل صوتي تجريبي للتأكد من عمل الميزة؟'
      );
      if (confirmDemo) {
        // Create synthetic audio or simulated voice note
        setRecordedAudioUrl('https://actions.google.com/sounds/v1/communication/phone_calling.ogg');
        setRecordingSeconds(5);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  // Convert Blob to Data URL
  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Send Message Handler
  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage && !recordedAudioUrl && !recordedAudioBlob) {
      return;
    }

    let audioDataUrl: string | undefined = undefined;
    if (recordedAudioBlob) {
      try {
        audioDataUrl = await blobToDataURL(recordedAudioBlob);
      } catch (err) {
        console.error('Error reading audio blob:', err);
      }
    } else if (recordedAudioUrl && recordedAudioUrl.startsWith('http')) {
      audioDataUrl = recordedAudioUrl;
    }

    const targetUser = users.find((u) => u.id === selectedRecipientId);

    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId: selectedRecipientId,
      recipientName: selectedRecipientId === 'all' ? 'فريق العمل بالكامل' : targetUser?.name || 'مستخدم',
      text: inputText.trim() || undefined,
      imageUrl: selectedImage || undefined,
      audioUrl: audioDataUrl,
      audioDurationSeconds: recordingSeconds > 0 ? recordingSeconds : undefined,
      readBy: [currentUser.id]
    });

    // Reset input states
    setInputText('');
    setSelectedImage(null);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  // Toggle Audio Playback
  const togglePlayAudio = (msgId: string, url: string) => {
    let audio = audioElementsRef.current.get(msgId);
    if (!audio) {
      audio = new Audio(url);
      audioElementsRef.current.set(msgId, audio);
      audio.onended = () => setCurrentlyPlayingAudioId(null);
      audio.onerror = () => setCurrentlyPlayingAudioId(null);
    }

    if (currentlyPlayingAudioId === msgId) {
      audio.pause();
      setCurrentlyPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      audioElementsRef.current.forEach((a) => a.pause());
      audio.play().then(() => {
        setCurrentlyPlayingAudioId(msgId);
      }).catch((err) => {
        console.warn('Audio play error:', err);
        setCurrentlyPlayingAudioId(null);
      });
    }
  };

  const activePartner = users.find((u) => u.id === selectedRecipientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[92vh] sm:h-[84vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>الدردشة والرسائل الداخلية الفورية</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  مزامنة سحابية حية
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                تواصل مباشر بين الإدارة ومدخلي البيانات والمعلمين (نصوص، صور، وتسجيلات صوتية)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body: 2 Columns */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Right Sidebar: Users & Channel Directory */}
          <div className="w-1/3 sm:w-80 border-l border-slate-200 bg-slate-50/70 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-slate-200 bg-white sticky top-0 z-10">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-2">
                المحادثات المتاحة
              </span>

              {/* General Channel */}
              <button
                onClick={() => setSelectedRecipientId('all')}
                className={`w-full text-right p-2.5 rounded-xl transition flex items-center justify-between gap-2.5 cursor-pointer ${
                  selectedRecipientId === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`p-2 rounded-lg ${selectedRecipientId === 'all' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs sm:text-sm block truncate">فريق العمل العام</span>
                    <span className={`text-[10px] block ${selectedRecipientId === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      قناة جماعية مشتركة
                    </span>
                  </div>
                </div>

                {getUnreadCount('all') > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                    {getUnreadCount('all')}
                  </span>
                )}
              </button>
            </div>

            {/* Individual Users List */}
            <div className="p-2 space-y-1">
              <span className="px-2 py-1 text-[11px] font-bold text-slate-400 block">
                المستخدمون ({users.filter((u) => u.id !== currentUser.id).length})
              </span>

              {users
                .filter((u) => u.id !== currentUser.id)
                .map((u) => {
                  const isSelected = selectedRecipientId === u.id;
                  const unread = getUnreadCount(u.id);

                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedRecipientId(u.id)}
                      className={`w-full text-right p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="relative">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>

                        <div className="truncate">
                          <span className="font-bold text-xs sm:text-sm block truncate">{u.name}</span>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {u.role === 'admin' ? 'مدير عام' : u.role === 'data_entry' ? 'مدخل بيانات' : 'معلم'}
                          </span>
                        </div>
                      </div>

                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Left / Main Chat Pane */}
          <div className="flex-1 flex flex-col bg-slate-100/60">
            
            {/* Chat Pane Header */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedRecipientId === 'all' ? (
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={activePartner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                )}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {selectedRecipientId === 'all' ? 'قناة فريق العمل العامة' : activePartner?.name}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>متصل الآن ومتاح للمراسلة</span>
                  </span>
                </div>
              </div>

              <div className="text-left text-[11px] text-slate-400 font-mono">
                أنت تراسل بصفتك: <span className="font-bold text-slate-700">{currentUser.name}</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">لا توجد رسائل سابقة في هذه المحادثة</h4>
                  <p className="text-xs max-w-xs text-slate-500">
                    ابدأ المحادثة الآن بإرسال نص، صورة، أو تسجيل رسالة صوتية للمستخدم.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const time = new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      {/* Sender tag if not me */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            {msg.senderRole === 'admin' ? 'إدارة' : msg.senderRole === 'data_entry' ? 'مدخل بيانات' : 'معلم'}
                          </span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl p-3 max-w-[85%] sm:max-w-md shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-bl-sm'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-br-sm'
                        }`}
                      >
                        {/* Text */}
                        {msg.text && (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.text}
                          </p>
                        )}

                        {/* Image Attachment */}
                        {msg.imageUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-black/10">
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* Voice Recording Player */}
                        {msg.audioUrl && (
                          <div className={`mt-2 p-2.5 rounded-xl flex items-center gap-3 ${
                            isMe ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-800'
                          }`}>
                            <button
                              type="button"
                              onClick={() => togglePlayAudio(msg.id, msg.audioUrl!)}
                              className={`p-2 rounded-full cursor-pointer transition ${
                                isMe ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {currentlyPlayingAudioId === msg.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                                <span className="flex items-center gap-1">
                                  <Mic className="w-3 h-3" />
                                  <span>رسالة صوتية</span>
                                </span>
                                <span className="font-mono">
                                  {msg.audioDurationSeconds ? `${msg.audioDurationSeconds} ث` : '0:05'}
                                </span>
                              </div>
                              {/* Waveform graphic simulator */}
                              <div className="flex items-center gap-0.5 h-3">
                                {[40, 70, 30, 90, 60, 100, 50, 80, 40, 60, 90, 40, 70, 50].map((h, idx) => (
                                  <span
                                    key={idx}
                                    style={{ height: `${h}%` }}
                                    className={`w-1 rounded-full ${
                                      currentlyPlayingAudioId === msg.id
                                        ? isMe ? 'bg-emerald-300 animate-pulse' : 'bg-indigo-600 animate-pulse'
                                        : isMe ? 'bg-indigo-300' : 'bg-slate-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer Time & Status */}
                        <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          <span>{time}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Selected Image Preview (Pending Send) */}
            {selectedImage && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700">صورة مرفقة جاهزة للإرسال</span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="إلغاء الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Voice Recording UI */}
            {isRecording && (
              <div className="px-4 py-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3 text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                  <Mic className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-bold font-mono">
                    جاري التسجيل الصوتي: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إنهاء وحفظ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recorded Audio Ready to Send Preview */}
            {!isRecording && recordedAudioUrl && (
              <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-indigo-950">
                    تم تسجيل مقطع صوتي ({recordingSeconds} ثانية)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="حذف التسجيل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    إرسال التسجيل
                  </button>
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Attach Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                title="إرفاق صورة"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Record Audio Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title={isRecording ? 'إيقاف التسجيل' : 'تسجيل رسالة صوتية'}
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`اكتب رسالتك لـ ${selectedRecipientId === 'all' ? 'الجميع' : activePartner?.name || 'المستخدم'}...`}
                className="flex-1 bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden transition"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && !selectedImage && !recordedAudioBlob && !recordedAudioUrl}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition cursor-pointer shadow-xs shadow-indigo-600/30 flex items-center justify-center"
                title="إرسال"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
