import { useState, useEffect } from 'react';
import { Plus, Calendar, User, TrendingUp, Edit3, Trash2 } from 'lucide-react';
import { mockProviderBookings } from '../mockData';
import Footer from '../components/Footer';

type Props = {
  onNavigate: (page: string, id?: string) => void;
};

interface Experience {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  image: string;
  status: string;
}

export default function ProviderDashboard({ onNavigate }: Props) {
  const [myExperiences, setMyExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // =======================================================
  // وضعیت تجربه (draft, pending, approved, rejected)
  // =======================================================
  const getExperienceStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-dark/70 backdrop-blur-sm",
      pending: "bg-secondary",
      approved: "bg-primary",
      rejected: "bg-complementary",
    };

    const labels = {
      draft: "پیش‌نویس",
      pending: "در انتظار تایید",
      approved: "تایید شده",
      rejected: "رد شده",
    };

    return (
      <span
        className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-medium text-white rounded-full shadow-md ${
          styles[status as keyof typeof styles] || "bg-dark/50"
        }`}
      >
        {labels[status as keyof typeof labels] || "نامشخص"}
      </span>
    );
  };

  // ========================================================
  // گرفتن تجربه‌های میزبان
  // ========================================================
  useEffect(() => {
    const fetchMyExperiences = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/experiences/me/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const experiencesArray = Array.isArray(data) ? data : (data.results || []);

          const formattedExperiences = experiencesArray.map((exp: any) => {
            const rawImageUrl =
              exp.images?.find((img: any) => img.is_cover)?.image ||
              exp.images?.[0]?.image;

            const finalImageUrl = rawImageUrl
              ? (rawImageUrl.startsWith('http') ? rawImageUrl : `http://127.0.0.1:8000${rawImageUrl}`)
              : 'https://via.placeholder.com/400x300?text=بدون+تصویر';

            return {
              ...exp,
              image: finalImageUrl,
            };
          });

          setMyExperiences(formattedExperiences);
        } else {
          console.error('خطا در دریافت اطلاعات از بک‌اند');
        }
      } catch (error) {
        console.error('خطای شبکه:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyExperiences();
  }, []);

  // ========================================================
  // Badge رزروها
  // ========================================================
  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-primary/10 text-primary border border-primary/20',
      pending: 'bg-secondary/10 text-secondary border border-secondary/20',
      completed: 'bg-dark/10 text-dark border border-dark/20'
    };

    const labels = {
      confirmed: 'تایید شده',
      pending: 'در انتظار',
      completed: 'تکمیل شده'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // ========================================================
  // حذف تجربه
  // ========================================================
  const handleDeleteExperience = async (id: number) => {
    const confirmDelete = window.confirm("آیا از حذف این تجربه مطمئن هستید؟");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/experiences/${id}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setMyExperiences((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "خطا در حذف تجربه");
      }
    } catch (err) {
      console.error(err);
      alert("خطای شبکه");
    }
  };

  // ========================================================
  // UI
  // ========================================================
  return (
    <div className="min-h-screen bg-light">

      {/* Header */}
      <div className="bg-primary py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">داشبورد میزبان</h1>
          <p className="text-white/80 text-lg">تجربه‌ها و رزروهای خود را مدیریت کنید</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 -mt-8 relative z-20">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-light hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/70 font-medium">کل تجربه‌ها</h3>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark">{isLoading ? '...' : myExperiences.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-light hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/70 font-medium">رزروهای فعال</h3>
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark">
              {mockProviderBookings.filter(b => b.status !== 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-light hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/70 font-medium">کل مهمان‌ها</h3>
              <div className="p-3 bg-complementary/10 rounded-2xl">
                <User className="w-6 h-6 text-complementary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark">{mockProviderBookings.length}</p>
          </div>
        </div>

        {/* My Experiences */}
        <div className="bg-white rounded-3xl shadow-soft border border-light overflow-hidden mb-10">
          <div className="p-6 border-b border-light flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50">
            <h2 className="text-xl font-bold text-dark">تجربه‌های من</h2>

            <button
              onClick={() => onNavigate("write-experience")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-5 h-5" />
              افزودن تجربه
            </button>
          </div>

          <div className="p-6 bg-light/30">
            {isLoading ? (
              <div className="text-center py-12 text-dark/50 font-medium animate-pulse">در حال دریافت اطلاعات...</div>
            ) : myExperiences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark/60 font-medium mb-4">شما هنوز تجربه‌ای ثبت نکرده‌اید.</p>
                <button
                  onClick={() => onNavigate("write-experience")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors"
                >
                  اولین تجربه خود را بسازید
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto py-2 -mx-6 px-6 hide-scrollbar">
                <div className="flex space-x-6 min-w-max pb-4">

                  {myExperiences.map((experience) => (
                    <div
                      key={experience.id}
                      className="group relative min-w-[280px] max-w-[300px] bg-white border border-light rounded-2xl overflow-hidden shadow-sm hover:shadow-soft transition-all duration-300 flex flex-col"
                    >

                      {/* عکس + Badge وضعیت */}
                      <div className="relative w-full h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-dark/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img
                          src={experience.image}
                          alt={experience.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="z-20 relative">
                          {getExperienceStatusBadge(experience.status)}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-dark mb-2 line-clamp-1">{experience.title}</h3>

                        <p className="text-dark/60 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
                          {experience.description}
                        </p>

                        <div className="flex items-center justify-between mb-5 pt-4 border-t border-light/50">
                          <span className="text-lg font-bold text-primary">
                            {Number(experience.price).toLocaleString("fa-IR")} <span className="text-xs text-dark/50 font-normal">تومان</span>
                          </span>
                          <span className="text-sm font-medium text-dark/60 bg-light px-2 py-1 rounded-md">
                            {experience.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-auto">
                          <button
                            onClick={() =>
                              onNavigate("edit-experience", experience.id.toString())
                            }
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-complementary rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            ویرایش
                          </button>

                          <button
                            onClick={() => handleDeleteExperience(experience.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings table */}
        <div className="bg-white rounded-3xl shadow-soft border border-light overflow-hidden">
          <div className="p-6 border-b border-light bg-white/50">
            <h2 className="text-xl font-bold text-dark">رزروهای اخیر</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-light/50 border-b border-light">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-dark/70">تجربه</th>
                  <th className="px-6 py-5 text-sm font-bold text-dark/70">مهمان</th>
                  <th className="px-6 py-5 text-sm font-bold text-dark/70">تاریخ</th>
                  <th className="px-6 py-5 text-sm font-bold text-dark/70">قیمت</th>
                  <th className="px-6 py-5 text-sm font-bold text-dark/70">وضعیت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light/50">
                {mockProviderBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-light/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.experienceImage}
                          className="w-14 h-14 rounded-xl object-cover shadow-sm"
                          alt="تایم‌نیل تجربه"
                        />
                        <span className="font-bold text-dark">{booking.experienceTitle}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-dark/80">{booking.guestName}</td>
                    <td className="px-6 py-4 text-dark/60 text-sm">{booking.date}</td>

                    <td className="px-6 py-4 font-bold text-dark">
                      {booking.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-dark/50">تومان</span>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
