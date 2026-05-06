// src/components/Footer.tsx
import React from 'react';
import { Phone, Mail, MapPin, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* ستون اول: درباره میزبان */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6">
              میزبان
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              پلتفرمی برای اتصال مسافران به تجربه‌های محلی و منحصربه‌فرد.
              با میزبان‌های واقعی ملاقات کنید و سفر متفاوتی را در کنار مردم بومی تجربه کنید.
            </p>
            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-emerald-400 hover:text-white transition-all duration-300">
                <Instagram size={20} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-emerald-400 hover:text-white transition-all duration-300">
                <Twitter size={20} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-emerald-400 hover:text-white transition-all duration-300">
                <Linkedin size={20} />
              </button>
            </div>
          </div>

          {/* ستون دوم: لینک‌های مفید */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">لینک‌های مفید</h3>
            <ul className="space-y-3">
              <li><button className="text-gray-400 hover:text-cyan-400 transition-colors">درباره ما</button></li>
              <li><button className="text-gray-400 hover:text-cyan-400 transition-colors">قوانین و مقررات</button></li>
              <li><button className="text-gray-400 hover:text-cyan-400 transition-colors">راهنمای میزبانان</button></li>
              <li><button className="text-gray-400 hover:text-cyan-400 transition-colors">سوالات متداول</button></li>
            </ul>
          </div>

          {/* ستون سوم: تماس با ما */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">ارتباط با ما</h3>
            <ul className="space-y-5">
              {/* شماره تماس */}
              <li className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">پشتیبانی ۲۴ ساعته</span>
                  <span className="font-bold text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer" dir="ltr">
                    +98 21 1234 5678
                  </span>
                </div>
              </li>

              {/* ایمیل */}
              <li className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">ایمیل پشتیبانی</span>
                  <span className="font-bold text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer">
                    support@mizban.ir
                  </span>
                </div>
              </li>

              {/* آدرس */}
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center shrink-0 mt-1">
                  <MapPin size={22} className="text-cyan-500" />
                </div>
                <span className="text-sm leading-relaxed text-gray-400">
                  تهران، خیابان ولیعصر، بالاتر از میدان ونک، مجتمع تجاری، طبقه ۴
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* کپی‌رایت */}
        <div className="border-t border-gray-800 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Mizban. تمامی حقوق محفوظ است.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <button className="hover:text-cyan-400 transition-colors">حریم خصوصی</button>
            <span>|</span>
            <button className="hover:text-cyan-400 transition-colors">شرایط استفاده</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
