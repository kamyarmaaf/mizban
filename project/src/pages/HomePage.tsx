import { Search, TrendingUp, MapPin } from 'lucide-react';
import { categories } from '../mockData';
import ExperienceCard from '../components/ExperienceCard';
import CityAutocomplete from '../components/CityAutocomplete';
import DateRangePicker from '../components/DateRangePicker';
import { useRotatingBackground } from '../hooks/useRotatingBackground';
import foodImg from '../assets/images/food.webp';
import natureImg from '../assets/images/mountain.jpg';
import cultureImg from '../assets/images/farhangi.webp';
import adventureImg from '../assets/images/majarajoei.webp';
import artImg from '../assets/images/photo.jpg';
import placeholder from "../assets/images/placeholder.jpg";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

export default function HomePage({ onNavigate }) {
  const { currentImage } = useRotatingBackground();
  const { user, profile } = useAuth();

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  // استیت جدید برای باز شدن سرچ در موبایل
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const searchRef = useRef(null);
  const searchContainerRef = useRef(null); // رفرنس کل باکس سرچ برای بستن در صورت کلیک بیرون

  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const getCoverImage = (exp) => {
    if (!exp?.images || exp.images.length === 0) return placeholder;
    const cover = exp.images.find(img => img.is_cover);
    return cover ? cover.image : exp.images[0].image;
  };

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("http://127.0.0.1:8000/api/experiences/", {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("خطا در دریافت تجربه‌ها");
        }

        const data = await response.json();
        const experiencesArray = Array.isArray(data) ? data : (data.results || []);

        const formattedData = experiencesArray.map((exp) => ({
          ...exp,
          image:
            exp.images?.find((img) => img.is_cover)?.image ||
            exp.images?.[0]?.image ||
            placeholder,
        }));
        // ---------------------------------

        setExperiences(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching experiences:", error);
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const filtered =
    search.length >= 2
      ? experiences
          .filter(
            e =>
              e.title.includes(search) ||
              e.description.includes(search) ||
              e.city.includes(search) ||
              (e.category && e.category.includes(search))
          )
          .slice(0, 6)
      : [];

  useEffect(() => {
    const close = e => {
      // بستن پیشنهادات سرچ
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      // بستن کل باکس سرچ در موبایل در صورت کلیک بیرون از آن
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>;
  }

  const handleSearch = () => {
    setShowSuggestions(false);
    setIsSearchExpanded(false); // هنگام جستجو فرم بسته شود

    let results = experiences;

    if (search && search.trim() !== '') {
      results = results.filter(item =>
        (item.title && item.title.includes(search)) ||
        (item.description && item.description.includes(search))
      );
    }

    if (city && city !== '') {
      results = results.filter(item => item.city === city);
    }

    if (start) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      results = results.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= startDate;
      });
    }

    if (end) {
      const endDate = new Date(end);
      endDate.setHours(0, 0, 0, 0);

      results = results.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate <= endDate;
      });
    }

    setSearchResults(results);
    setHasSearched(true);

    setTimeout(() => {
      document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      {/* تغییر ارتفاع از ثابت 650 به حالت ریسپانسیو */}
      <section className="relative h-[500px] md:h-[650px]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500" />
          <div
            className="absolute inset-0 opacity-30 transition duration-[1500ms] scale-105"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
            تجربه‌های منحصر‌به ‌فرد در ایران
          </h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mt-6 mb-10 leading-relaxed hidden md:block">
            به میزبان‌های محلی بپیوندید و سفر خود را به یک تجربه ماندگار تبدیل کنید
          </p>
          <p className="text-base text-white/90 mt-4 mb-6 leading-relaxed md:hidden">
            یک تجربه ماندگار خلق کنید
          </p>

          {/* SEARCH AREA */}
          <div className="w-full max-w-5xl" ref={searchContainerRef}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-6 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-4">

                {/* فیلد اصلی سرچ که همیشه دیده می‌شود */}
                <div className="relative flex-1" ref={searchRef}>
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
                  <input
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setShowSuggestions(e.target.value.length >= 2);
                    }}
                    onFocus={() => {
                      if (search.length >= 2) setShowSuggestions(true);
                      setIsSearchExpanded(true); // هنگام فوکوس باز شود
                    }}
                    placeholder="دنبال چه تجربه‌ای هستید؟"
                    className="w-full bg-white/15 border border-white/30 rounded-2xl pr-12 pl-4 py-3 text-white placeholder-white/70 focus:bg-white/20 transition"
                  />

                  {showSuggestions && filtered.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                      {filtered.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            onNavigate('experience-detail', item.id);
                          }}
                          className="flex gap-4 w-full p-4 text-right hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <img src={getCoverImage(item)} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.city}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {item.price.toLocaleString('fa-IR')} تومان
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* بقیه فیلدها که در موبایل در صورت کلیک نشدن مخفی هستند */}
                <div className={`${isSearchExpanded ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 w-full md:w-auto`}>
                  <div className="flex-1 min-w-[200px]">
                    <CityAutocomplete value={city} onChange={setCity} />
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <DateRangePicker
                      startDate={start}
                      endDate={end}
                      onStartDateChange={setStart}
                      onEndDateChange={setEnd}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-10 py-3 text-emerald-600 bg-white rounded-2xl font-bold shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    جستجو
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* بقیه کدهای صفحه بدون تغییر ... (همان کدهای قبلی خودتان را اینجا قرار دهید) */}

      {/* CATEGORIES */}
      <section className="-mt-14 px-6 max-w-7xl mx-auto">
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 pb-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories
            .filter(c => c !== 'همه دسته‌ها')
            .map((cat, i) => {
              const images = {
                'غذا و نوشیدنی': foodImg,
                'طبیعت و کوهنوردی': natureImg,
                'گردشگری فرهنگی': cultureImg,
                'ماجراجویی': adventureImg,
                'عکاسی و هنر': artImg,
              };

              return (
                <button
                  key={cat}
                  onClick={() => onNavigate('experiences')}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  className="min-w-[45%] md:min-w-0 shrink-0 snap-start group relative h-32 md:h-40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <img
                    src={images[cat]}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/60" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm md:text-base font-extrabold text-white drop-shadow-md">{cat}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* SEARCH RESULTS SECTION */}
      {hasSearched && (
        <section id="search-results-section" className="py-12 px-4 bg-gray-50 min-h-[500px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">نتایج جستجو</h2>
              <button
                onClick={() => {
                  setHasSearched(false);
                  setSearch('');
                  setCity('');
                }}
                className="text-sm text-red-500 hover:text-red-600 font-bold"
              >
                لغو جستجو و نمایش همه
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0">
                {searchResults.map((item, i) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('experience-detail', item.id)}
                    className="w-[85%] sm:w-[60%] md:w-full flex-none snap-center md:snap-start bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100 animate-slide-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <img
                      src={getCoverImage(item)}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 truncate mb-2">{item.title}</h3>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.city}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          {item.price?.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg">متاسفانه تجربه‌ای با این مشخصات پیدا نشد.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TRENDING EXPERIENCES */}
<section className="max-w-7xl mx-auto px-6 mt-24">

  <div className="flex items-center justify-between mb-8 md:mb-12">

    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl shrink-0">
        <TrendingUp className="w-7 h-7" />
      </div>

      <div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">
          محبوب ترین ها
        </h2>
        <div className="h-1.5 w-28 bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full mt-2"></div>
      </div>
    </div>

    <button
      onClick={() => onNavigate("experiences")}
      className="text-emerald-600 font-bold text-sm md:text-base flex items-center gap-2 hover:gap-3 transition-all"
    >
      مشاهده همه
    </button>

  </div>

  <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 md:mx-0 md:px-0">

    {[...experiences]
      .sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;

        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 4)
      .map((exp, i) => (
        <div
          key={exp.id}
          className="w-[85%] sm:w-[60%] md:w-full flex-none snap-center md:snap-start animate-slide-up"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <ExperienceCard
            experience={exp}
            onViewDetails={(id) => onNavigate("experience-detail", id)}
          />
        </div>
      ))}

  </div>
</section>


      {/* EXPLORE BY CITY */}
<section className="max-w-7xl mx-auto px-6 mt-20 md:mt-28">

  <div className="flex justify-between items-center mb-8 md:mb-10">
    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">
      بر اساس شهر
    </h2>

    <button
      onClick={() => onNavigate("experiences")}
      className="text-emerald-600 font-bold text-sm md:text-base flex items-center gap-2 hover:gap-3 transition-all"
    >
      مشاهده همه
    </button>
  </div>

  <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 md:mx-0 md:px-0">

    {Object.entries(
      experiences.reduce((acc, exp) => {
        acc[exp.city] = (acc[exp.city] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, count], i) => {

        const cityExp = experiences.find((e) => e.city === city);
        const image = getCoverImage(cityExp);

        return (
          <button
            key={city}
            onClick={() => onNavigate("experiences", undefined, city)}
            className="min-w-[70%] sm:min-w-[45%] md:min-w-0 shrink-0 snap-center md:snap-start relative h-56 md:h-64 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            style={{ animationDelay: `${i * 0.1}s` }}
          >

            <img
              src={image}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-6 right-0 left-0 px-6 text-white flex flex-col">

              <span className="text-xl md:text-2xl font-extrabold drop-shadow-lg">
                {city}
              </span>

              <span className="text-xs md:text-sm bg-white/20 backdrop-blur-xl px-3 py-1 rounded-xl self-start mt-2 border border-white/30">
                {count} تجربه
              </span>

            </div>

          </button>
        );
      })}

  </div>
</section>

      {/* NEWEST EXPERIENCES */}
<section className="max-w-7xl mx-auto px-6 mt-20 md:mt-28 mb-24">

  <div className="flex items-center justify-between mb-8 md:mb-12">

    <div className="flex items-center gap-4">

      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white flex items-center justify-center shadow-xl shrink-0">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">
          جدیدترین‌ها
        </h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mt-2"></div>
      </div>

    </div>

    <button
      onClick={() => onNavigate("experiences")}
      className="text-emerald-600 font-bold text-sm md:text-base flex items-center gap-2 hover:gap-3 transition-all"
    >
      مشاهده همه
    </button>

  </div>

  <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 md:mx-0 md:px-0">

    {[...experiences]
      .sort((a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      )
      .slice(0, 4)
      .map((exp, i) => (
        <div
          key={exp.id}
          className="w-[85%] sm:w-[60%] md:w-full flex-none snap-center md:snap-start animate-slide-up"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <ExperienceCard
            experience={exp}
            onViewDetails={(id) => onNavigate("experience-detail", id)}
          />
        </div>
      ))}

  </div>
</section>


      {/* BECOME A HOST (CTA) */}
      <section className="max-w-7xl mx-auto px-6 mb-28">
        <div className="relative rounded-4xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-12 shadow-xl">
          <h2 className="text-4xl md:text-5xl text-white font-black drop-shadow-xl mb-6">
            میزبان شوید و درآمد کسب کنید
          </h2>
          <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
            اگر مهارت، تجربه یا توانایی میزبانی از گردشگران دارید، همین حالا
            ثبت‌نام کنید و تجربه‌های خود را به اشتراک بگذارید.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button className="px-10 py-3 bg-white text-emerald-600 font-black rounded-2xl shadow-lg hover:scale-105 transition">
              همین حالا شروع کنید
            </button>
            <button className="px-10 py-3 bg-white/20 text-white border border-white/40 rounded-2xl backdrop-blur-xl hover:bg-white/30 transition font-bold">
              ثبت نام / ورود به عنوان میزبان
            </button>
          </div>
          <div className="mt-6 text-white/80 text-sm bg-white/10 px-4 py-2 rounded-xl inline-block backdrop-blur-md border border-white/20">
            این گزینه فقط برای میزبان‌ها فعال است
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
