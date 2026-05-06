import { useState, useEffect, useRef  } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Heart, AlertCircle, CheckCircle, LogOut, Building2, Globe, Briefcase, Star, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  user_type: 'visitor' | 'mizban';
  created_at: string;
  city?: string;
  province?: string;
}

interface ProviderProfile extends UserProfile {
  hostingType?: string;
  hosting_type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  approvalReason?: string;
}

// اینترفیس جدید برای آماری که از بک‌اند می‌گیریم
interface ProviderStats {
  approved_experiences_count: number;
  average_rating: number;
  total_ratings_count: number;
}

export default function ProfilePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, profile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | ProviderProfile | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // State جدید برای آمار میزبان
  const [providerStats, setProviderStats] = useState<ProviderStats>({
    approved_experiences_count: 0,
    average_rating: 0,
    total_ratings_count: 0
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // هر وقت پروفایل لود شد و فهمیدیم طرف میزبان است، آمارش را هم می‌گیریم
  useEffect(() => {
    if (userProfile?.user_type === 'mizban') {
      loadProviderStats();
    }
  }, [userProfile?.user_type]);

  const loadUserProfile = async () => {
    if (!user) return;

    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      const profileData = {
        ...data,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`
      };
      setUserProfile(profileData);
      setFormData(profileData);
    }

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/accounts/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      const profileData = {
        ...data,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`
      };
      setUserProfile(profileData);
      setFormData(profileData);
      localStorage.setItem("user_profile", JSON.stringify(data));
    } catch (err) {
      console.error("Profile load error", err);
    }
  };

  // تابع جدید برای دریافت آمار
  const loadProviderStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/profile/stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProviderStats(data);
      }
    } catch (err) {
      console.error("Stats load error", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file); // ذخیره فایل برای ارسال به بک‌اند
      setFormData({ ...formData, avatar: URL.createObjectURL(file) }); // ایجاد URL موقت برای پیش‌نمایش
    }
  };

  const getExperienceText = (createdAt: string): string => {
    if (!createdAt) return 'نامشخص';
    const startDate = new Date(createdAt);
    const today = new Date();
    const diffMilliseconds = today.getTime() - startDate.getTime();
    const years = diffMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const fullYears = Math.floor(years);

    if (fullYears < 1) return 'کمتر از یک سال';
    return fullYears === 1 ? 'بیشتر از یک سال' : `بیشتر از ${fullYears} سال`;
  };

  const handleSaveProfile = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const submitData = new FormData();

      if (formData.name) submitData.append("name", formData.name);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.city) submitData.append("city", formData.city);
      if (formData.province) submitData.append("province", formData.province);
      if (formData.bio) submitData.append("bio", formData.bio);
      if (formData.hosting_type) submitData.append("hosting_type", formData.hosting_type);

      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      const res = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
          // نکته: Content-Type را نباید اینجا بنویسیم تا مرورگر خودش boundary را ست کند
        },
        body: submitData
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        setFormData(data);
        localStorage.setItem("user_profile", JSON.stringify(data));
        setIsEditing(false);
        setAvatarFile(null); // ریست کردن فایل پس از ذخیره موفق
      }
    } catch (err) {
      console.error("Save error", err);
    }
    setIsSaving(false);
  };




  const handleLogout = async () => {
    if (confirm('آیا از خروج اطمینان دارید؟')) {
      await signOut();
      onNavigate('home');
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">در حال بارگذاری پروفایل...</p>
        </div>
      </div>
    );
  }

  const isTourist = userProfile.user_type === 'visitor';
  const isProvider = userProfile.user_type === 'mizban';
  const provider = userProfile as ProviderProfile;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* هدر صفحه */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pt-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-black text-white tracking-tight">پروفایل کاربری</h1>
          <button onClick={handleLogout} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-sm transition-all flex items-center gap-2 border border-white/20">
            <LogOut className="w-5 h-5" /> خروج
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        {/* پیام‌های وضعیت میزبان */}
        {isProvider && (
          <div className="mb-6 space-y-4">
            {provider.status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900">درخواست در حال بررسی</h3>
                  <p className="text-amber-700 text-sm mt-1">تیم پشتیبانی در حال بررسی مدارک شماست. این فرآیند ممکن است ۲۴ تا ۴۸ ساعت زمان ببرد.</p>
                </div>
              </div>
            )}
            {provider.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <X className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">درخواست رد شد</h3>
                  <p className="text-red-700 text-sm mt-1 mb-3">{provider.approvalReason || 'متاسفانه درخواست میزبانی شما تایید نشد.'}</p>
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 text-sm transition-colors">تماس با پشتیبانی</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* سایدبار */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-50 to-teal-50"></div>
              <div className="relative inline-block mt-4 mb-4">
                <img src={isEditing ? formData.avatar : userProfile.avatar} alt={userProfile.name} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover mx-auto bg-white" />
                {isEditing && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-transform hover:scale-105 shadow-lg border-2 border-white">
                      <Camera className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-sm font-medium mt-2">
                {isTourist ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                {isTourist ? 'گردشگر' : 'میزبان'}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button onClick={() => setIsEditing(!isEditing)} className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isEditing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                  {isEditing ? <><X className="w-5 h-5" /> انصراف از ویرایش</> : <><Edit3 className="w-5 h-5" /> ویرایش پروفایل</>}
                </button>
              </div>
            </div>
          </div>

          {/* محتوای اصلی */}
          <div className="lg:col-span-2 space-y-6">
            {/* کارت اطلاعات پایه */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> اطلاعات هویتی و تماس
                </h3>
                {isEditing && (
                  <button onClick={handleSaveProfile} disabled={isSaving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                    <Save className="w-4 h-4" /> {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                )}
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { label: 'نام و نام خانوادگی', icon: User, key: 'name', type: 'text' },
                    { label: 'ایمیل', icon: Mail, key: 'email', type: 'email' },
                    { label: 'شماره تلفن', icon: Phone, key: 'phone', type: 'tel' },
                    { label: 'استان', icon: MapPin, key: 'province', type: 'text' },
                    { label: 'شهر', icon: MapPin, key: 'city', type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-500 mb-1.5">{field.label}</label>
                      {isEditing ? (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition-all outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-3 text-slate-800 font-medium py-2.5">
                          <field.icon className="w-5 h-5 text-slate-400" />
                          {userProfile[field.key as keyof UserProfile] || <span className="text-slate-400 text-sm font-normal">ثبت نشده</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1.5">تاریخ عضویت</label>
                    <div className="flex items-center gap-3 text-slate-800 font-medium py-2.5">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span dir="ltr">{new Date(userProfile.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* کارت اطلاعات میزبانی */}
            {isProvider && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                  <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> اطلاعات میزبانی
                  </h3>
                  {provider.status === 'approved' && (
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> تایید شده
                    </span>
                  )}
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1.5">نوع فعالیت</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.hosting_type || formData.hostingType || ''}
                        onChange={(e) => setFormData({ ...formData, hosting_type: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-3 text-slate-800 font-medium py-2">
                        <Globe className="w-5 h-5 text-emerald-500/70" />
                        {provider.hosting_type || provider.hostingType || 'ثبت نشده'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1.5">سال‌های تجربه</label>
                    <div className="flex items-center gap-3 text-slate-800 font-medium py-2">
                      <Calendar className="w-5 h-5 text-emerald-500/70" />
                      <span>{getExperienceText(provider.created_at)}</span>
                    </div>
                  </div>
                  {/* جایگذاری مقادیر جدید برای امتیاز و تعداد تجربه‌ها */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1.5">میانگین امتیاز</label>
                    <div className="flex items-center gap-2 text-slate-800 font-medium py-2">
                      <Star className="w-5 h-5 text-amber-400 fill-current" />
                      {providerStats.average_rating > 0
                        ? `${providerStats.average_rating} (از ${providerStats.total_ratings_count} رای)`
                        : 'بدون امتیاز'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1.5">تجربه‌های تایید شده</label>
                    <div className="flex items-center gap-3 text-slate-800 font-medium py-2">
                      <Activity className="w-5 h-5 text-emerald-500/70" />
                      {providerStats.approved_experiences_count} تجربه
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* کارت فعالیت‌ها و علاقه‌مندی‌ها */}
            {/* ... بقیه کد بدون تغییر ... */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" /> آمار و فعالیت‌ها
                </h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                    <p className="text-3xl font-black text-teal-600 mb-1">42</p>
                    <p className="text-sm font-medium text-teal-800">بازدیدها</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                    <p className="text-3xl font-black text-rose-600 mb-1">8</p>
                    <p className="text-sm font-medium text-rose-800">ذخیره شده</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center col-span-2 md:col-span-1">
                    <p className="text-3xl font-black text-indigo-600 mb-1">3</p>
                    <p className="text-sm font-medium text-indigo-800">رزرو فعال</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
