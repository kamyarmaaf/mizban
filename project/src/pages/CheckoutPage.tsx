import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

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
      setError('');
      // ارسال درخواست به بک‌اند
      const response = await fetch('http://your-api-url/api/bookings/request-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          experience: data.experienceId,
          guests: data.guests,
          total_price: totalPrice, // <--- Corrected this from data.totalPrice
          callback_url: 'http://localhost:5173/#payment-verify'
        }),
      });

      const result = await response.json();

      if (response.ok && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setError(result.detail || 'خطا در اتصال به درگاه پرداخت. لطفا دوباره تلاش کنید.');
      }
    } catch (error) {
      setError('یک خطای پیش‌بینی‌نشده رخ داد. لطفا اتصال اینترنت خود را بررسی کنید.');
      console.error('Payment request failed', error);
    } finally {
      setLoading(false);
    }
  };

  // اگر پرداخت موفق بود
  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 flex items-center justify-center bg-light">
        <div className="bg-white p-8 rounded-3xl shadow-luxury-lg text-center max-w-md w-full border border-dark/10">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">رزرو با موفقیت انجام شد!</h2>
          <p className="text-dark/60 mb-8">منتظر دیدار شما در این تجربه هستیم.</p>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3 bg-dark text-white rounded-xl font-bold hover:bg-dark/90 transition-colors"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  // در صورتی که دیتایی نیامده باشد
  if (!data) {
    return (
      <div className="min-h-screen pt-32 text-center text-dark/70 bg-light">
        در حال بارگذاری اطلاعات رزرو...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('experienceDetail', { id: data.experienceId })}
          className="mb-6 flex items-center gap-2 text-dark/60 hover:text-dark transition font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به صفحه تجربه
        </button>

        <div className="bg-white rounded-3xl shadow-luxury-lg border border-dark/10 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-dark/10">
            <h1 className="text-2xl font-black text-dark mb-1">تایید و پرداخت</h1>
            <p className="text-dark/60">لطفا اطلاعات رزرو خود را برای تایید نهایی بررسی کنید.</p>

          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-dark mb-4">{data.experienceTitle}</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-dark/5">
                <span className="text-dark/60">تاریخ:</span>
                <span className="font-medium text-dark">{new Date(data.date).toLocaleDateString('fa-IR')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-dark/5">
                <span className="text-dark/60">ساعت:</span>
                <span className="font-medium text-dark">{data.time}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-dark/5">
                <span className="text-dark/60">تعداد نفرات:</span>
                <span className="font-medium text-dark">{data.guests} نفر</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-dark/5">
                <span className="text-dark/60">قیمت هر نفر:</span>
                <span className="font-medium text-dark">{data.price > 0 ? data.price.toLocaleString('fa-IR') + ' تومان' : 'رایگان'}</span>
              </div>
            </div>

            <div className="bg-light p-6 rounded-2xl flex justify-between items-center mb-8 border border-dark/10">
              <span className="text-lg font-bold text-dark">مبلغ قابل پرداخت:</span>
              <span className="text-2xl font-black text-primary">
                {totalPrice > 0 ? totalPrice.toLocaleString('fa-IR') + ' تومان' : 'رایگان'}
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-complementary/10 text-complementary rounded-xl text-sm border border-complementary/20 font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all bg-gradient-to-r from-primary to-primary/80 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:translate-y-0"
            >
              {loading ? 'در حال پردازش...' : 'تایید نهایی و پرداخت'}
            </button>
            <p className="text-center text-dark/40 text-xs mt-4">
              با کلیک روی دکمه بالا، قوانین و مقررات سایت را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
