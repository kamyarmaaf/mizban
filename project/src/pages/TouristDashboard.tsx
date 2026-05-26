import { useEffect, useState } from 'react';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

interface BookingItem {
  id: number;
  status: 'pending' | 'paid' | 'failed';
  experience_title: string;
  experience_date: string;
  experience_price: number;
  experience_image: string | null;
  created_at: string;
}

export default function TouristDashboard() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    // بک‌اند الان status = pending/paid/failed میده
    // تو UI می‌خوایم معادل confirmed/pending/completed داشته باشیم
    let uiStatus: 'confirmed' | 'pending' | 'completed' = 'pending';

    if (status === 'paid') uiStatus = 'confirmed';
    else if (status === 'pending') uiStatus = 'pending';
    else if (status === 'failed') uiStatus = 'completed'; // یا هرچی دوست داری برای نمایش

    const styles = {
      confirmed: 'bg-primary/10 text-primary',
      pending: 'bg-secondary/10 text-secondary',
      completed: 'bg-dark/10 text-dark/70',
    };
    const labels = {
      confirmed: 'تایید شده',
      pending: 'در انتظار',
      completed: 'تکمیل شده',
    };

    return (
      <span
        className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
          styles[uiStatus as keyof typeof styles]
        }`}
      >
        {labels[uiStatus as keyof typeof labels]}
      </span>
    );
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/bookings/my/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: BookingItem[] = await response.json();

          // درست کردن URL عکس مثل FavoritesPage
          const normalized = data.map((b) => {
            const rawImage = b.experience_image;

            const finalImageUrl = rawImage
              ? rawImage.startsWith('http')
                ? rawImage
                : `http://127.0.0.1:8000${rawImage}`
              : ''; // اگر خواستی placeholder بزار

            return {
              ...b,
              experience_image: finalImageUrl,
            };
          });

          setBookings(normalized);
        } else {
          console.error('Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status !== 'failed').length; // یا هر شرطی
  const completedBookings = bookings.filter((b) => b.status === 'failed').length; // اگر بعداً فیلد جدا داشتی اصلاح کن

  if (loading) {
    return (
      <div className="min-h-screen bg-light font-sans flex flex-col">
        <div className="bg-primary py-12 rounded-b-3xl shadow-soft mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-3">
              رزروهای من
            </h1>
            <p className="text-white/80 text-center text-sm md:text-base font-medium">
              تجربه‌های رزرو شده خود را مشاهده کنید
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-light border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-dark/50 font-bold text-lg">در حال بارگذاری رزروها...</p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light font-sans flex flex-col">
      {/* هدر */}
      <div className="bg-primary py-12 rounded-b-3xl shadow-soft mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-3">
            رزروهای من
          </h1>
          <p className="text-white/80 text-center text-sm md:text-base font-medium">
            تجربه‌های رزرو شده خود را مشاهده کنید
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-dark/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/60 font-bold text-sm">کل رزروها</h3>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-black text-dark">{totalBookings}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-dark/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/60 font-bold text-sm">رزروهای فعال</h3>
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-black text-dark">{activeBookings}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-dark/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/60 font-bold text-sm">تجربه‌های کامل شده</h3>
              <div className="w-10 h-10 rounded-2xl bg-complementary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-complementary" />
              </div>
            </div>
            <p className="text-3xl font-black text-dark">{completedBookings}</p>
          </div>
        </div>

        {/* لیست رزروها */}
        <div className="bg-white rounded-3xl shadow-soft border border-dark/5 overflow-hidden">
          <div className="p-6 border-b border-dark/5 bg-dark/[0.02]">
            <h2 className="text-xl font-black text-dark">لیست رزروها</h2>
          </div>

          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-10 text-dark/60 font-medium">
                هنوز رزروی ثبت نکرده‌اید.
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-dark/10 rounded-3xl overflow-hidden hover:shadow-soft transition-all duration-300 bg-light/30"
                  >
                    <div className="flex flex-col md:flex-row">
                      <img
                        src={
                          booking.experience_image ||
                          'https://via.placeholder.com/400x300?text=No+Image'
                        }
                        alt={booking.experience_title}
                        className="w-full md:w-56 h-56 md:h-auto object-cover"
                      />
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-black text-xl mb-3 text-dark">
                              {booking.experience_title}
                            </h3>
                            <div className="flex items-center gap-2 text-dark/60">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">
                                تاریخ: {booking.experience_date}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-dark/10 mt-auto">
                          <span className="text-2xl font-black text-primary">
                            {Number(booking.experience_price).toLocaleString('fa-IR')}{' '}
                            <span className="text-sm font-bold text-dark/50">تومان</span>
                          </span>
                          <button
                            disabled
                            className="px-6 py-2.5 bg-dark/10 text-dark/40 rounded-2xl text-sm font-bold cursor-not-allowed"
                          >
                            مشاهده جزئیات
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
