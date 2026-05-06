import { useState } from 'react';
import { Save, ArrowRight, AlertCircle, Upload, X, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { filterContent } from '../utils/contentFilter';
import { saveArticle } from '../data/mockArticles';
import { Article } from '../types/article';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-lg mb-6 font-medium">برای نوشتن داستان باید وارد حساب خود شوید</p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full px-6 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            ورود / ثبت نام
          </button>
        </div>
      </div>
    );
  }

  // بررسی نقش کاربر: فقط ادمین‌ها یا میزبان‌ها اجازه دارند
  const isAdmin = profile.is_superuser || profile.is_staff;
  const isMizban = profile.user_type === 'mizban';

  if (!isAdmin && !isMizban) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-red-100 max-w-md w-full">
          <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">دسترسی غیرمجاز</h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">فقط مدیران سایت و میزبان‌ها اجازه نوشتن داستان را دارند.</p>
          <button
            onClick={() => onNavigate('articles')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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

    // بررسی فیلتر کلمات (از کد اصلی خودتان)
    const filterResult = filterContent(title, content);
    if (!filterResult.isClean) {
      setError(filterResult.message);
      return;
    }

    try {
      setLoading(true);

      // ساخت فرم‌دیتا برای ارسال به بک‌اند
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      // ارسال آدرس به بک‌اند (استفاده از متغیر location فرانت و ارسال به نام address)
      if (location.trim()) {
        formData.append('address', location.trim());
      }

      // ارسال عکس در صورت وجود
      if (imageFile) {
        formData.append('cover_image', imageFile);
      }

      // دریافت توکن (اگر توکن را در جای دیگری ذخیره می‌کنید، این خط را اصلاح کنید)
      const token = localStorage.getItem('access_token');

      // ارسال درخواست به بک‌اند
      const response = await fetch('http://127.0.0.1:8000/api/articles/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type را نباید برای FormData دستی تنظیم کنیم
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در ارتباط با سرور');
      }

      const data = await response.json();

      // هدایت به صفحه مقاله جدید
      onNavigate('article-detail', data.id.toString());

    } catch (err) {
      console.error('خطا در ثبت داستان:', err);
      setError('خطا در ثبت داستان. لطفا دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8 sm:pb-12">
      {/* تغییر رنگ هدر به سبز */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('articles')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base font-medium"
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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-luxury-lg p-5 sm:p-8 border border-gray-100">
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
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
                    className="absolute top-3 left-3 p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 sm:border-3 border-dashed border-gray-300 rounded-xl sm:rounded-2xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50/30">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base font-bold text-gray-700">عکست رو اینجا بکش یا کلیک کن</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">JPG، PNG یا WebP (حداکثر 2MB)</p>
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
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
              عنوان داستان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: سفر به جزیره کیش - تجربه‌ای فراموش‌نشدنی"
              className="w-full px-4 sm:px-6 py-3.5 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right text-base sm:text-lg font-bold transition-all"
              disabled={loading}
            />
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
              مکان (اختیاری)
            </label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: کیش، هرمزگان"
                className="w-full pr-10 sm:pr-12 pl-4 py-3.5 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right text-base sm:text-lg transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
              داستان سفرت
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="داستان و تجربیات سفرت رو به تفصیل بنویس...&#10;&#10;چه جاهایی رفتی؟&#10;چه چیزهایی دیدی؟&#10;چه غذاهایی خوردی؟&#10;چه اتفاقاتی افتاد؟"
              rows={12}
              className="w-full px-4 sm:px-6 py-3.5 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right leading-relaxed resize-none transition-all text-sm sm:text-base"
              disabled={loading}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-right">
              حداقل 100 کاراکتر - {content.length} کاراکتر
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-yellow-800">
                <p className="font-bold mb-1">توجه:</p>
                <p>استفاده از کلمات نامناسب و فحش ممنوع است. داستان‌هایی که حاوی محتوای نامناسب باشند حذف خواهند شد.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:from-emerald-700 hover:to-green-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-none"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'در حال انتشار...' : 'انتشار داستان'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('articles')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-200 transition-all text-base sm:text-lg order-2 sm:order-none"
            >
              انصراف
            </button>
          </div>
        </form>

        {/* تغییر رنگ باکس راهنما به طیف سبز */}

      </div>
    </div>
  );
}
