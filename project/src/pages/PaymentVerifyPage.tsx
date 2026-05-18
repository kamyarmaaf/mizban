import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentVerifyPage = ({ onNavigate }: any) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    useEffect(() => {
        // خواندن پارامترهایی که درگاه به URL اضافه کرده (مثل Authority و Status در زرین‌پال)
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const authority = params.get('Authority');
        const paymentStatus = params.get('Status'); // OK یا NOK

        if (paymentStatus === 'OK' && authority) {
            verifyPayment(authority);
        } else {
            setStatus('failed');
        }
    }, []);

    const verifyPayment = async (authority: string) => {
        try {
            // آدرس API خود را اینجا جایگزین کنید
            const response = await fetch(`http://127.0.0.1:8000/api/bookings/verify-payment/?authority=${authority}`);
            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            setStatus('failed');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader className="h-16 w-16 animate-spin text-primary" />
                        <h2 className="mt-6 text-2xl font-bold text-dark">در حال بررسی پرداخت</h2>
                        <p className="mt-2 text-dark/70">لطفاً کمی صبر کنید، در حال تایید تراکنش شما هستیم...</p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-600" />
                        <h2 className="mt-6 text-2xl font-bold text-dark">پرداخت موفقیت‌آمیز بود!</h2>
                        <p className="mt-2 text-dark/70">تراکنش شما با موفقیت ثبت شد. می‌توانید جزئیات آن را در داشبورد خود مشاهده کنید.</p>
                        <button
                            onClick={() => onNavigate('tourist-dashboard')}
                            className="mt-8 w-full rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30"
                        >
                            مشاهده رزروها
                        </button>
                    </>
                );
            case 'failed':
                return (
                    <>
                        <XCircle className="h-16 w-16 text-complementary" />
                        <h2 className="mt-6 text-2xl font-bold text-dark">پرداخت ناموفق بود</h2>
                        <p className="mt-2 text-dark/70">متاسفانه در فرآیند پرداخت مشکلی پیش آمد یا تراکنش توسط شما لغو شد.</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="mt-8 w-full rounded-lg bg-dark/20 px-6 py-3 text-lg font-semibold text-dark/80 shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-dark/20"
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    </>
                );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-light p-4">
            <div className="w-full max-w-md rounded-xl border border-dark/5 bg-white p-8 text-center shadow-soft flex flex-col items-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentVerifyPage;
