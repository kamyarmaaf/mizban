import { Menu, X, User, Home, ChevronDown, LogOut, Heart, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/images/logo.png';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    }
    else if (userRole === 'mizban') {
      return [
        { label: 'داشبورد میزبان', page: 'provider-dashboard' },
        { label: 'پروفایل من', page: 'profile' }
      ];
    }
    else {
      return [
        { label: 'رزروهای من', page: 'tourist-dashboard' },
        { label: 'پروفایل من', page: 'profile' }
      ];
    }
  };

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            {/* عکس لوگوی شما */}
            <img
              src={logoImg}
              alt="لوگو میزبان"
              className="w-14 h-11 object-contain group-hover:scale-110 transition-transform"
            />
            {/* اگر می‌خواهید متن "میزبان" کنار لوگو بماند، این خط را نگه دارید. در غیر این صورت آن را پاک کنید */}
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">میزبان</span>
          </div>


          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                currentPage === 'home'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              خانه
            </button>
            <button
              onClick={() => onNavigate('experiences')}
              className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                currentPage === 'experiences'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              تجربه‌ها
            </button>
            <button
              onClick={() => onNavigate('articles')}
              className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                currentPage === 'articles' || currentPage === 'write-article' || currentPage === 'article-detail'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              بلاگ
            </button>
            <button
              onClick={() => onNavigate('travel-stories')}
              className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                currentPage === 'travel-stories' || currentPage === 'write-story'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              داستان‌ها
            </button>
            {/* اضافه شدن دکمه درباره ما برای دسکتاپ */}
            <button
              onClick={() => onNavigate('about')}
              className={`px-5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                currentPage === 'about'
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              درباره ما
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* دکمه علاقه‌مندی‌ها برای دسکتاپ */}
            <button
              onClick={() => onNavigate('favorites')}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                currentPage === 'favorites'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-gray-500 hover:bg-rose-50 hover:text-rose-500'
              }`}
              title="علاقه‌مندی‌ها"
            >
              <Heart className={`w-5 h-5 ${currentPage === 'favorites' ? 'fill-rose-600' : ''}`} />
            </button>

            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate('provider-signup')}
                  className="px-5 py-2 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  میزبان شو
                </button>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    ورود/ثبت نام
                  </button>
                </div>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700"
                >
                  <User className="w-4 h-4" />
                  {userName}
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">خوش‌آمدید</p>
                      <p className="font-bold text-gray-900">{userName}</p>
                    </div>

                    <div className="py-2">
                      {getMenuItems().map((item) => (
                        <button
                          key={item.page}
                          onClick={() => {
                            onNavigate(item.page);
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-right px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2"
                        >
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentPage === 'home' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              خانه
            </button>
            <button
              onClick={() => {
                onNavigate('experiences');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentPage === 'experiences' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              تجربه‌ها
            </button>
            <button
              onClick={() => {
                onNavigate('articles');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentPage === 'articles' || currentPage === 'write-article' || currentPage === 'article-detail' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              بلاگ
            </button>
            <button
              onClick={() => {
                onNavigate('travel-stories');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentPage === 'travel-stories' || currentPage === 'write-story' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              داستان‌ها
            </button>

            {/* اضافه شدن دکمه درباره ما برای موبایل */}
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentPage === 'about' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              درباره ما
            </button>

            {/* دکمه علاقه‌مندی‌ها برای موبایل */}
            <button
              onClick={() => {
                onNavigate('favorites');
                setMobileMenuOpen(false);
              }}
              className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                currentPage === 'favorites' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${currentPage === 'favorites' ? 'fill-rose-600' : ''}`} />
              علاقه‌مندی‌ها
            </button>

            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('provider-signup');
                    setMobileMenuOpen(false);
                  }}
                  className="text-right px-4 py-3 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl text-sm font-bold"
                >
                  میزبان شو
                </button>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-right px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold"
                >
                  ورود/ثبت نام
                </button>
              </>
            ) : (
              <>
                {getMenuItems().map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className="text-right px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-right px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  خروج
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
