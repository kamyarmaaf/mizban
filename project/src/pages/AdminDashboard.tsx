import { useState, useEffect } from 'react';
import {
  Users, CheckCircle, XCircle, Calendar, TrendingUp,
  MessageSquare, Eye, Trash2, UserCheck, UserX, Filter,
  Search, BarChart3, Settings, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PendingProvider {
  id: string | number;
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  hostingType: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface PendingExperience {
  id: string | number;
  title: string;
  description: string;
  city: string;
  category: string;
  price: number;
  providerName: string;
  image: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface User {
  id: string | number;
  fullName: string;
  phone: string;
  email: string;
  role: 'tourist' | 'provider' | 'admin';
  createdAt: Date;
  status: 'active' | 'suspended';
}

interface Comment {
  id: string | number;
  experienceTitle: string;
  userName: string;
  comment: string;
  createdAt: Date;
  reported: boolean;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'experiences' | 'users' | 'comments'>('overview');

  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [pendingExperiences, setPendingExperiences] = useState<PendingExperience[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PendingProvider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedExperience, setSelectedExperience] = useState<any | null>(null);
  const [experienceDetail, setExperienceDetail] = useState<any | null>(null);


  const API_BASE_URL = 'http://localhost:8000/api/accounts';
  const EXPERIENCE_API_BASE_URL = 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token'); // مطابق بک‌اند شما کلید access است
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    if (user && (profile?.user_type === 'admin' || profile?.role === 'admin' || user.is_superuser)) {
      fetchDashboardData();
      fetchAdminExperiences();
      fetchAdminComments();
    }
  }, [user, profile]);


    const fetchExperienceDetail = async (id: number | string) => {
  try {
    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/allexperiences/${id}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("error fetching experience");

    const data = await response.json();

    setExperienceDetail(data);
    setSelectedExperience(id);

  } catch (error) {
    console.error(error);
  }
};



    const fetchAdminExperiences = async () => {
  try {
    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/admin-api/experiences/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const resultsArray = data.results ? data.results : data;

    const formattedData = resultsArray.map((item: any) => ({
      id: item.id,
      title: item.title || 'بدون عنوان',
      description: item.description || '',
      city: item.city || 'نامشخص',
      category: item.category || 'نامشخص',
      price: item.price || 0,
      providerName: item.host_name || 'نامشخص',

      // تغییر اصلی در این قسمت است:
      image: item.images?.find((img: any) => img.is_cover)?.image ||
             item.images?.[0]?.image ||
             'https://via.placeholder.com/150',

      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      status: item.status || 'pending',
    }));

    setPendingExperiences(formattedData);
  } catch (error) {
    console.error("خطا در دریافت تجربه‌ها:", error);
  }
};



  // ۲. تابع دریافت کامنت‌ها از بک‌اند
  const fetchAdminComments = async () => {
  try {
    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/admin-api/comments/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    // این خط را اضافه یا اصلاح کنید:
    const resultsArray = data.results ? data.results : data;

    const formattedData = resultsArray.map((item: any) => ({
      id: item.id,
      experienceTitle: item.experience_title || 'تجربه',
      userName: item.user_name || 'کاربر', // کلید صحیح
      comment: item.text || '', // کلید صحیح
      createdAt: item.created_at ? new Date(item.created_at) : new Date(), // کلید صحیح
      reported: item.reported || false // کلید صحیح
    }));

    setComments(formattedData);
  } catch (error) {
    console.error("خطا در دریافت نظرات:", error);
  }
};

  // ۳. آپدیت تابع تغییر وضعیت تجربه (تایید/رد)
  const handleExperienceAction = async (experienceId: string | number, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const response = await fetch(`${EXPERIENCE_API_BASE_URL}/admin-api/experiences/${experienceId}/status/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setPendingExperiences(prev => prev.map(e => e.id === experienceId ? { ...e, status: newStatus } : e));
        alert(`تجربه با موفقیت ${action === 'approve' ? 'تایید' : 'رد'} شد!`);
      } else {
        alert('خطا در تغییر وضعیت تجربه');
      }
    } catch (error) {
      console.error(error);
      alert('خطا در ارتباط با سرور.');
    }
  };

  // ۴. آپدیت تابع حذف کامنت
  const handleDeleteComment = async (commentId: string | number) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${EXPERIENCE_API_BASE_URL}/admin-api/comments/${commentId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        alert('نظر با موفقیت حذف شد!');
      } else {
        alert('خطا در حذف نظر');
      }
    } catch (error) {
      console.error(error);
      alert('خطا در ارتباط با سرور.');
    }
  };


  // دریافت کاربران و میزبان‌ها از بک‌اند
  const fetchDashboardData = async () => {
    try {
      const mizbanRes = await fetch(`${API_BASE_URL}/mizban-users/`, { headers: getAuthHeaders() });
      if (mizbanRes.ok) {
        const mizbanData = await mizbanRes.json();
        const formattedProviders: PendingProvider[] = mizbanData.map((m: any) => ({
          id: m.id,
          fullName: m.name || m.username,
          phone: m.phone,
          email: m.email || '',
          province: m.province || '',
          city: m.city || '',
          hostingType: m.hosting_type || 'نامشخص',
          createdAt: new Date(m.date_joined || Date.now()),
          status: m.status || 'pending'
        }));
        setPendingProviders(formattedProviders);

        const providerUsers: User[] = mizbanData.map((m: any) => ({
          id: `m_${m.id}`,
          fullName: m.name || m.username,
          phone: m.phone,
          email: m.email || '',
          role: 'provider',
          createdAt: new Date(m.date_joined || Date.now()),
          status: m.status === 'active' ? 'active' : 'suspended'
        }));
        setUsers(prev => [...prev.filter(u => u.role !== 'provider'), ...providerUsers]);
      }

      const visitorRes = await fetch(`${API_BASE_URL}/visitor-users/`, { headers: getAuthHeaders() });
      if (visitorRes.ok) {
        const visitorData = await visitorRes.json();
        const touristUsers: User[] = visitorData.map((v: any) => ({
          id: `v_${v.id}`,
          fullName: v.name || v.username,
          phone: v.phone,
          email: v.email || '',
          role: 'tourist',
          createdAt: new Date(v.date_joined || Date.now()),
          status: 'active'
        }));
        setUsers(prev => [...prev.filter(u => u.role !== 'tourist'), ...touristUsers]);
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات کاربران:', error);
    }
  };

  // لود کردن دیتای تستی برای بخش‌هایی که هنوز API ندارند
  const loadMockExperiencesAndComments = () => {
    const mockPendingExperiences: PendingExperience[] = [
      { id: 'e1', title: 'تور شبانه در باغ ارم شیراز', description: 'یک شب رویایی در باغ تاریخی ارم', city: 'شیراز', category: 'گردشگری فرهنگی', price: 350000, providerName: 'علی کریمی', image: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg', createdAt: new Date('2024-01-16'), status: 'pending' },
      { id: 'e2', title: 'کارگاه سفالگری سنتی', description: 'یاد بگیرید سفال‌های زیبا بسازید', city: 'همدان', category: 'عکاسی و هنر', price: 280000, providerName: 'زهرا محمدی', image: 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg', createdAt: new Date('2024-01-19'), status: 'pending' }
    ];

    const mockComments: Comment[] = [
      { id: 'c1', experienceTitle: 'تور غذاهای محلی شیراز', userName: 'علی محمدی', comment: 'تجربه عالی بود! واقعا از غذاهای محلی لذت بردم.', createdAt: new Date('2024-01-17'), reported: false },
      { id: 'c2', experienceTitle: 'پیاده‌روی در طبیعت دربند', userName: 'مریم رضایی', comment: 'مسیر خیلی سخت بود و راهنما تجربه کافی نداشت.', createdAt: new Date('2024-01-18'), reported: true }
    ];

    const savedExperiences = localStorage.getItem('adminPendingExperiences');
    const savedComments = localStorage.getItem('adminComments');

    setPendingExperiences(savedExperiences ? JSON.parse(savedExperiences) : mockPendingExperiences);
    setComments(savedComments ? JSON.parse(savedComments) : mockComments);
  };

    const handleProviderAction = async (id, action, rejectReason = '') => {
    try {
      let method = action === 'delete' ? 'DELETE' : 'PATCH';
      let bodyData = null;
      let newStatus = 'pending'; // <--- این خط اضافه شد

      if (action === 'approve') {
        bodyData = JSON.stringify({ status: 'approved' });
        newStatus = 'approved'; // <--- این خط اضافه شد
      } else if (action === 'reject') {
        bodyData = JSON.stringify({ status: 'rejected', reject_reason: rejectReason });
        newStatus = 'rejected'; // <--- این خط اضافه شد
      }

      const response = await fetch(`http://localhost:8000/api/accounts/admin/mizban-users/${id}/`, {
        method: method,
        headers: getAuthHeaders(),
        body: bodyData,
      });

      if (response.ok) {
        // اصلاح این خط: استفاده از id و newStatus
        setPendingProviders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        alert(`میزبان با موفقیت ${action === 'approve' ? 'تایید' : 'رد'} شد!`);
      } else {
        // برای اینکه بفهمید دقیقا چه خطایی از بک‌اند آمده است:
        console.error("Server returned status:", response.status);
        alert('خطا در سمت سرور. آیا دسترسی ادمین دارید یا API را ساخته‌اید؟');
      }
    } catch (error) {
      console.error(error);
      alert('خطا در ارتباط با سرور.');
    }
  };




  const handleUserAction = async (userId: string | number, action: 'suspend' | 'activate' | 'delete') => {
    const stringId = String(userId);
    const actualId = stringId.split('_')[1];
    const type = stringId.startsWith('m_') ? 'mizban' : 'visitor';
    const endpoint = type === 'mizban' ? 'mizban-user' : 'visitor-user';

    if (action === 'delete') {
      if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
      try {
        const response = await fetch(`http://localhost:8000/api/accounts/admin/visitor-users/${actualId}/`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          if (type === 'mizban') setPendingProviders(prev => prev.filter(p => p.id !== Number(actualId)));
          alert('کاربر با موفقیت حذف شد!');
        } else {
          alert('خطا در حذف کاربر از سرور');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // تعلیق یا فعالسازی (نیاز به API در بک‌اند)
      alert('برای تعلیق/فعال‌سازی باید API مربوطه در بک‌اند ساخته شود.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user || (!profile?.is_superuser && profile?.user_type !== 'admin' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-red-500/10 text-center max-w-md w-full">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">دسترسی غیرمجاز</h1>
          <p className="text-gray-600 leading-relaxed">متاسفانه شما مجوز لازم برای مشاهده پنل مدیریت را ندارید. این بخش مختص مدیران سیستم است.</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeProviders = users.filter(u => u.role === 'provider' && u.status === 'active').length;
  const pendingProvidersCount = pendingProviders.filter(p => p.status === 'pending').length;
  const pendingExperiencesCount = pendingExperiences.filter(e => e.status === 'pending').length;
  const reportedCommentsCount = comments.filter(c => c.reported).length;

  const filteredProviders = pendingProviders.filter(p => {
    const matchesSearch = p.fullName.includes(searchTerm) || p.phone.includes(searchTerm) || p.email.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredExperiences = pendingExperiences.filter(e => {
    const matchesSearch = e.title.includes(searchTerm) || e.providerName.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (

    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 pb-24 pt-12 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-sm">
                داشبورد مدیریت
              </h1>
              <p className="text-white/80 font-medium text-sm md:text-base">مرکز کنترل و مدیریت جامع سیستم میزبان</p>
            </div>
            <button className="w-14 h-14 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Settings className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {[
            { title: 'کل کاربران', count: totalUsers, icon: Users, color: 'blue', desc: 'ثبت نام شده' },
            { title: 'میزبان‌های فعال', count: activeProviders, icon: UserCheck, color: 'emerald', desc: 'تایید شده' },
            { title: 'میزبان‌های منتظر', count: pendingProvidersCount, icon: Calendar, color: 'orange', desc: 'نیاز به بررسی' },
            { title: 'تجربه‌های منتظر', count: pendingExperiencesCount, icon: TrendingUp, color: 'violet', desc: 'نیاز به تایید' },
            { title: 'نظرات گزارش شده', count: reportedCommentsCount, icon: MessageSquare, color: 'rose', desc: 'نیاز به بررسی' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-50`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </div>
              <p className="text-3xl font-black text-gray-800 mb-1">{stat.count}</p>
              <h3 className="text-sm font-bold text-gray-500">{stat.title}</h3>
              <p className={`text-xs font-medium text-${stat.color}-500 mt-2`}>{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-2 mb-8 border border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x">
            {[
              { id: 'overview', icon: BarChart3, label: 'خلاصه' },
              { id: 'providers', icon: UserCheck, label: `میزبان‌ها (${pendingProvidersCount})` },
              { id: 'experiences', icon: TrendingUp, label: `تجربه‌ها (${pendingExperiencesCount})` },
              { id: 'users', icon: Users, label: `کاربران (${totalUsers})` },
              { id: 'comments', icon: MessageSquare, label: `نظرات (${reportedCommentsCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`snap-center flex-shrink-0 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/25'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {selectedExperience && experienceDetail && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">

      <h2 className="text-2xl font-black mb-4">
        {experienceDetail.title}
      </h2>

      <img
        src={experienceDetail.images?.[0]?.image}
        className="w-full h-64 object-cover rounded-2xl mb-4"
      />

      <div className="space-y-2 text-gray-700">

        <p><strong>میزبان:</strong> {experienceDetail.provider_name}</p>

        <p><strong>شهر:</strong> {experienceDetail.city}</p>

        <p><strong>استان:</strong> {experienceDetail.province}</p>

        <p><strong>قیمت:</strong> {experienceDetail.price} تومان</p>

        <p><strong>ظرفیت:</strong> {experienceDetail.capacity}</p>

        <p><strong>مدت:</strong> {experienceDetail.duration}</p>

        <p><strong>امتیاز:</strong> ⭐ {experienceDetail.rating}</p>

        <p><strong>آدرس:</strong> {experienceDetail.address}</p>

        <p className="mt-4">
          <strong>توضیحات:</strong>
        </p>

        <p className="text-gray-600 leading-relaxed">
          {experienceDetail.description}
        </p>

      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            setSelectedExperience(null);
            setExperienceDetail(null);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-xl"
        >
          بستن
        </button>
      </div>

    </div>
  </div>
)}



        {selectedProvider && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-lg">
      <h2 className="text-2xl font-black text-gray-800 mb-4">
        اطلاعات میزبان
      </h2>

      <div className="space-y-3">
        <p><strong>نام:</strong> {selectedProvider.fullName}</p>
        <p><strong>شماره:</strong> {selectedProvider.phone}</p>
        <p><strong>ایمیل:</strong> {selectedProvider.email}</p>
        <p><strong>استان:</strong> {selectedProvider.province}</p>
        <p><strong>شهر:</strong> {selectedProvider.city}</p>
        <p><strong>نوع میزبانی:</strong> {selectedProvider.hostingType}</p>
        <p><strong>تاریخ عضویت:</strong> {formatDate(selectedProvider.createdAt)}</p>
        <p><strong>وضعیت:</strong> {selectedProvider.status}</p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setSelectedProvider(null)}
          className="px-4 py-2 bg-red-500 text-white rounded-xl"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
)}


        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
                فعالیت‌های اخیر
              </h3>
              <div className="space-y-4">
                {pendingProviders.slice(0, 3).map(provider => (
                  <div key={provider.id} className="group flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{provider.fullName}</p>
                      <p className="text-sm text-gray-500">درخواست میزبانی جدید</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">{formatDate(provider.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-fuchsia-500 rounded-full"></div>
                آمار سریع
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600">میزبان‌های تایید شده</span>
                    <span className="text-sm font-black text-emerald-500">
                      {pendingProviders.length > 0 ? Math.round((pendingProviders.filter(p => p.status === 'approved').length / pendingProviders.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pendingProviders.length > 0 ? (pendingProviders.filter(p => p.status === 'approved').length / pendingProviders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600">تجربه‌های تایید شده</span>
                    <span className="text-sm font-black text-violet-500">
                      {pendingExperiences.length > 0 ? Math.round((pendingExperiences.filter(e => e.status === 'approved').length / pendingExperiences.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-400 to-fuchsia-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pendingExperiences.length > 0 ? (pendingExperiences.filter(e => e.status === 'approved').length / pendingExperiences.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <h2 className="text-2xl font-black text-gray-800">مدیریت میزبان‌ها</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="جستجو..." className="w-full pr-12 pl-4 py-3 bg-white border-none shadow-inner rounded-2xl focus:ring-2 focus:ring-violet-400 text-right outline-none transition-all" />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-3 bg-white border-none shadow-inner rounded-2xl focus:ring-2 focus:ring-violet-400 text-right font-medium outline-none text-gray-600 cursor-pointer">
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="pending">در انتظار</option>
                    <option value="approved">تایید شده</option>
                    <option value="rejected">رد شده</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center">
                            <UserCheck className="w-7 h-7 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-800">{provider.fullName}</h3>
                            <p className="text-sm text-gray-500 mt-1" dir="ltr">{provider.phone}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${provider.status === 'pending' ? 'bg-orange-50 text-orange-600' : provider.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {provider.status === 'pending' ? 'در انتظار' : provider.status === 'approved' ? 'تایید' : 'رد'}
                        </span>
                      </div>
                      {provider.status === 'pending' && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => handleProviderAction(provider.id, 'approve')} className="flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2">تایید</button>
                          <button onClick={() => handleProviderAction(provider.id, 'reject')} className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2">رد</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 font-bold text-lg">موردی یافت نشد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-800">مدیریت تجربه‌ها</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExperiences.map((exp) => (
                  <div
                      key={exp.id}
                      onClick={() => fetchExperienceDetail(exp.id)}
                      className="flex flex-col md:flex-row gap-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-xl transition"
                    >

                    <img src={exp.image} alt={exp.title} className="w-full md:w-32 h-32 object-cover rounded-2xl" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-gray-800">{exp.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{exp.providerName} - {exp.city}</p>
                      </div>
                      {exp.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handleExperienceAction(exp.id, 'approve')} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-sm font-bold transition-all">تایید</button>
                          <button onClick={() => handleExperienceAction(exp.id, 'reject')} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-all">رد</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-800">لیست کاربران سیستم</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-5 text-sm font-black text-gray-600">کاربر</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600">تلفن/ایمیل</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600">نقش</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">{user.fullName.charAt(0)}</div>
                          <span className="font-bold text-gray-800">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" dir="ltr">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{user.role === 'provider' ? 'میزبان' : 'گردشگر'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleUserAction(user.id, 'delete')} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-800">مدیریت نظرات</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{comment.userName} <span className="text-sm font-normal text-gray-500">در {comment.experienceTitle}</span></p>
                      <p className="text-gray-600 mt-2">{comment.comment}</p>
                      {comment.reported && <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded">گزارش شده</span>}
                    </div>
                    <button onClick={() => handleDeleteComment(comment.id)} className="p-2 bg-white text-red-500 rounded-xl shadow hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
