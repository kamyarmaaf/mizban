import { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import Footer from '../components/Footer';

import { categories } from '../mockData'; // فقط categories می‌مونه چون شهرها داینامیک میشن
import ExperienceCard from '../components/ExperienceCard';
import { useAuth } from '../contexts/AuthContext';
import placeholder from "../assets/images/placeholder.jpg";


export default function ExperiencesPage({ onNavigate }: any) {
  const { user } = useAuth();

  const [experiences, setExperiences] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]); // اضافه شد
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(() => {
    try {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const params = new URLSearchParams(hashParts[1]);
        const pageParam = params.get('page');
        if (pageParam) return parseInt(pageParam, 10);
      }
      return 1;
    } catch (e) {
      return 1;
    }
  });
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 50;

  const getCityFromUrl = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('city') || 'همه شهرها';
  };

  const getCategoryFromUrl = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('category') || 'همه دسته‌ها';
  };

  const [selectedCity, setSelectedCity] = useState(getCityFromUrl());
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl());
  const [sortBy, setSortBy] = useState('default');

  // ----------------------------
  // دریافت تجربیات از سرور
  // ----------------------------
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);

        let url = `http://127.0.0.1:8000/api/experiences/?page=${page}`;
        if (selectedCity && selectedCity !== 'همه شهرها') {
          url += `&city=${encodeURIComponent(selectedCity)}`;
        }
        if (selectedCategory && selectedCategory !== 'همه دسته‌ها') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("خطا در دریافت اطلاعات");

        const data = await response.json();

        setNextPage(data.next);
        setPrevPage(data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));

        const experiencesArray = data.results || [];

        // استخراج شهرهای منحصربه‌فرد
        const citiesSet = new Set<string>();
        experiencesArray.forEach(exp => {
          if (exp.city) {
            citiesSet.add(exp.city);
          }
        });
        setAvailableCities(Array.from(citiesSet));

        const formattedData = experiencesArray.map((exp) => ({
          ...exp,
          image:
            exp.images?.find((img) => img.is_cover)?.image ||
            exp.images?.[0]?.image ||
            placeholder,
        }));

        setExperiences(formattedData);
        setError("");
      } catch (err) {
        setError("مشکل در اتصال به سرور");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [page, selectedCity, selectedCategory]);

  useEffect(() => {
    const currentPath = window.location.hash.slice(1).split('?')[0] || 'experiences';

    const params = new URLSearchParams();

    if (page > 1) params.set('page', page.toString());
    if (selectedCity && selectedCity !== 'همه شهرها') params.set('city', selectedCity);
    if (selectedCategory && selectedCategory !== 'همه دسته‌ها') params.set('category', selectedCategory);

    const newHash = `#${currentPath}${params.toString() ? '?' + params.toString() : ''}`;

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
  }, [page, selectedCity, selectedCategory]);


  // ----------------------------
  // فیلترها
  // ----------------------------
  let filtered = [...experiences];

  // چون city و category را به سرور می‌فرستی، بهتر است این فیلتر را فقط برای مواردی اجراکنی که ممکن است سرور ارسال نکرده باشد
  // اگر خیالت از بک‌اند راحت است می‌توانی فیلترهای فرانت را حذف کنی

  if (selectedCity !== 'همه شهرها') {
    filtered = filtered.filter(e => e.city === selectedCity);
  }

  if (selectedCategory !== 'همه دسته‌ها') {
    filtered = filtered.filter(e => e.category === selectedCategory);
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'default') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }

  // ----------------------------
  // Loading State
  // ----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 md:w-14 md:h-14 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-600 font-bold text-base md:text-lg">
          در حال بارگذاری تجربه‌ها...
        </p>
      </div>
    );
  }

  // ----------------------------
  // UI Modern Experience Page
  // ----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 md:pb-0">
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-16">
        {/* FILTER BOX */}
        <section className="glass-card rounded-2xl md:rounded-4xl shadow-sm md:shadow-luxury-lg p-5 md:p-10 mb-8 md:mb-16 border border-gray-100 md:border-white/30 bg-white/80 md:bg-white/40 backdrop-blur-2xl">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg md:shadow-xl">
              <SlidersHorizontal className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-gray-900">فیلترها</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* City */}
            <div>
              <label className="block mb-1.5 md:mb-3 text-xs md:text-sm font-bold text-gray-700">شهر</label>
              <select
                className="w-full px-3 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl border border-gray-200 md:border-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base outline-none"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
              >
                <option value="همه شهرها">همه شهرها</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* category */}
            <div>
              <label className="block mb-1.5 md:mb-3 text-xs md:text-sm font-bold text-gray-700">دسته‌بندی</label>
              <select
                className="w-full px-3 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl border border-gray-200 md:border-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base outline-none"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                {categories.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* sort */}
            <div>
              <label className="block mb-1.5 md:mb-3 text-xs md:text-sm font-bold text-gray-700">مرتب‌سازی</label>
              <select
                className="w-full px-3 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl border border-gray-200 md:border-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">پیش‌فرض</option>
                <option value="price-low">ارزان‌ترین</option>
                <option value="price-high">گران‌ترین</option>
              </select>
            </div>
          </div>
        </section>

        {/* ALL EXPERIENCES */}
        <section>
          <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-6 md:mb-10 px-1 md:px-0">
            تمام تجربه‌ها
          </h2>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {filtered.map((exp, i) => (
                <div
                  key={exp.id}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  className="animate-slide-up"
                >
                  <ExperienceCard
                    experience={exp}
                    onViewDetails={(id: string) => onNavigate('experience-detail', id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 md:py-24 text-center text-gray-500 font-bold text-sm md:text-lg">
              تجربه‌ای پیدا نشد
            </div>
          )}
        </section>

        {/* pagination */}
        <div className="flex items-center justify-center gap-3 mt-12">

          <button
            disabled={!prevPage}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded-xl bg-white disabled:opacity-40"
          >
            صفحه قبل
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl border font-bold
              ${p === page ? "bg-emerald-600 text-white" : "bg-white"}`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={!nextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-xl bg-white disabled:opacity-40"
          >
            صفحه بعد
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
