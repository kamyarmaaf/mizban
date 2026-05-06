/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        primary: '#064e55',       // رنگ اصلی (سبز تیره) - برای دکمه‌ها و المان‌های کلیدی
        dark: '#0f172a',          // رنگ تیره - برای متن‌ها
        light: '#f8fafc',         // رنگ روشن - برای بک‌گراند
        complementary: '#ffb703', // رنگ مکمل (زرد/نارنجی)
      }
    },
  },
  plugins: [],
};
