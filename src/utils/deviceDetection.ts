export type OperatingSystem = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';

export interface OSInfo {
  os: OperatingSystem;
  label: string;
  installerName: string;
  fileExt: string;
  iconType: string;
  isMobile: boolean;
  installInstruction: string;
}

export function detectOS(): OSInfo {
  if (typeof window === 'undefined') {
    return {
      os: 'unknown',
      label: 'نظام التشغيل',
      installerName: 'BrainGYM-App',
      fileExt: '.exe',
      iconType: 'desktop',
      isMobile: false,
      installInstruction: 'تثبيت التطبيق على جهازك'
    };
  }

  const userAgent = window.navigator.userAgent || '';
  const platform = (window.navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || window.navigator.platform || '';

  // Android detection
  if (/android/i.test(userAgent)) {
    return {
      os: 'android',
      label: 'Android (أندرويد)',
      installerName: 'BrainGYM-Android.apk',
      fileExt: '.apk',
      iconType: 'android',
      isMobile: true,
      installInstruction: 'تثبيت تطبيق الأندرويد مباشرة أو إضافته للشاشة الرئيسية كـ PWA'
    };
  }

  // iOS detection (iPhone, iPad, iPod)
  if (/iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return {
      os: 'ios',
      label: 'iOS (آيفون / آيباد)',
      installerName: 'BrainGYM-iOS.mobileconfig',
      fileExt: '.mobileconfig',
      iconType: 'apple',
      isMobile: true,
      installInstruction: 'إضافة للشاشة الرئيسية من زر المشاركة (Share) في متصفح Safari'
    };
  }

  // Windows detection
  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) {
    return {
      os: 'windows',
      label: 'Windows PC (ويندوز)',
      installerName: 'BrainGYM-Setup-x64.exe',
      fileExt: '.exe',
      iconType: 'windows',
      isMobile: false,
      installInstruction: 'تثبيت التطبيق كبرنامج ديسكتوب مباشر للويندوز عبر المتصفح'
    };
  }

  // macOS detection
  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) {
    return {
      os: 'macos',
      label: 'macOS (ماك)',
      installerName: 'BrainGYM-macOS.dmg',
      fileExt: '.dmg',
      iconType: 'apple',
      isMobile: false,
      installInstruction: 'تثبيت التطبيق لجهاز ماك عبر المتصفح كبرنامج مكتبي'
    };
  }

  // Linux detection
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) {
    return {
      os: 'linux',
      label: 'Linux (لينكس)',
      installerName: 'BrainGYM-Linux.AppImage',
      fileExt: '.AppImage',
      iconType: 'linux',
      isMobile: false,
      installInstruction: 'تشغيل حزمة تطبيق لينكس المستقلة'
    };
  }

  return {
    os: 'unknown',
    label: 'تطبيق الويب المكتبي',
    installerName: 'BrainGYM-App',
    fileExt: '.app',
    iconType: 'desktop',
    isMobile: false,
    installInstruction: 'تثبيت المنظومة كتطبيق مستقل على جهازك'
  };
}
