import { Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import dayjs from "dayjs";
import jalaliday from "jalaliday";

// اضافه کردن پلاگین جلالی به dayjs
dayjs.extend(jalaliday);

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const monthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // تنظیم ماه فعلی بر اساس تقویم شمسی
  const [currentMonth, setCurrentMonth] = useState(dayjs().calendar("jalali"));
  const [selecting, setSelecting] = useState<'start' | 'end' | null>('start');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // فرمت تاریخ برای نمایش در دکمه (تبدیل میلادی به شمسی)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dayjs(dateStr).calendar("jalali").format("YYYY/MM/DD");
  };

    const handleDateClick = (day: number) => {
    // ساخت آبجکت تاریخ جلالی برای روز انتخاب شده
    const jDate = currentMonth.date(day);
    // تبدیل به میلادی استاندارد برای ذخیره در استیت و مقایسه
    const gDateStr = jDate.calendar("gregory").format("YYYY-MM-DD");

    // چک کردن کلیک سوم:
    // اگر از قبل هم تاریخ شروع و هم تاریخ پایان داریم،
    // با کلیک جدید بازه ریست می‌شود و منتظر تاریخ پایان جدید می‌مانیم.
    if (startDate && endDate) {
      onStartDateChange(gDateStr); // کلیک جدید به عنوان شروع در نظر گرفته می‌شود
      onEndDateChange('');         // تاریخ پایان حذف می‌شود
      setSelecting('end');         // تقویم به حالت انتخاب تاریخ پایان می‌رود
      return;
    }

    if (selecting === 'start') {
      onStartDateChange(gDateStr);
      setSelecting('end');
    } else {
      // اگر کاربر تاریخ پایان را قبل از شروع انتخاب کرد، آن را به عنوان شروع در نظر بگیر
      if (startDate && gDateStr < startDate) {
        onStartDateChange(gDateStr);
        onEndDateChange('');
        setSelecting('end');
      } else {
        onEndDateChange(gDateStr);
        setIsOpen(false); // بستن تقویم پس از تکمیل بازه
        setSelecting('start'); // آماده‌سازی برای انتخاب‌های بعدی
      }
    }
  };


  const isDateInRange = (day: number): boolean => {
    if (!startDate || !endDate) return false;
    const gDateStr = currentMonth.date(day).calendar("gregory").format("YYYY-MM-DD");
    return gDateStr >= startDate && gDateStr <= endDate;
  };

  const isDateSelected = (day: number): boolean => {
    const gDateStr = currentMonth.date(day).calendar("gregory").format("YYYY-MM-DD");
    return gDateStr === startDate || gDateStr === endDate;
  };

  const prevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  // محاسبات روزهای ماه برای رندر کردن گرید
  const daysInMonth = currentMonth.daysInMonth();
  // بدست آوردن اولین روز ماه (در جاوااسکریپت 0=یکشنبه تا 6=شنبه)
  const rawStartDay = currentMonth.startOf('month').day();
  // شیفت دادن به طوری که شنبه اولین روز هفته (ایندکس 0) شود
  const emptyDaysCount = (rawStartDay + 1) % 7;

  const emptyDays = Array.from({ length: emptyDaysCount }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative z-[10000]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-between gap-2 px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl focus:border-white/60 text-white hover:bg-white/20 transition-all duration-300 text-right min-w-[240px]"
      >
        <Calendar className="w-5 h-5 text-white/70 shrink-0" />
        <span className="flex-1 text-sm whitespace-nowrap">
          {startDate && endDate
            ? `${formatDate(startDate)} تا ${formatDate(endDate)}`
            : startDate
            ? `از: ${formatDate(startDate)}`
            : 'انتخاب تاریخ برگزاری'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl p-4 z-[10001] w-[340px] border border-gray-200 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={nextMonth} // برای زبان فارسی (RTL) فلش چپ به ماه بعد می‌رود
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="font-bold text-gray-900 text-center flex-1">
              {monthNames[currentMonth.month()]} {currentMonth.year()}
            </h3>
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          <div className="text-center text-xs text-gray-600 mb-3 font-medium">
            {selecting === 'start' ? 'تاریخ شروع بازه را انتخاب کنید' : 'تاریخ پایان بازه را انتخاب کنید'}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
                {day}
              </div>
            ))}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`p-2 text-sm rounded-lg transition-colors font-medium ${
                  isDateSelected(day)
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : isDateInRange(day)
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
                setSelecting('start');
              }}
              className="flex-1 px-3 py-2 bg-gray-200 text-sm text-gray-600 hover:bg-gray-300 rounded-lg transition-colors font-medium"
            >
              پاک کن
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              تایید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
