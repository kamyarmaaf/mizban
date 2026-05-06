import { MapPin, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [availableCities, setAvailableCities] = useState<string[]>([]); // استیت جدید برای شهرهای داینامیک
  const containerRef = useRef<HTMLDivElement>(null);

  // دریافت شهرها از بک‌اند (مشابه صفحه ExperiencesPage)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/experiences/');
        if (!response.ok) return;

        const data = await response.json();
        const experiencesArray = data.results || [];

        // استخراج شهرهای منحصربه‌فرد
        const citiesSet = new Set<string>();
        experiencesArray.forEach((exp: any) => {
          if (exp.city) {
            citiesSet.add(exp.city);
          }
        });

        setAvailableCities(Array.from(citiesSet));
      } catch (err) {
        console.error("خطا در دریافت لیست شهرها", err);
      }
    };

    fetchCities();
  }, []);

  // فیلتر کردن بر اساس شهرهای دریافتی از بک‌اند
  const filteredCities = inputValue.trim() === ''
    ? availableCities
    : availableCities.filter(city =>
        city.includes(inputValue) || inputValue.includes(city)
      );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    setInputValue(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="flex-1 relative group" ref={containerRef}>
      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-focus-within:text-white transition-all duration-300 pointer-events-none z-10" />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="شهر را انتخاب کنید..."
        className="w-full pr-12 pl-4 py-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl focus:border-white/60 focus:ring-0 text-right text-white placeholder-white/60 transition-all duration-300 hover:bg-white/20 focus:bg-white/25 focus:shadow-lg"
      />

      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-slide-up border-2 border-white/50 max-h-64 overflow-y-auto">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="w-full text-right px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-700 font-medium hover:text-emerald-600"
              >
                {city}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center text-sm">
              شهری با این نام پیدا نشد
            </div>
          )}
        </div>
      )}
    </div>
  );
}
