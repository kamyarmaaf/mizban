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
  const [activeTab, setActiveTab] = useState<'providers' | 'experiences' | 'users' | 'comments'>('providers');

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
    const token = localStorage.getItem('access_token');
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

  const fetchAdminComments = async () => {
    try {
      const response = await fetch(`${EXPERIENCE_API_BASE_URL}/admin-api/comments/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const resultsArray = data.results ? data.results : data;

      const formattedData = resultsArray.map((item: any) => ({
        id: item.id,
        experienceTitle: item.experience_title || 'تجربه',
        userName: item.user_name || 'کاربر',
        comment: item.text || '',
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        reported: item.reported || false
      }));

      setComments(formattedData);
    } catch (error) {
      console.error("خطا در دریافت نظرات:", error);
    }
  };

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

  const handleProviderAction = async (id: any, action: any, rejectReason = '') => {
    try {
      let method = action === 'delete' ? 'DELETE' : 'PATCH';
      let bodyData = null;
      let newStatus = 'pending';

      if (action === 'approve') {
        bodyData = JSON.stringify({ status: 'approved' });
        newStatus = 'approved';
      } else if (action === 'reject') {
        bodyData = JSON.stringify({ status: 'rejected', reject_reason: rejectReason });
        newStatus = 'rejected';
      }

      const response = await fetch(`http://localhost:8000/api/accounts/admin/mizban-users/${id}/`, {
        method: method,
        headers: getAuthHeaders(),
        body: bodyData,
      });

      if (response.ok) {
        setPendingProviders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
        alert(`میزبان با موفقیت ${action === 'approve' ? 'تایید' : 'رد'} شد!`);
      } else {
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
      alert('برای تعلیق/فعال‌سازی باید API مربوطه در بک‌اند ساخته شود.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ----------------------------------------------------
  // Unauthorised View
  // ----------------------------------------------------
  if (!user || (!profile?.is_superuser && profile?.user_type !== 'admin' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-light text-center max-w-md w-full">
          <div className="w-24 h-24 bg-complementary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-12 h-12 text-complementary" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-3">دسترسی غیرمجاز</h1>
          <p className="text-dark/70 leading-relaxed">متاسفانه شما مجوز لازم برای مشاهده پنل مدیریت را ندارید. این بخش مختص مدیران سیستم است.</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Derived state calculations
  // ----------------------------------------------------
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
    <div className="min-h-screen bg-light pb-12 font-sans">

      {/* Header */}
      <div className="bg-primary pb-24 pt-12 rounded-b-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {[
            { title: 'کل کاربران', count: totalUsers, icon: Users, colorClass: 'text-primary bg-primary/10' },
            { title: 'میزبان‌های فعال', count: activeProviders, icon: UserCheck, colorClass: 'text-secondary bg-secondary/10' },
            { title: 'میزبان‌های منتظر', count: pendingProvidersCount, icon: Calendar, colorClass: 'text-dark bg-dark/10' },
            { title: 'تجربه‌های منتظر', count: pendingExperiencesCount, icon: TrendingUp, colorClass: 'text-primary bg-primary/10' },
            { title: 'نظرات گزارش شده', count: reportedCommentsCount, icon: MessageSquare, colorClass: 'text-complementary bg-complementary/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow-soft hover:-translate-y-1 transition-transform duration-300 border border-light">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.colorClass.split(' ')[1]}`}>
                  <stat.icon className={`w-5 h-5 ${stat.colorClass.split(' ')[0]}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-dark mb-1">{stat.count}</p>
              <h3 className="text-sm font-medium text-dark/60">{stat.title}</h3>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-soft p-2 mb-8 border border-light">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x">
            {[
              { id: 'providers', icon: UserCheck, label: `میزبان‌ها (${pendingProvidersCount})` },
              { id: 'experiences', icon: TrendingUp, label: `تجربه‌ها (${pendingExperiencesCount})` },
              { id: 'users', icon: Users, label: `کاربران (${totalUsers})` },
              { id: 'comments', icon: MessageSquare, label: `نظرات (${reportedCommentsCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`snap-center flex-shrink-0 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-dark/60 hover:bg-light hover:text-dark'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-dark/50'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modals */}
        {selectedExperience && experienceDetail && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-soft overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold text-dark mb-4">{experienceDetail.title}</h2>
              <img
                src={experienceDetail.images?.[0]?.image}
                className="w-full h-64 object-cover rounded-2xl mb-4 border border-light"
                alt="تجربه"
              />
              <div className="space-y-2 text-dark/80 bg-light/30 p-4 rounded-2xl">
                <p><strong>میزبان:</strong> {experienceDetail.provider_name}</p>
                <p><strong>شهر / استان:</strong> {experienceDetail.city} / {experienceDetail.province}</p>
                <p><strong>قیمت:</strong> {experienceDetail.price} تومان</p>
                <p><strong>ظرفیت:</strong> {experienceDetail.capacity}</p>
                <p><strong>مدت:</strong> {experienceDetail.duration}</p>
                <p><strong>امتیاز:</strong> ⭐ {experienceDetail.rating}</p>
                <p><strong>آدرس:</strong> {experienceDetail.address}</p>
                <p className="mt-4 border-t border-light pt-2"><strong>توضیحات:</strong></p>
                <p className="text-dark/70 leading-relaxed text-sm">{experienceDetail.description}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { setSelectedExperience(null); setExperienceDetail(null); }}
                  className="px-6 py-2.5 bg-dark text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedProvider && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-soft w-full max-w-lg">
              <h2 className="text-2xl font-bold text-dark mb-4">اطلاعات میزبان</h2>
              <div className="space-y-3 text-dark/80 bg-light/30 p-4 rounded-2xl">
                <p><strong>نام:</strong> {selectedProvider.fullName}</p>
                <p><strong>شماره:</strong> {selectedProvider.phone}</p>
                <p><strong>ایمیل:</strong> {selectedProvider.email || 'ندارد'}</p>
                <p><strong>استان / شهر:</strong> {selectedProvider.province} / {selectedProvider.city}</p>
                <p><strong>نوع میزبانی:</strong> {selectedProvider.hostingType}</p>
                <p><strong>تاریخ عضویت:</strong> {formatDate(selectedProvider.createdAt)}</p>
                <p><strong>وضعیت:</strong> {selectedProvider.status}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="px-6 py-2.5 bg-dark text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-light">
            <div className="p-6 md:p-8 border-b border-light bg-light/30">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <h2 className="text-2xl font-bold text-dark">مدیریت میزبان‌ها</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="جستجو..." className="w-full pr-12 pl-4 py-3 bg-white border border-light shadow-sm rounded-2xl focus:ring-2 focus:ring-primary text-right outline-none transition-all" />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-3 bg-white border border-light shadow-sm rounded-2xl focus:ring-2 focus:ring-primary text-right font-medium outline-none text-dark/70 cursor-pointer">
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
                      className="bg-white border border-light rounded-3xl p-6 shadow-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <UserCheck className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-dark">{provider.fullName}</h3>
                            <p className="text-sm text-dark/60 mt-1" dir="ltr">{provider.phone}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          provider.status === 'pending' ? 'bg-dark/10 text-dark' :
                          provider.status === 'approved' ? 'bg-secondary/10 text-secondary' :
                          'bg-complementary/10 text-complementary'
                        }`}>
                          {provider.status === 'pending' ? 'در انتظار' : provider.status === 'approved' ? 'تایید' : 'رد'}
                        </span>
                      </div>
                      {provider.status === 'pending' && (
                        <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleProviderAction(provider.id, 'approve')} className="flex-1 py-2.5 bg-primary text-white hover:opacity-90 rounded-xl font-bold transition-opacity flex justify-center items-center gap-2">تایید</button>
                          <button onClick={() => handleProviderAction(provider.id, 'reject')} className="flex-1 py-2.5 bg-complementary text-white hover:opacity-90 rounded-xl font-bold transition-opacity flex justify-center items-center gap-2">رد</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-light/50 rounded-3xl border border-light">
                    <p className="text-dark/60 font-bold text-lg">موردی یافت نشد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-light">
            <div className="p-6 border-b border-light bg-light/30">
              <h2 className="text-2xl font-bold text-dark">مدیریت تجربه‌ها</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExperiences.map((exp) => (
                  <div
                      key={exp.id}
                      onClick={() => fetchExperienceDetail(exp.id)}
                      className="flex flex-col md:flex-row gap-4 bg-white border border-light rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-soft hover:-translate-y-1 transition-all"
                    >
                    <img src={exp.image} alt={exp.title} className="w-full md:w-32 h-32 object-cover rounded-2xl" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-dark line-clamp-1">{exp.title}</h3>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            exp.status === 'pending' ? 'bg-dark/10 text-dark' :
                            exp.status === 'approved' ? 'bg-primary/80 text-complementary' :
                            'bg-red-600 text-white'
                          }`}>
                            {exp.status === 'pending' ? 'در انتظار' : exp.status === 'approved' ? 'تایید شده' : 'رد شده'}
                          </span>
                        </div>
                        <p className="text-sm text-dark/60 mt-1">{exp.providerName} - {exp.city}</p>
                      </div>
                      {exp.status === 'pending' && (
                        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleExperienceAction(exp.id, 'approve')} className="px-4 py-2 bg-primary text-complementary hover:opacity-90 rounded-xl text-sm font-bold transition-opacity">تایید</button>
                          <button onClick={() => handleExperienceAction(exp.id, 'reject')} className="px-4 py-2 bg-red-600 text-white hover:opacity-90 rounded-xl text-sm font-bold transition-opacity">رد</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredExperiences.length === 0 && (
                  <div className="col-span-full text-center py-16 bg-light/50 rounded-3xl border border-light">
                    <p className="text-dark/60 font-bold text-lg">موردی یافت نشد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-light">
             <div className="p-6 border-b border-light bg-light/30">
              <h2 className="text-2xl font-bold text-dark">لیست کاربران سیستم</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-light/50 border-b border-light">
                  <tr>
                    <th className="px-6 py-5 text-sm font-bold text-dark/70">کاربر</th>
                    <th className="px-6 py-5 text-sm font-bold text-dark/70">تلفن/ایمیل</th>
                    <th className="px-6 py-5 text-sm font-bold text-dark/70">نقش</th>
                    <th className="px-6 py-5 text-sm font-bold text-dark/70">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-light/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">{user.fullName.charAt(0)}</div>
                          <span className="font-bold text-dark">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-dark/80" dir="ltr">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-light text-dark/70 rounded-lg text-xs font-bold">{user.role === 'provider' ? 'میزبان' : 'گردشگر'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleUserAction(user.id, 'delete')} className="p-2 bg-complementary/10 text-complementary rounded-xl hover:bg-complementary hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-dark/50">کاربری یافت نشد</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-light">
             <div className="p-6 border-b border-light bg-light/30">
              <h2 className="text-2xl font-bold text-dark">مدیریت نظرات</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-light/30 border border-light rounded-2xl p-4 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-dark">{comment.userName} <span className="text-sm font-medium text-dark/50 px-2">در {comment.experienceTitle}</span></p>
                      <p className="text-dark/70 mt-2 text-sm leading-relaxed">{comment.comment}</p>
                      {comment.reported && <span className="inline-block mt-2 px-2 py-1 bg-complementary/10 text-complementary text-xs rounded font-medium">گزارش شده</span>}
                    </div>
                    <button onClick={() => handleDeleteComment(comment.id)} className="p-2 bg-white text-complementary rounded-xl shadow-sm hover:bg-complementary hover:text-white transition-colors border border-light">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-10 text-dark/50">نظری برای نمایش وجود ندارد</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
