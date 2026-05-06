import { useState, useEffect } from 'react';
import {
  User, MapPin, Calendar, Building2, Globe, Star, Activity, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import Footer from '../components/Footer';

interface MizbanPublicProfileProps {
  mizbanId: string;
  onNavigate: (page: string, params?: any) => void;
}

export default function MizbanPublicProfilePage({ mizbanId, onNavigate }: MizbanPublicProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [recentExperiences, setRecentExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mizbanId) {
      loadMizbanData();
    }
  }, [mizbanId]);

  const loadMizbanData = async () => {
    setLoading(true);
    try {
      // 1. دریافت اطلاعات پروفایل میزبان (آدرس API را با بک‌اند خود تنظیم کنید)
      const profileRes = await fetch(`http://127.0.0.1:8000/api/accounts/mizban-user/${mizbanId}/`);
      if (profileRes.ok) {
          const profileData = await profileRes.json();

          // ساخت آدرس کامل برای آواتار
          const avatarUrl = profileData.avatar && !profileData.avatar.startsWith('http')
            ? `http://127.0.0.1:8000${profileData.avatar}`
            : profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.id}`;

          setProfile({
            ...profileData,
            avatar: avatarUrl, // استفاده از آدرس کامل شده
            created_at: profileData.date_joined || profileData.created_at
          });
        }

      // 2. دریافت 5 تجربه آخر میزبان
      // فرض می‌کنیم در API لیست تجربه‌ها امکان فیلتر با mizban_id وجود دارد
      const expRes = await fetch(`http://127.0.0.1:8000/api/experiences/?mizban=${mizbanId}&limit=5`);
      if (expRes.ok) {
        const expData = await expRes.json();
        // اگر API دیتای pagination برمی‌گرداند (مثلا expData.results) آن را تنظیم کنید
        const experiences = expData.results || expData;
        setRecentExperiences(experiences.slice(0, 5));
      }
    } catch (err) {
      console.error("Error loading mizban data", err);
    }
    setLoading(false);
  };

  const getExperienceText = (createdAt: string): string => {
    if (!createdAt) return 'نامشخص';
    const startDate = new Date(createdAt);
    const diff = new Date().getTime() - startDate.getTime();
    const fullYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    if (fullYears < 1) return 'کمتر از یک سال';
    return fullYears === 1 ? 'بیشتر از یک سال' : `بیشتر از ${fullYears} سال`;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">در حال بارگذاری اطلاعات میزبان...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* هدر صفحه */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pt-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-black text-white tracking-tight">پروفایل میزبان</h1>
          <button onClick={() => onNavigate('home')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-sm transition-all flex items-center gap-2 border border-white/20">
            <ArrowRight className="w-5 h-5" /> بازگشت
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* سایدبار اطلاعات پایه */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-50 to-teal-50"></div>
              <div className="relative inline-block mt-4 mb-4">
                <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover mx-auto bg-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-emerald-600 text-sm font-medium mt-2">
                <Building2 className="w-4 h-4" /> میزبان تایید شده
              </div>

              {profile.bio && (
                <p className="mt-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* اطلاعات تماس و سکونت */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">اطلاعات بیشتر</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{profile.province || 'استان نامشخص'}، {profile.city || 'شهر نامشخص'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>عضویت: <span dir="ltr">{new Date(profile.created_at).toLocaleDateString('fa-IR')}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* محتوای اصلی */}
          <div className="lg:col-span-2 space-y-6">
            {/* کارت اطلاعات میزبانی */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-emerald-50/50">
                <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <Globe className="w-5 h-5" /> جزئیات فعالیت میزبان
                </h3>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">نوع فعالیت</label>
                  <div className="flex items-center gap-3 text-slate-800 font-medium py-2">
                    <Building2 className="w-5 h-5 text-emerald-500/70" />
                    {profile.hosting_type || 'ثبت نشده'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">سال‌های تجربه</label>
                  <div className="flex items-center gap-3 text-slate-800 font-medium py-2">
                    <Calendar className="w-5 h-5 text-emerald-500/70" />
                    <span>{getExperienceText(profile.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* لیست 5 تجربه آخر */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" /> آخرین میزبانی‌ها
                </h3>
              </div>
              <div className="p-6">
                {recentExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {recentExperiences.map((exp: any) => {
                      // استخراج عکس کاور مشابه صفحه Home
                      const coverImg = exp.images?.find((img: any) => img.is_cover)?.image || exp.images?.[0]?.image;
                      const imageUrl = coverImg && !coverImg.startsWith('http') ? `http://127.0.0.1:8000${coverImg}` : coverImg;

                      return (
                        <div key={exp.id} onClick={() => onNavigate('experience-detail', exp.id)} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30">
                          {imageUrl ? (
                            <img src={imageUrl} alt={exp.title} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8"/></div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 mb-1">{exp.title}</h4>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {exp.city},{exp.province} </span>
                              <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /> {exp.rating || 'جدید'}</span>
                            </div>
                          </div>
                          <div className="text-emerald-600">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>هنوز تجربه‌ای توسط این میزبان ثبت نشده است.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
