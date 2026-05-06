import { useState, useEffect } from 'react';
import { Plus, Calendar, User, TrendingUp } from 'lucide-react';
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
      draft: "bg-gray-600",
      pending: "bg-yellow-500",
      approved: "bg-green-600",
      rejected: "bg-red-600",
    };

    const labels = {
      draft: "پیش‌نویس",
      pending: "در انتظار تایید",
      approved: "تایید شده",
      rejected: "رد شده",
    };

    return (
      <span
        className={`absolute top-2 right-2 px-3 py-1 text-xs text-white rounded-full shadow-md ${
          styles[status as keyof typeof styles] || "bg-gray-500"
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
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      confirmed: 'تایید شده',
      pending: 'در انتظار',
      completed: 'تکمیل شده'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
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
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-emerald-600 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">داشبورد میزبان</h1>
          <p className="text-emerald-50">تجربه‌ها و رزروهای خود را مدیریت کنید</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">کل تجربه‌ها</h3>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? '...' : myExperiences.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">رزروهای فعال</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {mockProviderBookings.filter(b => b.status !== 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">کل مهمان‌ها</h3>
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockProviderBookings.length}</p>
          </div>
        </div>

        {/* My Experiences */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">تجربه‌های من</h2>

            <button
              onClick={() => onNavigate("write-experience")}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              افزودن تجربه
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">در حال دریافت اطلاعات...</div>
            ) : myExperiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">شما هنوز تجربه‌ای ثبت نکرده‌اید.</div>
            ) : (
              <div className="overflow-x-auto py-4 -mx-6 px-6">
                <div className="flex space-x-4 min-w-max">

                  {myExperiences.map((experience) => (
                    <div
                      key={experience.id}
                      className="relative min-w-[250px] max-w-xs border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                    >

                      {/* عکس + Badge وضعیت */}
                      <div className="relative w-full h-48">
                        <img
                          src={experience.image}
                          alt={experience.title}
                          className="w-full h-full object-cover"
                        />

                        {getExperienceStatusBadge(experience.status)}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{experience.title}</h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {experience.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-gray-900">
                            {Number(experience.price).toLocaleString("fa-IR")} تومان
                          </span>
                          <span className="text-sm text-gray-500">
                            {experience.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              onNavigate("edit-experience", experience.id.toString())
                            }
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          >
                            ویرایش
                          </button>

                          <button
                            onClick={() => handleDeleteExperience(experience.id)}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">رزروهای اخیر</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">تجربه</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">مهمان</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">تاریخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">قیمت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">وضعیت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {mockProviderBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.experienceImage}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium">{booking.experienceTitle}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">{booking.guestName}</td>
                    <td className="px-6 py-4 text-gray-600">{booking.date}</td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.price.toLocaleString('fa-IR')} تومان
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
