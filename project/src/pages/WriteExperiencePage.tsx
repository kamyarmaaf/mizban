import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PersianDatePicker from '../components/PersianDatePicker';
import { Calendar } from "lucide-react";
import { categories, provinces } from "../mockData"

interface WriteExperiencePageProps {
  onNavigate: (page: string) => void;
}

export default function WriteExperiencePage({ onNavigate }: WriteExperiencePageProps) {
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    capacity: "",
    duration: "",
    province: "",
    city: "",
    address: "",
    date: "",
    time: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selecting, setSelecting] = useState<'start'>('start');

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-light font-sans flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center max-w-md w-full border border-dark/5">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-secondary" />
          </div>
          <p className="text-xl font-black text-dark mb-2">نیاز به ورود</p>
          <p className="text-dark/60 font-medium mb-8">برای افزودن تجربه جدید ابتدا باید وارد حساب کاربری خود شوید.</p>
          <button
            onClick={() => onNavigate("login")}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            ورود به حساب کاربری
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const imgs = [...images];
    const previews = [...previewImages];

    imgs.splice(index, 1);
    previews.splice(index, 1);

    setImages(imgs);
    setPreviewImages(previews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.description) {
      setError("عنوان و توضیحات الزامی است");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // فیلدهای معمولی
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // عکس‌ها
      images.forEach((img) => {
        data.append("images", img);
      });

      const res = await fetch("http://127.0.0.1:8000/api/experiences/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.log("Error:", errorData);
        throw new Error();
      }

      setSuccess(true);

      setTimeout(() => {
        onNavigate("provider-dashboard");
      }, 1500);
    } catch (err) {
      setError("خطا در ثبت تجربه");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full border border-dark/10 bg-light/50 p-4 rounded-2xl text-dark placeholder:text-dark/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium";

  return (
    <div className="min-h-screen bg-light font-sans flex flex-col">
      {/* هدر صفحه */}
      <div className="bg-primary py-12 rounded-b-3xl shadow-soft mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-3">
            افزودن تجربه جدید
          </h1>
          <p className="text-white/80 text-center text-sm md:text-base font-medium">
            جزئیات تجربه خود را با مسافران به اشتراک بگذارید
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 w-full">
        {error && (
          <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <AlertCircle className="text-secondary w-6 h-6" />
            <p className="text-secondary font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold">✓</div>
            <p className="text-primary font-bold">تجربه با موفقیت ثبت شد. در حال انتقال...</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-soft border border-dark/5 p-6 md:p-8 space-y-8"
        >
          {/* اطلاعات پایه */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              اطلاعات پایه
            </h2>

            <input
              type="text"
              placeholder="عنوان تجربه"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={inputClasses}
            />

            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={inputClasses}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories
                .filter((c) => c !== "همه دسته‌ها")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>

            <textarea
              placeholder="توضیحات کامل تجربه..."
              rows={5}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* موقعیت مکانی */}
          <div className="space-y-4 pt-4 border-t border-dark/5">
            <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
              <span className="w-2 h-6 bg-secondary rounded-full"></span>
              موقعیت مکانی
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.province}
                onChange={(e) => handleChange("province", e.target.value)}
                className={inputClasses}
              >
                <option value="">انتخاب استان</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="شهر"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={inputClasses}
              />
            </div>

            <input
              type="text"
              placeholder="آدرس دقیق برگزاری تجربه"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* جزئیات و زمان‌بندی */}
          <div className="space-y-4 pt-4 border-t border-dark/5">
            <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
              <span className="w-2 h-6 bg-complementary rounded-full"></span>
              جزئیات و زمان‌بندی
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="قیمت (تومان)"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className={inputClasses}
              />

              <input
                type="number"
                placeholder="ظرفیت (نفر)"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                className={inputClasses}
              />

              <input
                type="text"
                placeholder="مدت زمان (مثلا ۳ ساعت)"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2">تاریخ برگزاری</label>
                <PersianDatePicker
                  value={formData.date}
                  onChange={(date: string) => handleChange("date", date)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark/70 mb-2">ساعت آغاز</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* گالری تصاویر */}
          <div className="space-y-4 pt-4 border-t border-dark/5">
            <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              گالری تصاویر
            </h2>

            <label className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors rounded-3xl h-40 flex flex-col items-center justify-center cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                <Upload className="text-primary w-6 h-6" />
              </div>
              <p className="font-bold text-primary">آپلود تصاویر تجربه</p>
              <p className="text-xs text-primary/60 mt-1">فرمت‌های مجاز: JPG, PNG</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleImages}
              />
            </label>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {previewImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      className="h-32 w-full object-cover rounded-2xl border border-dark/10"
                      alt={`پیش‌نمایش ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-secondary/90 hover:bg-secondary text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-dark/5">
            <button
              type="button"
              onClick={() => onNavigate("provider-dashboard")}
              className="flex-1 py-4 bg-dark/5 text-dark/70 font-bold rounded-2xl hover:bg-dark/10 transition-colors"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <Calendar className="w-6 h-6" />
              )}
              {loading ? 'در حال ثبت...' : 'ثبت تجربه جدید'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
