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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold">برای افزودن تجربه باید وارد شوید</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <h1 className="text-3xl font-black text-center mb-10">
          افزودن تجربه جدید
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-2">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
            تجربه با موفقیت ثبت شد
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >

          {/* title */}
          <input
            type="text"
            placeholder="عنوان تجربه"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          {/* category */}
          <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
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

          {/* description */}
          <textarea
            placeholder="توضیحات تجربه"
            rows={5}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          {/* location */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
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

          {/* details */}
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
          <hr/>
          <br/>
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


          {/* images */}
          <div>
            <label className="font-bold block mb-3">عکس‌ها</label>

            <label className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" />
                <p>آپلود عکس</p>
              </div>

              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleImages}
              />
            </label>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {previewImages.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    className="h-24 w-full object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate("provider-dashboard")}
              className="flex-1 py-3 bg-gray-200 rounded-xl"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl flex justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" />}
              ثبت تجربه
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
