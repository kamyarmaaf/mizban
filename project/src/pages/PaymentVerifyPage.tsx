import { useEffect, useState } from 'react';

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
            const response = await fetch(`http://your-api-url/api/bookings/verify-payment/?authority=${authority}`);
            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            setStatus('failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            {status === 'loading' && <p>در حال بررسی وضعیت پرداخت...</p>}
            {status === 'success' && (
                <div className="text-center text-green-600">
                    <h2>پرداخت با موفقیت انجام شد!</h2>
                    <button onClick={() => onNavigate('tourist-dashboard')} className="mt-4 btn-primary">مشاهده رزروها</button>
                </div>
            )}
            {status === 'failed' && (
                <div className="text-center text-red-600">
                    <h2>پرداخت ناموفق بود یا لغو شد.</h2>
                    <button onClick={() => onNavigate('home')} className="mt-4 btn-secondary">بازگشت به صفحه اصلی</button>
                </div>
            )}
        </div>
    );
};

export default PaymentVerifyPage;
