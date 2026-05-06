import { useState, useEffect } from "react";
import { Upload, Loader2, AlertCircle, X } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold">برای ویرایش تجربه باید وارد شوید</p>
          <button
            onClick={() => onNavigate("login")}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl"
          >
            ورود
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-emerald-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-black text-center mb-10">ویرایش تجربه</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-2">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
            تجربه با موفقیت ویرایش شد
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <input
            type="text"
            placeholder="عنوان تجربه"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
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
            className="w-full border p-3 rounded-xl"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
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
              className="border p-3 rounded-xl"
            />
          </div>

          <input
            type="text"
            placeholder="آدرس دقیق"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="قیمت (تومان)"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="border p-3 rounded-xl"
            />
            <input
              type="number"
              placeholder="ظرفیت"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              className="border p-3 rounded-xl"
            />
            <input
              type="text"
              placeholder="مثلا 3 ساعت"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              className="border p-3 rounded-xl"
            />
          </div>

          <div>
            <hr/><br/>
            <label className="font-bold block mb-3">زمان‌بندی تجربه</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-gray-600">تاریخ برگزاری</p>
                <PersianDatePicker
                    value={formData.date}
                    onChange={(date:string)=>handleChange("date",date)}
                  />
              </div>
              <div>
                <p className="mb-1 text-gray-600">ساعت آغاز</p>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className="w-full border p-3 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* تصاویر قبلی */}
          {existingImages.length > 0 && (
            <div>
              <label className="font-bold block mb-3">عکس‌های فعلی</label>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {existingImages.map((img) => {
                  // اصلاح آدرس در صورت نسبی بودن
                  const imageUrl = img.image.startsWith('http') ? img.image : `http://127.0.0.1:8000${img.image}`;
                  return (
                    <div key={img.id} className="relative border rounded-lg p-1">
                      <img src={imageUrl} className="h-24 w-full object-cover rounded-lg" alt="experience" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* تصاویر جدید */}
          <div>
            <label className="font-bold block mb-3">آپلود عکس‌های جدید (اختیاری)</label>
            <label className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" />
                <p>انتخاب عکس‌های جدید</p>
              </div>
              <input type="file" multiple className="hidden" onChange={handleNewImages} />
            </label>

            {previewNewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {previewNewImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} className="h-24 w-full object-cover rounded-lg" alt="preview" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate("provider-dashboard")}
              className="flex-1 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl flex justify-center gap-2 hover:bg-emerald-700 transition"
            >
              {submitting && <Loader2 className="animate-spin" />}
              ثبت تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
