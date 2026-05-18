import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { mockTouristBookings } from '../mockData';
import Footer from '../components/Footer';

export default function TouristDashboard() {
  const getStatusBadge = (status: string) => {
    // تغییر رنگ‌بندی بج‌ها بر اساس پالت جدید
    const styles = {
      confirmed: 'bg-primary/10 text-primary',
      pending: 'bg-secondary/10 text-secondary',
      completed: 'bg-dark/10 text-dark/70'
    };
    const labels = {
      confirmed: 'تایید شده',
      pending: 'در انتظار',
      completed: 'تکمیل شده'
    };
    return (
      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
            <p className="text-3xl font-black text-dark">{mockTouristBookings.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-dark/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/60 font-bold text-sm">رزروهای فعال</h3>
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-black text-dark">
              {mockTouristBookings.filter(b => b.status !== 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-dark/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark/60 font-bold text-sm">تجربه‌های کامل شده</h3>
              <div className="w-10 h-10 rounded-2xl bg-complementary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-complementary" />
              </div>
            </div>
            <p className="text-3xl font-black text-dark">
              {mockTouristBookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* لیست رزروها */}
        <div className="bg-white rounded-3xl shadow-soft border border-dark/5 overflow-hidden">
          <div className="p-6 border-b border-dark/5 bg-dark/[0.02]">
            <h2 className="text-xl font-black text-dark">لیست رزروها</h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {mockTouristBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-dark/10 rounded-3xl overflow-hidden hover:shadow-soft transition-all duration-300 bg-light/30"
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={booking.experienceImage}
                      alt={booking.experienceTitle}
                      className="w-full md:w-56 h-56 md:h-auto object-cover"
                    />
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-black text-xl mb-3 text-dark">{booking.experienceTitle}</h3>
                          <div className="flex items-center gap-2 text-dark/60">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">تاریخ: {booking.date}</span>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-dark/10 mt-auto">
                        <span className="text-2xl font-black text-primary">
                          {booking.price.toLocaleString('fa-IR')} <span className="text-sm font-bold text-dark/50">تومان</span>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
