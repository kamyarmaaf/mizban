import { useState } from 'react';
import { LogIn, User, Lock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onClose: () => void;
}

export default function LoginPage({ onNavigate, onClose }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('لطفا تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slide-up my-auto border border-dark/10">
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-t-3xl p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">ورود به میزبان</h2>
          <p className="text-white/80">به جامعه میزبان‌ها خوش آمدید</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-complementary/10 border border-complementary/20 rounded-xl text-complementary text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                نام کاربری
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="شماره موبایل"
                  className="w-full pr-12 pl-4 py-4 border border-dark/10 bg-light/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="w-full pr-12 pl-4 py-4 border border-dark/10 bg-light/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-right transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:translate-y-0"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>

            <div className="mt-6 text-center border-t border-dark/10 pt-6">
              <p className="text-dark/60 text-sm mb-3">حساب ندارید؟</p>
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="w-full py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all"
              >
                ثبت‌نام کنید
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
