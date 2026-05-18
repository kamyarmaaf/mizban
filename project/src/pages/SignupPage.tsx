import { useState } from 'react';
import { UserPlus, X, Mail, Lock, User, Phone } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onClose: () => void;
}

export default function SignupPage({ onNavigate, onClose }: SignupPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) { setError('لطفا نام کامل خود را وارد کنید'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('لطفا ایمیل معتبر وارد کنید'); return false; }
    if (!formData.phone.trim()) { setError('لطفا شماره تماس خود را وارد کنید'); return false; }
    if (formData.password.length < 6) { setError('رمز عبور باید حداقل 6 حرف باشد'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('رمزهای عبور منطبق نیستند'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/create-visitor-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطایی در ثبت‌نام رخ داد');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی در ثبت‌نام رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-luxury-lg max-w-md w-full animate-slide-up my-auto border border-dark/5">

        {/* این بخش هدر اصلاح شد */}
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
          <h2 className="text-3xl font-black text-white mb-2">ثبت نام بازدیدکننده</h2>
          <p className="text-white/80">حساب جدید برای تجربه سفر خود</p>
        </div>
        {/* پایان بخش هدر */}

        <div className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium text-center animate-pulse">
              ثبت نام شما موفقیت‌آمیز بود! در حال هدایت...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-complementary/10 border border-complementary/20 rounded-xl text-complementary text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                نام کامل
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="نام و نام خانوادگی"
                  className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ایمیل خود را وارد کنید"
                  className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                شماره تماس
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09123456789"
                  className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="حداقل 6 حرف"
                  className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                تأیید رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  className="w-full pr-12 pl-4 py-3 bg-light border border-dark/20 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </button>

            <div className="mt-6 text-center border-t border-dark/10 pt-6">
              <p className="text-dark/60 text-sm">
                قبلا حساب دارید؟{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-primary font-bold hover:text-primary/80 transition-colors"
                >
                  وارد شوید
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
