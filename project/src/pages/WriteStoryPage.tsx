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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('لطفا عنوان داستان را وارد کنید');
      return;
    }

    if (!location.trim()) {
      setError('لطفا مکان سفر را وارد کنید');
      return;
    }

    if (!content.trim()) {
      setError('لطفا داستان خود را بنویسید');
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

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('برای ثبت داستان باید وارد حساب کاربری خود شوید.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('location', location.trim());
      formData.append('content', content.trim());
      formData.append('image', imageFile);

      const response = await fetch('http://127.0.0.1:8000/api/stories/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setLoading(false);
        alert('داستان شما با موفقیت ثبت شد!');
        onNavigate('travel-stories');
      } else {
        const errorData = await response.json();
        console.error('خطا از سمت سرور:', errorData);
        setError('خطا در ثبت داستان. لطفا دوباره تلاش کنید.');
        setLoading(false);
      }
    } catch (err) {
      console.error('خطای ارتباط با سرور:', err);
      setError('خطای ارتباط با سرور. لطفا دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8 sm:pb-12">
      {/* تغییر رنگ پس‌زمینه به طیف‌های سبز */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 py-10 sm:py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 gradient-mesh opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('travel-stories')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            بازگشت به داستان‌ها
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center leading-snug">
            نوشتن داستان سفر
          </h1>
          <p className="text-base sm:text-xl text-white/90 mt-2 sm:mt-3 text-center">
            ماجراهای خود را با دنیا به اشتراک بگذارید
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:mt-8 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-luxury-lg p-5 sm:p-8 border border-gray-100">
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
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
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium">
                      {formatFileSize(imageFile.size)}
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 sm:h-80 border-2 sm:border-3 border-dashed border-gray-300 rounded-xl sm:rounded-2xl cursor-pointer hover:border-green-500 transition-all bg-white hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-bold text-gray-700 mb-1 sm:mb-2">انتخاب عکس سفر</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">JPG، PNG یا WebP</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">حداکثر حجم: 2 مگابایت</p>
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
              placeholder="مثال: سفر به جزیره کیش"
              className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right text-base sm:text-lg font-bold transition-all"
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 text-right">
              {title.length} / 100 کاراکتر
            </p>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
              مکان سفر
            </label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: کیش، خلیج فارس"
                className="w-full pr-10 sm:pr-12 pl-4 sm:pl-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right text-base sm:text-lg transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-right">
              داستان سفر
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="داستان سفر خود را با جزئیات بنویسید... چه چیزی دیدید؟ چه تجربه‌ای داشتید؟"
              rows={8}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right text-sm sm:text-base leading-relaxed resize-none transition-all"
              disabled={loading}
              maxLength={5000}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 text-right">
              حداقل 100 کاراکتر - {content.length} / 5000 کاراکتر
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-800">
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
              className="flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:from-emerald-700 hover:to-green-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-none"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'در حال انتشار...' : 'انتشار داستان'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('travel-stories')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-200 transition-all text-base sm:text-lg order-2 sm:order-none"
            >
              انصراف
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">📸</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-gray-900 sm:mb-1">عکس با کیفیت</h3>
              <p className="text-xs sm:text-sm text-gray-600">از عکس‌های واضح و جذاب استفاده کنید</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">✍️</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-gray-900 sm:mb-1">داستان جذاب</h3>
              <p className="text-xs sm:text-sm text-gray-600">تجربیات خود را داستان‌وار بنویسید</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 text-center flex items-center sm:block gap-4 sm:gap-0">
            <div className="text-3xl sm:text-4xl sm:mb-3">🌍</div>
            <div className="text-right sm:text-center">
              <h3 className="font-black text-gray-900 sm:mb-1">مکان دقیق</h3>
              <p className="text-xs sm:text-sm text-gray-600">مکان سفر را به وضوح مشخص کنید</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
