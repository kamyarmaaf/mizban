import { useState } from 'react';
import { Save, ArrowRight, AlertCircle, Upload, X, MapPin } from 'lucide-react';

interface WriteStoryPageProps {
  onNavigate: (page: string) => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function WriteStoryPage({ onNavigate }: WriteStoryPageProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('فقط فرمت‌های JPG، PNG و WebP مجاز هستند');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('حجم عکس نباید بیش از 2MB باشد');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !location.trim() || !content.trim()) {
      setError('لطفا تمام فیلدهای ستاره‌دار را پر کنید');
      return;
    }

    if (content.trim().length < 100) {
      setError('داستان شما باید حداقل 100 کاراکتر باشد');
      return;
    }

    if (!imageFile) {
      setError('لطفا یک عکس برای داستان خود انتخاب کنید');
      return;
    }

    setLoading(true);
    // ... بقیه منطق ارسال فرم بدون تغییر باقی می‌ماند
  };

  return (
    <div className="min-h-screen bg-light pb-8 sm:pb-12">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('travel-stories')}
            className="flex items-center gap-2 text-light hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            بازگشت به داستان‌ها
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            نوشتن داستان سفر
          </h1>
          <p className="text-base sm:text-lg text-light/90 mt-2">
            ماجراهای خود را با دنیا به اشتراک بگذارید
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-luxury-lg p-5 sm:p-8 border border-dark/10">
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-complementary/10 border-2 border-complementary/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-complementary flex-shrink-0 mt-0.5" />
              <p className="text-complementary font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              عکس سفر شما
            </label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 sm:h-80 object-cover rounded-xl sm:rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 sm:p-2 bg-complementary text-white rounded-full hover:bg-complementary/90 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-dark/70 backdrop-blur-sm text-light rounded-full text-xs sm:text-sm font-medium">
                      {formatFileSize(imageFile.size)}
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 sm:h-80 border-2 border-dashed border-dark/20 rounded-xl sm:rounded-2xl cursor-pointer hover:border-primary transition-all bg-light hover:bg-primary/5">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className="w-10 h-10 sm:w-16 sm:h-16 text-dark/40 mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-bold text-dark/70 mb-1 sm:mb-2">انتخاب عکس سفر</p>
                    <p className="text-xs sm:text-sm text-dark/50 mb-1">JPG، PNG یا WebP</p>
                    <p className="text-[10px] sm:text-xs text-dark/40">حداکثر حجم: 2 مگابایت</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              عنوان داستان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: سفر به جزیره کیش"
              className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right text-base sm:text-lg font-bold transition-all"
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs sm:text-sm text-dark/50 mt-1.5 sm:mt-2 text-right">
              {title.length} / 100 کاراکتر
            </p>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              مکان سفر
            </label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark/40" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: کیش، خلیج فارس"
                className="w-full pr-10 sm:pr-12 pl-4 sm:pl-6 py-3 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right text-base sm:text-lg transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              داستان سفر
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="داستان سفر خود را با جزئیات بنویسید... چه چیزی دیدید؟ چه تجربه‌ای داشتید؟"
              rows={8}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right text-sm sm:text-base leading-relaxed resize-none transition-all"
              disabled={loading}
              maxLength={5000}
            />
            <p className="text-xs sm:text-sm text-dark/50 mt-1.5 sm:mt-2 text-right">
              حداقل 100 کاراکتر - {content.length} / 5000 کاراکتر
            </p>
          </div>

          <div className="bg-secondary/10 border-2 border-secondary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-secondary/90">
                <p className="font-bold mb-1">نکات مهم:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>حجم عکس نباید بیش از 2 مگابایت باشد</li>
                  <li>فقط فرمت‌های JPG، PNG و WebP مجاز هستند</li>
                  <li>داستان شما باید حداقل 100 کاراکتر داشته باشد</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading || !title.trim() || !location.trim() || !content.trim() || !imageFile}
              className="flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-primary/90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-none"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'در حال انتشار...' : 'انتشار داستان'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('travel-stories')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-dark/5 text-dark/70 rounded-xl sm:rounded-2xl font-bold hover:bg-dark/10 transition-all text-base sm:text-lg order-2 sm:order-none"
            >
              انصراف
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-dark/10 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">📸</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-dark sm:mb-1">عکس با کیفیت</h3>
              <p className="text-xs sm:text-sm text-dark/60">از عکس‌های واضح و جذاب استفاده کنید</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-dark/10 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">✍️</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-dark sm:mb-1">داستان جذاب</h3>
              <p className="text-xs sm:text-sm text-dark/60">تجربیات خود را داستان‌وار بنویسید</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-dark/10 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">🌍</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-dark sm:mb-1">مکان دقیق</h3>
              <p className="text-xs sm:text-sm text-dark/60">مکان سفر را به وضوح مشخص کنید</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
