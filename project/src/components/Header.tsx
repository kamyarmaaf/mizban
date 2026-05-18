import { User, ChevronDown, LogOut, Heart, Home, Search, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/images/logo.png';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  const isLoggedIn = !!user;
  const userRole = profile?.user_type || 'visitor';
  const userName = profile?.name || 'کاربر';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMenuItems = () => {
    if (userRole === 'admin') {
      return [
        { label: 'داشبورد مدیریت', page: 'admin-dashboard' },
        { label: 'پروفایل من', page: 'profile' }
      ];
    } else if (userRole === 'mizban') {
      return [
        { label: 'داشبورد میزبان', page: 'provider-dashboard' },
        { label: 'پروفایل من', page: 'profile' }
      ];
    } else {
      return [
        { label: 'رزروهای من', page: 'tourist-dashboard' },
        { label: 'پروفایل من', page: 'profile' }
      ];
    }
  };

  return (
    <>
      {/* هدر اصلی (بالای صفحه) */}
      <header className="glass-card sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* لوگو - در موبایل و دسکتاپ */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
              <img
                src={logoImg}
                alt="لوگو میزبان"
                className="w-12 h-10 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-xl md:text-2xl font-black text-primary">میزبان</span>
            </div>

            {/* منوی اصلی - فقط دسکتاپ (md:flex) */}
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => onNavigate('home')} className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${currentPage === 'home' ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-light hover:text-primary'}`}>خانه</button>
              <button onClick={() => onNavigate('experiences')} className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${currentPage === 'experiences' ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-light hover:text-primary'}`}>تجربه‌ها</button>
              <button onClick={() => onNavigate('articles')} className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${currentPage === 'articles' || currentPage === 'write-article' || currentPage === 'article-detail' ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-light hover:text-primary'}`}>بلاگ</button>
              <button onClick={() => onNavigate('travel-stories')} className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${currentPage === 'travel-stories' || currentPage === 'write-story' ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-light hover:text-primary'}`}>داستان‌ها</button>
              <button onClick={() => onNavigate('about')} className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${currentPage === 'about' ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-light hover:text-primary'}`}>درباره ما</button>
            </nav>

            {/* بخش کاربری - فقط دسکتاپ (md:flex) */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => onNavigate('favorites')}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${currentPage === 'favorites' ? 'bg-complementary/10 text-complementary' : 'text-dark/60 hover:bg-complementary/10 hover:text-complementary'}`}
                title="علاقه‌مندی‌ها"
              >
                <Heart className={`w-5 h-5 transition-colors ${currentPage === 'favorites' ? 'fill-complementary text-complementary' : ''}`} />
              </button>

              {!isLoggedIn ? (
                <>
                  <button onClick={() => onNavigate('provider-signup')} className="px-5 py-2.5 bg-white text-primary border-2 border-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-all hover:shadow-lg hover:scale-105 active:scale-95">میزبان شو</button>
                  <button onClick={() => onNavigate('login')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-105 active:scale-95 shadow-md shadow-primary/30">ورود/ثبت نام</button>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-light transition-colors font-bold text-dark/80">
                    <User className="w-4 h-4" />
                    {userName}
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury-lg border border-gray-100 overflow-hidden animate-slide-up">
                      <div className="p-4 border-b border-gray-100 bg-light/50">
                        <p className="text-xs text-dark/60 mb-1">خوش‌آمدید</p>
                        <p className="font-bold text-dark">{userName}</p>
                      </div>
                      <div className="py-2">
                        {getMenuItems().map((item) => (
                          <button key={item.page} onClick={() => { onNavigate(item.page); setUserMenuOpen(false); }} className="w-full text-right px-4 py-3 text-sm font-bold text-dark/80 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2">
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-right px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>خروج</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* نوار ناوبری پایین (موبایل) - مخفی در دسکتاپ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
 pb-safe">
        <div className="flex justify-between items-center px-6 py-2 pb-4">

          <button onClick={() => onNavigate('home')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 scale-110' : 'text-dark/40 hover:text-dark/70'}`}>
            <Home className="w-6 h-6" />
          </button>

          <button onClick={() => onNavigate('experiences')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${currentPage === 'experiences' ? 'text-primary bg-primary/10 scale-110' : 'text-dark/40 hover:text-dark/70'}`}>
            <Search className="w-6 h-6" />
          </button>

          <button onClick={() => onNavigate('articles')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${['articles', 'travel-stories'].includes(currentPage) ? 'text-primary bg-primary/10 scale-110' : 'text-dark/40 hover:text-dark/70'}`}>
            <Calendar className="w-6 h-6" />
          </button>

          <button onClick={() => onNavigate('favorites')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${currentPage === 'favorites' ? 'text-complementary bg-complementary/10 scale-110' : 'text-dark/40 hover:text-dark/70'}`}>
            <Heart className="w-6 h-6" />
          </button>

          <button onClick={() => onNavigate(isLoggedIn ? 'profile' : 'login')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${['profile', 'login', 'admin-dashboard', 'tourist-dashboard', 'provider-dashboard'].includes(currentPage) ? 'text-primary bg-primary/10 scale-110' : 'text-dark/40 hover:text-dark/70'}`}>
            <User className="w-6 h-6" />
          </button>

        </div>
      </nav>
    </>
  );
}
