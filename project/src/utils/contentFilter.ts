const BANNED_WORDS = [
  'کص',
  'کصشر',
  'کص شر',
  'کیر',
  'کیری',
  'کصمشنگ',
  'جنده',
  'کسکش',
  'خارکسده',
  'کس کش',
  'کیرم',
  'گاییدم',
  'گوه',
  'گه',
  'مادر جنده',
  'کونی',
  'عنتر',
  'جاکش',
  'حرومزاده',
  'حروم زاده'
];

export function containsBannedWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

export function filterContent(title: string, content: string): { isClean: boolean; message: string } {
  if (containsBannedWords(title) || containsBannedWords(content)) {
    return {
      isClean: false,
      message: 'متن شما حاوی کلمات نامناسب است. لطفا محتوای خود را اصلاح کنید.'
    };
  }
  return {
    isClean: true,
    message: ''
  };
}
