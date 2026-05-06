import React, { useState } from 'react';

// تایپ داده‌های رزرو که از صفحه قبل پاس داده شده است
interface BookingData {
  experienceId: number;
  experienceTitle: string;
  price: number;
  guests: number;
  date: string;
  time: string;
}

interface CheckoutPageProps {
  data: BookingData;
  user: any; // اطلاعات کاربر لاگین شده
  onNavigate: (page: string, data?: any) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ data, user, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalPrice = (data?.price || 0) * (data?.guests || 1);

  const handleConfirmBooking = async () => {
    try {
        setLoading(true);
        // ارسال درخواست به بک‌اند برای ایجاد رزرو موقت و دریافت لینک درگاه
        const response = await fetch('http://your-api-url/api/bookings/request-payment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                experience: data.experienceId,
                guests: data.guests,
                total_price: data.totalPrice,
                // آدرسی که کاربر بعد از پرداخت باید به آن برگردد
                callback_url: 'http://localhost:5173/#payment-verify'
            }),
        });

        const result = await response.json();

        if (response.ok && result.payment_url) {
            // انتقال کاربر به درگاه پرداخت
            window.location.href = result.payment_url;
        } else {
            alert('خطا در اتصال به درگاه پرداخت');
        }
    } catch (error) {
        console.error('Payment request failed', error);
    } finally {
        setLoading(false);
    }
};

  // اگر پرداخت موفق بود
  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">رزرو با موفقیت انجام شد!</h2>
          <p className="text-gray-500 mb-8">منتظر دیدار شما در این تجربه هستیم.</p>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  // در صورتی که دیتایی نیامده باشد
  if (!data) return <div className="pt-32 text-center">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('experienceDetail', { id: data.experienceId })}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به تجربه
        </button>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 mb-2">تایید و پرداخت</h1>
            <p className="text-gray-500">لطفا اطلاعات رزرو خود را بررسی کنید.</p>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{data.experienceTitle}</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">تاریخ:</span>
                <span className="font-medium">{new Date(data.date).toLocaleDateString('fa-IR')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">ساعت:</span>
                <span className="font-medium">{data.time}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">تعداد نفرات:</span>
                <span className="font-medium">{data.guests} نفر</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">قیمت هر نفر:</span>
                <span className="font-medium">{data.price > 0 ? data.price.toLocaleString('fa-IR') + ' تومان' : 'رایگان'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center mb-8 border border-gray-100">
              <span className="text-lg font-bold text-gray-800">مبلغ قابل پرداخت:</span>
              <span className="text-2xl font-black text-emerald-600">
                {totalPrice > 0 ? totalPrice.toLocaleString('fa-IR') + ' تومان' : 'رایگان'}
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'در حال پردازش...' : 'تایید نهایی و پرداخت'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-4">
              با کلیک روی دکمه بالا، قوانین و مقررات سایت را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
