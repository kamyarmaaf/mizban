import { useState } from 'react';
import { Save, ArrowRight, AlertCircle, Upload, X, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { filterContent } from '../utils/contentFilter';

interface WriteArticlePageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function WriteArticlePage({ onNavigate }: WriteArticlePageProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-dark/10">
          <p className="text-dark/60 text-lg mb-6 font-medium">برای نوشتن داستان باید وارد حساب خود شوید</p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full px-6 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            ورود / ثبت نام
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = profile.is_superuser || profile.is_staff;
  const isMizban = profile.user_type === 'mizban';

  if (!isAdmin && !isMizban) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-complementary/10 max-w-md w-full">
          <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16 text-complementary mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-dark mb-2">دسترسی غیرمجاز</h2>
          <p className="text-dark/60 text-base sm:text-lg mb-6 sm:mb-8">فقط مدیران سایت و میزبان‌ها اجازه نوشتن داستان را دارند.</p>
          <button
            onClick={() => onNavigate('articles')}
            className="w-full sm:w-auto px-8 py-3.5 bg-dark/5 text-dark/70 rounded-xl font-bold hover:bg-dark/10 transition-colors"
          >
            بازگشت به داستان‌ها
          </button>
        </div>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('لطفا عنوان و محتوای داستان را وارد کنید');
      return;
    }
    if (content.trim().length < 100) {
      setError('محتوای داستان باید حداقل 100 کاراکتر باشد');
      return;
    }

    const filterResult = filterContent(title, content);
    if (!filterResult.isClean) {
      setError(filterResult.message);
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
            onClick={() => onNavigate('articles')}
            className="flex items-center gap-2 text-light hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            بازگشت به داستان‌ها
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            نوشتن داستان سفر
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-luxury-lg p-5 sm:p-8 border border-dark/10">
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-complementary/10 border-2 border-complementary/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-complementary flex-shrink-0 mt-0.5" />
              <p className="text-complementary font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              عکس سفرت (اختیاری)
            </label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 sm:h-64 object-cover rounded-xl sm:rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 left-3 p-1.5 sm:p-2 bg-complementary text-white rounded-full hover:bg-complementary/90 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed border-dark/20 rounded-xl sm:rounded-2xl cursor-pointer hover:border-primary transition-colors bg-light hover:bg-primary/5">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-dark/40 mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base font-bold text-dark/70">عکست رو اینجا بکش یا کلیک کن</p>
                    <p className="text-xs sm:text-sm text-dark/50 mt-1">JPG، PNG یا WebP (حداکثر 2MB)</p>
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
              placeholder="مثال: سفر به جزیره کیش - تجربه‌ای فراموش‌نشدنی"
              className="w-full px-4 sm:px-6 py-3.5 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right text-base sm:text-lg font-bold transition-all"
              disabled={loading}
            />
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              مکان (اختیاری)
            </label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark/40" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: کیش، هرمزگان"
                className="w-full pr-10 sm:pr-12 pl-4 py-3.5 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right text-base sm:text-lg transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-dark mb-2 sm:mb-3 text-right">
              داستان سفرت
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="داستان و تجربیات سفرت رو به تفصیل بنویس...&#10;&#10;چه جاهایی رفتی؟&#10;چه چیزهایی دیدی؟&#10;چه غذاهایی خوردی؟&#10;چه اتفاقاتی افتاد؟"
              rows={12}
              className="w-full px-4 sm:px-6 py-3.5 sm:py-4 border-2 border-dark/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right leading-relaxed resize-none transition-all text-sm sm:text-base"
              disabled={loading}
            />
            <p className="text-xs sm:text-sm text-dark/50 mt-2 text-right">
              حداقل 100 کاراکتر - {content.length} کاراکتر
            </p>
          </div>

          <div className="bg-secondary/10 border-2 border-secondary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-secondary/90">
                <p className="font-bold mb-1">توجه:</p>
                <p>استفاده از کلمات نامناسب و فحش ممنوع است. داستان‌هایی که حاوی محتوای نامناسب باشند حذف خواهند شد.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-primary/90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-none"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'در حال انتشار...' : 'انتشار داستان'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('articles')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-dark/5 text-dark/70 rounded-xl sm:rounded-2xl font-bold hover:bg-dark/10 transition-all text-base sm:text-lg order-2 sm:order-none"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
