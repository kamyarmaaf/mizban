import { useState, useEffect } from "react";
import { Upload, Loader2, AlertCircle, X, Edit3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PersianDatePicker from '../components/PersianDatePicker';
import { categories, provinces } from "../mockData"

interface EditExperiencePageProps {
  experienceId: string;
  onNavigate: (page: string) => void;
}

export default function EditExperiencePage({ experienceId, onNavigate }: EditExperiencePageProps) {
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

  const [existingImages, setExistingImages] = useState<any[]>([]); // عکس‌های قبلی
  const [newImages, setNewImages] = useState<File[]>([]); // عکس‌های جدید
  const [previewNewImages, setPreviewNewImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(true); // برای لودینگ اولیه فرم
  const [submitting, setSubmitting] = useState(false); // برای لودینگ دکمه ثبت
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ۱. دریافت اطلاعات قبلی تجربه
  useEffect(() => {
    const fetchExperienceData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/`);
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات تجربه");

        const data = await res.json();

        // پر کردن فیلدها با دیتای دریافتی
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price || "",
          capacity: data.capacity || "",
          duration: data.duration || "",
          province: data.province || "",
          city: data.city || "",
          address: data.address || "",
          date: data.date || "",
          time: data.time || "",
        });

        // ذخیره عکس‌های قبلی
        if (data.images && Array.isArray(data.images)) {
          setExistingImages(data.images);
        }
      } catch (err) {
        setError("خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    if (experienceId) {
      fetchExperienceData();
    }
  }, [experienceId]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-light font-sans flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center max-w-md w-full border border-dark/5">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-secondary" />
          </div>
          <p className="text-xl font-black text-dark mb-2">نیاز به ورود</p>
          <p className="text-dark/60 font-medium mb-8">برای ویرایش تجربه باید وارد حساب کاربری خود شوید.</p>
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

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const appendedImages = [...newImages, ...files];
    setNewImages(appendedImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewNewImages([...previewNewImages, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const imgs = [...newImages];
    const previews = [...previewNewImages];

    imgs.splice(index, 1);
    previews.splice(index, 1);

    setNewImages(imgs);
    setPreviewNewImages(previews);
  };

  // ۲. حذف عکس قبلی با صدا زدن API
  const removeExistingImage = async (imageId: number) => {
    if (!window.confirm("آیا از حذف این عکس مطمئن هستید؟")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/experiences/images/${imageId}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (res.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
      } else {
        alert("خطا در حذف عکس");
      }
    } catch (err) {
      console.error(err);
      alert("خطای شبکه در حذف عکس");
    }
  };

  // ۳. ارسال اطلاعات ویرایش شده
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.description) {
      setError("عنوان و توضیحات الزامی است");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // ارسال فقط عکس‌های جدید
      newImages.forEach((img) => {
        data.append("images", img);
      });

      const res = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/update/`, {
        method: "PATCH", // استفاده از PATCH طبق تنظیمات شما
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: data,
      });

      if (!res.ok) {
        throw new Error();
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigate("provider-dashboard");
      }, 1500);
    } catch (err) {
      setError("خطا در ویرایش تجربه");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-primary mb-4" />
        <p className="text-dark/60 font-bold">در حال دریافت اطلاعات تجربه...</p>
      </div>
    );
  }

  const inputClasses = "w-full border border-dark/10 bg-light/50 p-4 rounded-2xl text-dark placeholder:text-dark/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium";

  return (
    <div className="min-h-screen bg-light font-sans flex flex-col">
      {/* هدر صفحه */}
      <div className="bg-primary py-12 rounded-b-3xl shadow-soft mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-3">
            ویرایش تجربه
          </h1>
          <p className="text-white/80 text-center text-sm md:text-base font-medium">
            اطلاعات تجربه خود را به‌روزرسانی کنید
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 w-full">
        {error && (
          <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <AlertCircle className="text-secondary w-6 h-6 shrink-0" />
            <p className="text-secondary font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">✓</div>
            <p className="text-primary font-bold">تغییرات با موفقیت ذخیره شد. در حال انتقال...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-soft border border-dark/5 p-6 md:p-8 space-y-8">
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
              {categories.filter((c) => c !== "همه دسته‌ها").map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <textarea
              placeholder="توضیحات تجربه"
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
                  <option key={p} value={p}>{p}</option>
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
              placeholder="آدرس دقیق"
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
                placeholder="ظرفیت"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                className={inputClasses}
              />
              <input
                type="text"
                placeholder="مثلا ۳ ساعت"
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
                  onChange={(date:string)=>handleChange("date",date)}
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

          {/* مدیریت تصاویر */}
          <div className="space-y-6 pt-4 border-t border-dark/5">
            <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              مدیریت تصاویر
            </h2>

            {/* تصاویر قبلی */}
            {existingImages.length > 0 && (
              <div className="bg-light/30 p-4 rounded-2xl border border-dark/5">
                <label className="font-bold text-sm text-dark/70 block mb-4">عکس‌های فعلی (برای حذف روی آیکون کلیک کنید)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((img) => {
                    const imageUrl = img.image.startsWith('http') ? img.image : `http://127.0.0.1:8000${img.image}`;
                    return (
                      <div key={img.id} className="relative group">
                        <img src={imageUrl} className="h-32 w-full object-cover rounded-2xl border border-dark/10" alt="experience" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-2 right-2 bg-secondary/90 hover:bg-secondary text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* افزودن تصاویر جدید */}
            <div>
              <label className="font-bold text-sm text-dark/70 block mb-3">افزودن عکس‌های جدید (اختیاری)</label>
              <label className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors rounded-3xl h-32 flex flex-col items-center justify-center cursor-pointer mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Upload className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">انتخاب عکس‌های جدید</p>
                    <p className="text-xs text-primary/60 mt-1">فرمت‌های مجاز: JPG, PNG</p>
                  </div>
                </div>
                <input type="file" multiple className="hidden" onChange={handleNewImages} />
              </label>

              {previewNewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewNewImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} className="h-32 w-full object-cover rounded-2xl border border-dark/10" alt="preview" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 bg-secondary/90 hover:bg-secondary text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              disabled={submitting}
              className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <Edit3 className="w-6 h-6" />
              )}
              {submitting ? 'در حال ثبت...' : 'ثبت تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
