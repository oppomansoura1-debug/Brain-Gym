import { Student, EducationalGroup, AcademicStage } from '../types';

/**
 * Normalizes Arabic text for flexible matching:
 * - Unifies alef forms (أ, إ, آ -> ا)
 * - Unifies taa marbuta and haa (ة -> ه)
 * - Unifies yaa and alif maqsura (ى -> ي)
 * - Strips punctuation, dashes, underscores, and extra whitespace
 */
export const normalizeArabicText = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\s\-_()]/g, '');
};

/**
 * Extracts category code from stage strings (secondary, preparatory, primary, quran, speech, early)
 */
export const extractStageCategory = (text: string): string => {
  const norm = normalizeArabicText(text);
  if (norm.includes('ثانوي') || norm.includes('ثانويه') || norm.includes('sec')) return 'secondary';
  if (norm.includes('اعدادي') || norm.includes('اعداديه') || norm.includes('prep')) return 'preparatory';
  if (norm.includes('ابتدائي') || norm.includes('ابتدائيه') || norm.includes('pri')) return 'primary';
  if (norm.includes('قران') || norm.includes('qrn')) return 'quran';
  if (norm.includes('تخاطب') || norm.includes('sph')) return 'speech';
  if (norm.includes('تحضيري') || norm.includes('pre')) return 'early';
  return '';
};

/**
 * Extracts grade numeric index (1 to 6) from text
 */
export const extractGradeNumber = (text: string): string => {
  const norm = normalizeArabicText(text);
  if (norm.includes('اول') || norm.includes('1') || norm.includes('1st')) return '1';
  if (norm.includes('ثاني') || norm.includes('2') || norm.includes('2nd')) return '2';
  if (norm.includes('ثالث') || norm.includes('3') || norm.includes('3rd')) return '3';
  if (norm.includes('رابع') || norm.includes('4') || norm.includes('4th')) return '4';
  if (norm.includes('خامس') || norm.includes('5') || norm.includes('5th')) return '5';
  if (norm.includes('سادس') || norm.includes('6') || norm.includes('6th')) return '6';
  return '';
};

/**
 * Validates whether a student is academically suitable for an educational group.
 * Ensures the student belongs strictly to the academic stage (and grade) of the group.
 */
export const checkStageSuitability = (
  student: Student,
  group: EducationalGroup,
  stages: AcademicStage[] = []
): boolean => {
  if (!student || !group) return false;

  // 1. Direct Stage ID exact match (primary criteria)
  if (student.stageId && group.stageId && student.stageId === group.stageId) {
    return true;
  }

  // 2. Lookup stages in the master stages list
  const studentStage = stages.find(s => s.id === student.stageId || s.name === student.stageName);
  const groupStage = stages.find(s => s.id === group.stageId || s.name === group.stageName);

  if (studentStage && groupStage) {
    if (studentStage.id === groupStage.id) return true;

    // Compare mainStage & grade from stage entities
    const sameMainStage = normalizeArabicText(studentStage.mainStage) === normalizeArabicText(groupStage.mainStage);
    if (sameMainStage) {
      const isStdSpecial = !studentStage.grade || studentStage.grade === '--';
      const isGrpSpecial = !groupStage.grade || groupStage.grade === '--';
      if (isStdSpecial || isGrpSpecial) {
        return true;
      }
      if (normalizeArabicText(studentStage.grade) === normalizeArabicText(groupStage.grade)) {
        return true;
      }
    }
  }

  // 3. Compare studentStage with group's mainStage and grade attributes
  if (studentStage && group.mainStage) {
    const sameMain = normalizeArabicText(studentStage.mainStage) === normalizeArabicText(group.mainStage);
    if (sameMain) {
      if (!group.grade || group.grade === '--' || !studentStage.grade || studentStage.grade === '--') {
        return true;
      }
      if (normalizeArabicText(studentStage.grade) === normalizeArabicText(group.grade)) {
        return true;
      }
    }
  }

  // 4. Compare groupStage with student's attributes
  if (groupStage && student.stageName) {
    const stdCat = extractStageCategory(student.stageName + ' ' + (student.stageId || ''));
    const grpCat = extractStageCategory(groupStage.mainStage + ' ' + groupStage.name + ' ' + groupStage.id);

    if (stdCat && grpCat && stdCat === grpCat) {
      if (['quran', 'speech', 'early'].includes(stdCat)) {
        return true;
      }
      const stdGrade = extractGradeNumber(student.stageName);
      const grpGrade = extractGradeNumber(groupStage.grade || groupStage.name);
      if (stdGrade && grpGrade) {
        return stdGrade === grpGrade;
      }
      return true;
    }
  }

  // 5. Semantic string analysis comparing student's stageName with group's stageName / mainStage / grade
  const stdInfo = `${student.stageName || ''} ${student.stageId || ''}`;
  const grpInfo = `${group.stageName || ''} ${group.mainStage || ''} ${group.grade || ''} ${group.stageId || ''}`;

  const stdCat = extractStageCategory(stdInfo);
  const grpCat = extractStageCategory(grpInfo);

  if (stdCat && grpCat && stdCat === grpCat) {
    if (['quran', 'speech', 'early'].includes(stdCat)) {
      return true;
    }
    const stdGrade = extractGradeNumber(stdInfo);
    const grpGrade = extractGradeNumber(grpInfo);

    if (stdGrade && grpGrade) {
      return stdGrade === grpGrade;
    }
    // If one of them doesn't specify a grade number, fallback to main category match
    return true;
  }

  return false;
};
