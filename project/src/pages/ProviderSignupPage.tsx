import { useState } from 'react';
import { UserPlus, X, User, Lock, Mail, Phone, MapPin, Home, Briefcase } from 'lucide-react';

interface ProviderSignupPageProps {
  onClose: () => void;
  onNavigateToLogin: () => void;
}

const iranProvinces = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'خوزستان', 'آذربایجان شرقی', 'مازندران',
  'کرمان', 'سیستان و بلوچستان', 'گیلان', 'هرمزگان', 'قم', 'مرکزی', 'قزوین',
  'گلستان', 'اردبیل', 'کردستان', 'همدان', 'یزد', 'لرستان', 'کرمانشاه', 'بوشهر',
  'زنجان', 'سمنان', 'ایلام', 'چهارمحال و بختیاری', 'کهگیلویه و بویراحمد', 'آذربایجان غربی',
  'خراسان شمالی', 'خراسان جنوبی', 'البرز'
];

const hostingTypes = [
  'تجربه‌های فرهنگی',
  'تورهای غذایی',
  'طبیعت و کوهنوردی',
  'ماجراجویی',
  'هنر و صنایع دستی',
  'فعالیت‌های ورزشی',
  'تورهای تاریخی',
  'کارگاه‌های آموزشی'
];

export default function ProviderSignupPage({ onClose, onNavigateToLogin }: ProviderSignupPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    city: '',
    hostingType: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.fullName || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('لطفا تمام فیلدهای ضروری را پر کنید');
      setLoading(false);
      return;
    }

    if (!formData.province || !formData.city || !formData.hostingType) {
      setError('لطفا استان، شهر و نوع میزبانی را انتخاب کنید');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      setLoading(false);
      return;
    }

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('شماره موبایل معتبر نیست (مثال: 09123456789)');
      setLoading(false);
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('ایمیل معتبر نیست');
      setLoading(false);
      return;
    }

    try {
    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      password: formData.password,
      email: formData.email || '',  // اگر خالی بود رشته خالی بفرست
      province: formData.province,
      city: formData.city,
      hostingType: formData.hostingType,
    };

    const response = await fetch('http://127.0.0.1:8000/api/accounts/create-mizban-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      // ثبت‌نام موفق
      alert('ثبت نام شما با موفقیت انجام شد! پس از تایید توسط ادمین، می‌توانید وارد شوید.');
      onClose(); // بستن مودال
    } else {
      // خطای برگشتی از سرور
      if (data.errors) {
        // اگر خطاها به صورت شیء هستند
        const errorMessages = Object.values(data.errors).flat().join(' ');
        setError(errorMessages);
      } else if (data.error) {
        setError(data.error);
      } else if (data.message) {
        setError(data.message);
      } else {
        setError('خطا در ثبت نام. لطفا دوباره تلاش کنید');
      }
    }
  } catch (err) {
    console.error('Network error:', err);
    setError('خطا در ارتباط با سرور. لطفا اتصال اینترنت خود را بررسی کنید.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slide-up my-auto">
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-t-3xl p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">میزبان شو</h2>
          <p className="text-emerald-50">با ما تجربه‌های خود را به اشتراک بگذارید</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                نام و نام خانوادگی *
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="نام کامل خود را وارد کنید"
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                  شماره موبایل *
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09123456789"
                    className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                  رمز عبور *
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="حداقل 6 کاراکتر"
                    className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                  تکرار رمز عبور *
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-3 text-right">اطلاعات میزبانی</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2 text-right">
                    استان اقامت *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full pr-12 pl-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-right transition-all bg-white"
                      disabled={loading}
                    >
                      <option value="">انتخاب استان</option>
                      {iranProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2 text-right">
                    شهر اقامت *
                  </label>
                  <div className="relative">
                    <Home className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="نام شهر خود را وارد کنید"
                      className="w-full pr-12 pl-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-right transition-all bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2 text-right">
                  نوع میزبانی *
                </label>
                <div className="relative">
                  <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <select
                    value={formData.hostingType}
                    onChange={(e) => setFormData({ ...formData, hostingType: e.target.value })}
                    className="w-full pr-12 pl-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-right transition-all bg-white"
                    disabled={loading}
                  >
                    <option value="">نوع تجربه را انتخاب کنید</option>
                    {hostingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm font-medium text-right">
                ثبت نام شما پس از بررسی توسط تیم میزبان تایید خواهد شد.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ثبت نام...' : 'ثبت نام به عنوان میزبان'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              قبلا حساب دارید؟{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-emerald-600 font-bold hover:text-emerald-700"
              >
                وارد شوید
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
