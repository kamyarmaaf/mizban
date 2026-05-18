import { useState } from 'react';
import { UserPlus, User, Lock, Phone, Mail, MapPin, Home as HomeIcon, Briefcase, X } from 'lucide-react';

interface SignupProviderPageProps {
  onNavigate: (page: 'login' | 'signup' | 'signup-provider') => void;
  onClose: () => void;
}

const provinces = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'خوزستان',
  'مازندران', 'کرمان', 'گیلان', 'همدان', 'یزد', 'قم', 'سمنان', 'قزوین'
];

const hostingTypes = [
  'تجربه‌های غذایی',
  'تجربه‌های فرهنگی',
  'تجربه‌های طبیعت‌گردی',
  'تجربه‌های هنری',
  'تجربه‌های ماجراجویی',
  'تجربه‌های ورزشی'
];

export default function SignupProviderPage({ onNavigate, onClose }: SignupProviderPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
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

    const requiredFields = [
      'fullName', 'phone', 'email', 'password', 'confirmPassword',
      'province', 'city', 'hostingType'
    ];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      setError('لطفا تمام فیلدهای ستاره‌دار را پر کنید');
      return;
    }

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('شماره تلفن باید با 09 شروع شود و 11 رقم باشد');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('فرمت ایمیل صحیح نیست');
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    setLoading(true);

    try {
      console.log('ثبت نام میزبان:', formData);

      setTimeout(() => {
        setLoading(false);
        alert('ثبت نام شما با موفقیت انجام شد! پس از تایید، می‌توانید وارد شوید.');
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setError('خطا در ثبت نام. لطفا دوباره تلاش کنید');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-luxury-lg max-w-2xl w-full animate-slide-up my-auto border border-dark/5">

        <div className="relative bg-primary rounded-t-3xl p-8 text-center">
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
          <p className="text-white/80">به خانواده میزبانان ما بپیوندید</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-complementary/10 border border-complementary/20 rounded-xl text-complementary text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- Personal Information --- */}
            <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                    نام و نام خانوادگی <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                    <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="نام کامل خود را وارد کنید"
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                    disabled={loading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                  شماره موبایل <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09123456789"
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                  ایمیل <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-left transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                  رمز عبور <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="حداقل 6 کاراکتر"
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                  تکرار رمز عبور <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* --- Hosting Information --- */}
            <div className="border-t border-dark/10 pt-6 space-y-6">
              <h3 className="text-lg font-black text-dark mb-0 text-right">اطلاعات میزبانی</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                    استان اقامت <span className="text-complementary">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="">انتخاب کنید...</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                    شهر اقامت <span className="text-complementary">*</span>
                  </label>
                  <div className="relative">
                    <HomeIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="نام شهر"
                      className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                  نوع میزبانی <span className="text-complementary">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                  <select
                    value={formData.hostingType}
                    onChange={(e) => setFormData({ ...formData, hostingType: e.target.value })}
                    className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="">انتخاب کنید...</option>
                    {hostingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <p className="text-sm text-secondary text-right leading-relaxed">
                با ثبت نام به عنوان میزبان، می‌توانید تجربه‌های منحصربه‌فرد خود را با گردشگران به اشتراک بگذارید و درآمد کسب کنید.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'در حال ارسال اطلاعات...' : 'ثبت نام به عنوان میزبان'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-dark/10 pt-6">
            <p className="text-dark/60 text-sm">
              قبلا ثبت نام کرده‌اید؟{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-primary font-bold hover:text-primary/80 transition-colors"
              >
                وارد شوید
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
