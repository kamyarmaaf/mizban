import { Calendar, MapPin } from 'lucide-react';
import { mockTouristBookings } from '../mockData';
import Footer from '../components/Footer';

export default function TouristDashboard() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
            رزروهای من
          </h1>
          <p className="text-emerald-50 text-center">
            تجربه‌های رزرو شده خود را مشاهده کنید
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">کل رزروها</h3>
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockTouristBookings.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">رزروهای فعال</h3>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {mockTouristBookings.filter(b => b.status !== 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">تجربه‌های کامل شده</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {mockTouristBookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">لیست رزروها</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {mockTouristBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={booking.experienceImage}
                      alt={booking.experienceTitle}
                      className="w-full md:w-48 h-48 object-cover"
                    />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-2">{booking.experienceTitle}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">تاریخ: {booking.date}</span>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-2xl font-bold text-gray-900">
                          {booking.price.toLocaleString('fa-IR')} تومان
                        </span>
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium cursor-not-allowed"
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
