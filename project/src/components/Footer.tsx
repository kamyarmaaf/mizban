// src/components/Footer.tsx
import React from 'react';
import { Phone, Mail, MapPin, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white/80 pt-10 pb-6 mt-16 border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* بخش اول: درباره میزبان */}
          <div>
            <h2 className="text-2xl font-black text-complementary mb-4">
              میزبان
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-md">
              پلتفرمی برای اتصال مسافران به تجربه‌های محلی و منحصربه‌فرد.
              با میزبان‌های واقعی ملاقات کنید و سفر متفاوتی را در کنار مردم بومی تجربه کنید.
            </p>
            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-secondary hover:text-white transition-all duration-300">
                <Twitter size={18} />
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-complementary hover:text-white transition-all duration-300">
                <Linkedin size={18} />
              </button>
            </div>
          </div>

          {/* بخش دوم: لینک‌های مفید و ارتباط با ما (کنار هم) */}
          <div className="flex flex-row justify-between gap-8 sm:gap-16">

            {/* لینک‌های مفید */}
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-4 whitespace-nowrap">لینک‌های مفید</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="text-white/60 hover:text-primary transition-colors">درباره ما</button></li>
                <li><button className="text-white/60 hover:text-primary transition-colors">قوانین و مقررات</button></li>
                <li><button className="text-white/60 hover:text-primary transition-colors">راهنمای میزبانان</button></li>
                <li><button className="text-white/60 hover:text-primary transition-colors">سوالات متداول</button></li>
              </ul>
            </div>

            {/* ارتباط با ما */}
            <div className="flex-[2]">
              <h3 className="text-white font-bold text-base mb-4 whitespace-nowrap">ارتباط با ما</h3>
              <ul className="space-y-4">
                {/* شماره تماس */}
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 hidden sm:flex">
                    <Phone size={18} className="text-secondary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/50 mb-0.5">پشتیبانی ۲۴ ساعته</span>
                    <span className="font-bold text-sm text-white/90 hover:text-primary transition-colors cursor-pointer" dir="ltr">
                      +98 21 1234 5678
                    </span>
                  </div>
                </li>

                {/* ایمیل */}
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 hidden sm:flex">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/50 mb-0.5">ایمیل پشتیبانی</span>
                    <span className="font-bold text-sm text-white/90 hover:text-primary transition-colors cursor-pointer">
                      support@mizban.ir
                    </span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* کپی‌رایت */}
        <div className="border-t border-white/10 pt-6 mt-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            © 2025 Mizban. تمامی حقوق محفوظ است.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <button className="hover:text-primary transition-colors">حریم خصوصی</button>
            <span>|</span>
            <button className="hover:text-primary transition-colors">شرایط استفاده</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
