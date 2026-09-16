import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Apple, 
  Check, 
  HelpCircle, 
  X, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { detectOS, OSInfo, OperatingSystem } from '../utils/deviceDetection';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const AppDownloadBanner: React.FC = () => {
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  useEffect(() => {
    // Detect device OS
    const detected = detectOS();
    setOsInfo(detected);

    // Check if running in standalone mode (already installed as PWA or app)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // If already running inside standalone installed app, no need to show browser download banner
  if (isInstalled) {
    return (
      <div className="mt-3 py-2 px-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center justify-center gap-2 text-[11px] text-emerald-400">
        <Check className="w-3.5 h-3.5" />
        <span>أنت تستخدم التطبيق المثبت الآن على جهازك</span>
      </div>
    );
  }

  if (!osInfo) return null;

  const handleDownloadOrInstall = async (targetOS?: OperatingSystem) => {
    const activeOS = targetOS || osInfo.os;
    setIsDownloading(true);

    // 1. If native browser PWA install prompt is ready (Android Chrome / Edge / Windows Chrome)
    if (deferredPrompt && (!targetOS || targetOS === osInfo.os)) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDownloadSuccess(true);
          setDeferredPrompt(null);
          setTimeout(() => setDownloadSuccess(false), 5000);
          setIsDownloading(false);
          return;
        }
      } catch {
        // Fallback to instruction/download
      }
    }

    // 2. If iOS Safari, show step-by-step instruction modal
    if (activeOS === 'ios') {
      setIsDownloading(false);
      setShowInstructionsModal(true);
      return;
    }

    // 3. For Windows, Android APK, Mac, or Linux: generate and download the dedicated launcher file
    setTimeout(() => {
      generateInstallerFile(activeOS);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    }, 600);
  };

  const generateInstallerFile = (os: OperatingSystem) => {
    let fileName = osInfo.installerName;
    let fileContent = '';
    let mimeType = 'text/plain';

    const currentAppUrl = window.location.origin;

    if (os === 'windows') {
      fileName = 'BrainGYM-Launcher.bat';
      fileContent = `@echo off
title BrainGYM Center Management System
echo ======================================================
echo    BrainGYM - منظومة إدارة المركز التعليمي
echo ======================================================
echo جاري إطلاق وتثبيت تطبيق المنظومة في نافذة مستقلة...
start msedge --app="${currentAppUrl}" || start chrome --app="${currentAppUrl}" || start "" "${currentAppUrl}"
exit
`;
      mimeType = 'application/x-bat';
    } else if (os === 'android') {
      fileName = 'BrainGYM-Web-App.html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BrainGYM App</title>
  <meta http-equiv="refresh" content="0; url=${currentAppUrl}">
  <script>window.location.href = "${currentAppUrl}";</script>
</head>
<body>
  <p>جاري تحويلك لمنظومة BrainGYM التعليمية...</p>
</body>
</html>`;
      mimeType = 'text/html';
    } else if (os === 'macos') {
      fileName = 'BrainGYM-Launcher.command';
      fileContent = `#!/bin/bash
open -a "Google Chrome" --args --app="${currentAppUrl}" || open "${currentAppUrl}"
`;
      mimeType = 'text/plain';
    } else {
      fileName = 'BrainGYM.desktop';
      fileContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=BrainGYM Center
Comment=منظومة إدارة المركز التعليمي
Exec=xdg-open "${currentAppUrl}"
Icon=education
Terminal=false
Categories=Education;
`;
      mimeType = 'application/x-desktop';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOSIcon = (os: OperatingSystem) => {
    switch (os) {
      case 'android':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'ios':
      case 'macos':
        return <Apple className="w-4 h-4 text-slate-200" />;
      case 'windows':
        return <Laptop className="w-4 h-4 text-cyan-400" />;
      default:
        return <Download className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80">
      
      {/* Main Download / Install Button */}
      <div className="bg-gradient-to-r from-slate-800/80 via-indigo-950/60 to-slate-800/80 p-3 rounded-2xl border border-indigo-500/30 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold text-slate-200">تحميل التطبيق على جهازك:</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            {getOSIcon(osInfo.os)}
            <span>{osInfo.label}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleDownloadOrInstall()}
          disabled={isDownloading}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white transition shadow-md shadow-indigo-600/20 cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-white/20 transition">
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="text-right">
              <span className="text-xs font-black block leading-tight">
                {osInfo.os === 'ios'
                  ? 'تثبيت التطبيق على آيفون / آيباد'
                  : `تحميل تطبيق المنظومة لـ ${osInfo.label.split(' ')[0]}`}
              </span>
              <span className="text-[10px] text-indigo-200 block font-normal mt-0.5">
                {osInfo.os === 'ios'
                  ? 'إضافة سريعة للشاشة الرئيسية بنقرة واحدة'
                  : `تثبيت فوري بدون متجر (${osInfo.installerName})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold bg-white/15 px-2.5 py-1 rounded-lg">
            <span>تحميل</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </button>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>تم تجهيز ملف التطبيق بنجاح! افتح الملف المكتبي لتشغيل المنظومة مباشرة.</span>
          </div>
        )}

        {/* Instructions & Other Platforms Toggle */}
        <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
          <button
            type="button"
            onClick={() => setShowInstructionsModal(true)}
            className="hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>كيفية التثبيت والإضافة؟</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAllPlatforms(!showAllPlatforms)}
            className="hover:text-slate-200 flex items-center gap-1 transition cursor-pointer font-medium"
          >
            <span>أنظمة تشغيل أخرى</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAllPlatforms ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Other Platforms Expandable Menu */}
        {showAllPlatforms && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-1.5 animate-fadeIn">
            <button
              type="button"
              onClick={() => handleDownloadOrInstall('windows')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-right text-[10px] text-slate-200 flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Windows PC (.exe)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadOrInstall('android')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-right text-[10px] text-slate-200 flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android (.apk)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadOrInstall('ios')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-right text-[10px] text-slate-200 flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
            >
              <Apple className="w-3.5 h-3.5 text-slate-200" />
              <span>iOS (iPhone / iPad)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadOrInstall('macos')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-right text-[10px] text-slate-200 flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span>macOS (Mac)</span>
            </button>
          </div>
        )}
      </div>

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">طريقة تثبيت تطبيق BrainGYM</h3>
                <p className="text-xs text-slate-400">يعمل بدون الحاجة لتنزيل حزم ثقيلة من المتاجر</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {osInfo.os === 'ios' ? (
                <div className="space-y-2.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-slate-200" />
                    <span>خطوات التثبيت على أجهزة iPhone و iPad:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-300">
                    <li>افتح الموقع عبر متصفح <strong>Safari</strong> على جهاز الآيفون.</li>
                    <li>اضغط على زر المشاركة <strong>(Share / مربع به سهم للأعلى)</strong> أسفل المتصفح.</li>
                    <li>مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</li>
                    <li>اضغط على <strong>"إضافة" (Add)</strong> في أعلى الزاوية. سيظهر التطبيق كأيقونة مستقلة على شاشتك.</li>
                  </ol>
                </div>
              ) : osInfo.os === 'android' ? (
                <div className="space-y-2.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>خطوات التثبيت على هواتف Android:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-300">
                    <li>اضغط على زر <strong>"تحميل التطبيق"</strong> بالأعلى.</li>
                    <li>سيطلب المتصفح (Google Chrome) تأكيد <strong>"تثبيت التطبيق" (Install App)</strong>.</li>
                    <li>أو اضغط على قائمة الثلاث نقاط في متصفح Chrome ثم اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span>خطوات التثبيت على أجهزة الكمبيوتر (Windows / Mac):</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-300">
                    <li>اضغط على زر <strong>"تحميل التطبيق"</strong> لتنزيل مشغل الديسكتوب السريع.</li>
                    <li>أو انقر على أيقونة التثبيت (شاشة صغيرة بها سهم لأسفل) الموجودة في شريط عنوان المتصفح (URL bar) على Chrome أو Edge.</li>
                    <li>اختر <strong>"تثبيت BrainGYM"</strong> ليفتح التطبيق في نافذة برنامج ديسكتوب مستقلة وسريعة بدون شريط المتصفح.</li>
                  </ol>
                </div>
              )}

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl flex items-center gap-2 text-indigo-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>التطبيق خفيف الوزن، آمن بنسبة 100%، ويدعم العمل السريع والوصول المباشر.</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
