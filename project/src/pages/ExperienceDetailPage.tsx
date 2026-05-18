import { useState, useEffect } from "react";
import {
  MapPin,
  User,
  Heart,
  ArrowRight,
  Star,
  Calendar,
  Clock,
  Timer,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react";
import Footer from '../components/Footer';

import StarRating from "../components/StarRating";
import { Comment } from "../types";
import { useAuth } from "../contexts/AuthContext";

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("fa-IR-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

interface ExperienceDetailPageProps {
  experienceId: string;
  onNavigate: (page: string, params?: any) => void;
}

export default function ExperienceDetailPage({
  experienceId,
  onNavigate,
}: ExperienceDetailPageProps) {
  const { user, profile } = useAuth();

  const [experience, setExperience] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(() => {
    if (!experience?.images) return 0;
    const coverIndex = experience.images.findIndex((img: any) => img.is_cover);
    return coverIndex > -1 ? coverIndex : 0;
  });

  const [guests, setGuests] = useState(1);
  const [ratingData, setRatingData] = useState({
    rating: 0,
    totalRatings: 0
  });

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const images = experience?.images || [];
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: any) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleReserve = () => {
  if (!user) {
    alert("برای رزرو تجربه ابتدا باید وارد حساب کاربری خود شوید.");
    onNavigate("login");
    return;
  }
  // هدایت به صفحه پرداخت/تایید نهایی به همراه اطلاعات رزرو
  onNavigate("checkout", {
    experienceId: experience.id,
    experienceTitle: experience.title,
    price: experience.price,
    guests: guests,
    date: experience.date,
    time: experience.time,
  });
};

  useEffect(() => {
    const fetchExperienceDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error('مشکلی در دریافت اطلاعات پیش آمد.');
        }

        const data = await response.json();
        setExperience(data);
        setIsLoading(false);

      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (experienceId) {
      fetchExperienceDetail();
    }
  }, [experienceId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/comments/`);
        if (res.ok) {
          const data = await res.json();
          setComments(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (experienceId) {
      fetchComments();
    }
  }, [experienceId]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/get-rate/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setRatingData({
          rating: data.avg_rating || 0,
          totalRatings: data.total_ratings || 0
        });
      })
      .catch((err) => console.error("Error fetching rating:", err));
  }, [experienceId]);

  useEffect(() => {
    if (experience) {
        setIsLiked(experience.is_favorited || false);
    }
  }, [experience]);

  const handleRate = async (rating: number) => {
    if (!user) return alert("برای امتیاز دادن باید وارد شوید");
    setUserRating(rating);
    setHasRated(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/rate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();

      setRatingData({
        rating: data.rating,
        totalRatings: data.totalRatings
      });
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) return onNavigate('login');
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/experiences/${experienceId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment.trim() })
      });

      if (res.ok) {
        const addedComment = await res.json();
        setComments(prev => [addedComment, ...(Array.isArray(prev) ? prev : [])]);
        setNewComment("");
      } else {
        alert("خطا در ارسال نظر.");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("آیا از حذف این نظر مطمئن هستید؟")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 204) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
         const errorData = await res.json();
         alert(errorData.detail || "شما اجازه حذف این نظر را ندارید.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLikeClick = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('برای افزودن به علاقه‌مندی‌ها ابتدا باید وارد شوید.');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await fetch(`http://localhost:8000/api/experiences/${experience.id}/favorite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-dark">در حال بارگذاری اطلاعات...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-complementary font-bold text-xl">خطا: {error}</div>;
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <p className="text-dark/50 text-lg mb-4">تجربه پیدا نشد</p>
          <button
            onClick={() => onNavigate("experiences")}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow hover:shadow-lg transition"
          >
            بازگشت به لیست
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10">

        {/* Back Button */}
        <button
          onClick={() => onNavigate("experiences")}
          className="flex items-center gap-2 text-dark/60 hover:text-primary mb-4 md:mb-6 transition"
        >
          <ArrowRight className="w-5 h-5" />
          بازگشت به لیست
        </button>

        {/* Main Card */}
        <div className="rounded-3xl md:rounded-4xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/30 shadow-xl">

          {/* Image Slider */}
            <div
              className="relative h-[250px] sm:h-[350px] md:h-[480px] w-full overflow-hidden group rounded-t-3xl md:rounded-xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {images.length > 0 ? (
                <>
                  {images.map((img: any, index: number) => (
                    <img
                      key={img.id || index}
                      src={img.image}
                      alt={`Slide ${index}`}
                      className={`absolute inset-0 w-full h-full object-contain md:object-cover transition-opacity duration-500 ease-in-out ${
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                    />
                  ))}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.preventDefault(); prevImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-dark/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => { e.preventDefault(); nextImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-dark/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white scale-125"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <img
                  src="/default-experience.jpg"
                  alt="default"
                  className="w-full h-full object-cover"
                />
              )}

            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`absolute top-4 left-4 md:top-6 md:left-6 z-20 p-2 md:p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md transition ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
            >
              <Heart
                className={`w-5 h-5 md:w-6 md:h-6 ${
                  isLiked
                    ? "fill-complementary text-complementary"
                    : "text-dark/60"
                }`}
              />
            </button>

            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/80 backdrop-blur-md font-bold text-dark/80 shadow-lg text-sm md:text-base">
              {experience.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-10">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

              {/* LEFT SIDE (Main) */}
              <div className="lg:col-span-2">

                <h1 className="text-2xl md:text-4xl font-black text-dark mb-4">
                  {experience.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8 text-sm md:text-base text-dark/60">
                  <div className="flex items-center gap-1.5 bg-light px-3 py-1.5 rounded-lg">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-dark/50" />
                    <span>
                      {experience.region}، {experience.city}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1.5 cursor-pointer text-primary bg-primary/10 px-3 py-1.5 rounded-lg transition-all hover:bg-primary/20 border border-primary/20"
                    onClick={() => {
                      const hostId = experience.mizban?.id || experience.mizban_id || experience.provider_id || experience.mizban || experience.provider;
                      if (hostId) {
                        onNavigate('mizban-profile', hostId);
                      } else {
                        alert("اطلاعات میزبان در دسترس نیست.");
                      }
                    }}
                  >
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-medium">میزبان: {experience.provider_name || experience.providerName || 'نامشخص'}</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 mr-1 opacity-60" />
                  </div>
                </div>

                {/* Info Cards (Horizontal scroll on mobile) */}
                <div className="grid grid-cols-3 gap-2 md:gap-5 mb-8 md:mb-10">

                  <div className="w-full">

                    <DetailInfoCard
                      icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                      title="تاریخ برگزاری"
                      value={formatDate(experience.date)}
                      type="primary"
                    />
                  </div>
                  <div className="w-full">

                    <DetailInfoCard
                      icon={<Clock className="w-5 h-5 md:w-6 md:h-6 " />}
                      title="ساعت شروع"
                      value={experience.time}
                      type="primary"
                    />
                  </div>
                  <div className="w-full">

                    <DetailInfoCard
                      icon={<Timer className="w-5 h-5 md:w-6 md:h-6 " />}
                      title="مدت زمان"
                      value={experience.duration}
                      type="primary"
                    />
                  </div>
                </div>

                {/* Rating */}
                {ratingData.totalRatings > 0 && (
                  <div className="mb-8 pb-6 border-b border-gray-200">
                    <div className="text-sm font-bold text-dark/80 mb-2">
                      امتیاز تجربه:
                    </div>
                    <StarRating
                      rating={ratingData.rating}
                      totalRatings={ratingData.totalRatings}
                      size="md"
                    />
                  </div>
                )}

                {/* User Rating Box */}
                <div className="mb-8 md:mb-10">
                  <RatingBox
                    hasRated={hasRated}
                    setHasRated={setHasRated}
                    userRating={userRating}
                    handleRate={handleRate}
                  />
                </div>

                {/* Description */}
                <div className="prose prose-base md:prose-lg max-w-none leading-relaxed text-dark/80 mb-10">
                  <h2 className="text-lg md:text-xl font-black mb-3 text-right">
                    درباره این تجربه
                  </h2>
                  <p className="text-right text-justify">{experience.description}</p>
                </div>

                {/* Comments Section */}
                <CommentsSection
                  comments={comments}
                  user={user}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  isSubmitting={isSubmitting}
                  handleSubmitComment={handleSubmitComment}
                  handleDeleteComment={handleDeleteComment}
                  formatDate={formatDate}
                  onNavigate={onNavigate}
                />

              </div>

              {/* RIGHT SIDE (Sticky Box - hidden completely or partially on mobile) */}
              <div className="hidden lg:block">
                   <StickyBookingBox
                     experience={experience}
                     ratingData={ratingData}
                     guests={guests}
                     setGuests={setGuests}
                     onReserve={handleReserve}
                   />
                </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Booking Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-5 flex justify-between items-center z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col">
            <div className="text-lg font-black text-dark flex items-center gap-1">
              {experience.price ? (experience.price * guests).toLocaleString("fa-IR") : "رایگان"}
              <span className="text-sm font-normal text-dark/50">تومان</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-6 h-6 rounded-md bg-light flex items-center justify-center font-bold text-dark/60"
              >-</button>
              <span className="text-sm font-bold text-dark">{guests} نفر</span>
              <button
                onClick={() => setGuests(g => g + 1)}
                className="w-6 h-6 rounded-md bg-light flex items-center justify-center font-bold text-dark/60"
              >+</button>
            </div>
          </div>
          <button
            onClick={handleReserve}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
          >
            رزرو تجربه
          </button>
        </div>
    </div>
  );
}

/* ---------------------
   SUB COMPONENTS
---------------------- */

function DetailInfoCard({ icon, title, value, type = "primary" }: any) {
  const styles = {
    primary: "bg-primary/5 border-primary/20 text-primary",
    complementary: "bg-complementary/5 border-complementary/20 text-complementary",
  };

  const currentStyle = styles[type as keyof typeof styles] || styles.primary;

  return (
    <div
  className={`rounded-xl md:rounded-2xl p-2 md:p-5 border-2 ${currentStyle} h-full flex flex-col items-center justify-center text-center`}
>
      <div className="flex flex-col items-center gap-1 mb-1.5 md:mb-2">
        <div className="opacity-80">{icon}</div>
        <span className="text-xs md:text-sm font-bold opacity-80">
          {title}
        </span>
      </div>
      <p className="text-sm md:text-lg font-black mt-auto">
        {value}
      </p>
    </div>
  );
}

function RatingBox({ hasRated, setHasRated, userRating, handleRate }: any) {
  return (
    <div className="bg-primary/5 rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-primary/20 shadow-sm">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <Star className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h3 className="text-base md:text-lg font-bold text-dark">
          {hasRated ? "امتیاز شما ثبت شد!" : "این تجربه را امتیاز دهید"}
        </h3>
      </div>

      {!hasRated ? (
        <>
          <p className="text-xs md:text-sm text-dark/60 mb-4">
            نظر شما به بهبود کیفیت کمک می‌کند
          </p>

          <StarRating
            rating={userRating}
            size="lg"
            interactive={true}
            onRate={handleRate}
          />
        </>
      ) : (
        <div className="flex items-center gap-3 mt-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-base md:text-lg">{userRating}</span>
          </div>

          <div>
            <p className="font-bold text-sm md:text-base text-primary">متشکریم!</p>
            <button
              onClick={() => setHasRated(false)}
              className="text-primary/80 text-xs md:text-sm font-medium hover:text-primary"
            >
              تغییر امتیاز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsSection({
  comments,
  user,
  newComment,
  setNewComment,
  isSubmitting,
  handleSubmitComment,
  handleDeleteComment,
  formatDate,
  onNavigate,
}: any) {
  return (
    <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-gray-300">
      <div className="flex items-center gap-3 mb-6 md:mb-10">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-3xl font-black text-dark">
          نظرات ({comments?.length || 0})
        </h2>
      </div>

      {user ? (
        <div className="bg-light rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-gray-200 mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="نظر خود را بنویسید..."
            className="w-full rounded-xl md:rounded-2xl p-3 md:p-4 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 transition text-right text-sm md:text-base text-dark"
          />

          <div className="flex justify-end mt-3 md:mt-4">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-5 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl bg-primary text-white font-bold text-sm md:text-base shadow hover:shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              ارسال نظر
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-complementary/10 border-2 border-complementary/20 rounded-2xl md:rounded-3xl p-5 md:p-6 text-center mb-8 md:mb-10">
          <p className="text-complementary text-sm md:text-base font-medium mb-3">
            برای ثبت نظر وارد شوید
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="px-5 py-2 md:px-6 md:py-2 bg-primary rounded-xl text-white font-bold text-sm md:text-base shadow hover:bg-primary/90 transition"
          >
            ورود / ثبت نام
          </button>
        </div>
      )}

      <div className="space-y-4 md:space-y-5">
        {comments.length ? (
          comments.map((c: any) => (
            <div
              key={c.id}
              className="border-2 border-gray-200 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm md:text-base text-dark">{c.userName}</h4>
                    <p className="text-xs md:text-sm text-dark/50">
                      {formatDate(c.createdAt)}
                    </p>
                  </div>
                </div>

                {user && c.userId === user.id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1.5 md:p-2 rounded-lg hover:bg-complementary/10 text-complementary transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm md:text-base text-dark/80 leading-relaxed text-right">
                {c.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center p-6 md:p-10 border-2 border-dashed rounded-2xl md:rounded-3xl bg-light text-dark/50">
            <MessageSquare className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-40" />
            <span className="text-sm md:text-base">هنوز نظری ثبت نشده است</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StickyBookingBox({ experience, ratingData = { rating: 0, totalRatings: 0 }, guests, setGuests, onReserve }: any) {
  const totalPrice = experience.price ? experience.price * guests : 0;

  return (
    <div className="bg-white/70 backdrop-blur-xl shadow-xl border border-white/40 rounded-3xl p-8 sticky top-24">
      <div className="text-center mb-6">
        <div className="flex justify-center items-baseline mb-2">
          <span className="text-4xl font-black text-dark">
            {experience.price ? experience.price.toLocaleString("fa-IR") : "رایگان"}
          </span>
          <span className="text-lg text-dark/50 mr-2">تومان</span>
        </div>
        <p className="text-dark/50 text-sm">قیمت پایه برای هر نفر</p>
      </div>

      {ratingData.totalRatings > 0 && (
        <div className="mb-6 flex justify-center">
          <StarRating
            rating={ratingData.rating}
            totalRatings={ratingData.totalRatings}
            size="md"
          />
        </div>
      )}

      {/* انتخاب تعداد نفرات */}
      <div className="flex items-center justify-between p-4 mb-4 bg-light rounded-2xl border border-gray-200">
        <span className="font-medium text-dark/80">تعداد نفرات</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGuests((g: number) => Math.max(1, g - 1))}
            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-dark/60 hover:bg-gray-100 transition"
          >
            -
          </button>
          <span className="font-bold text-lg w-4 text-center text-dark">{guests}</span>
          <button
            onClick={() => setGuests((g: number) => g + 1)}
            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-dark/60 hover:bg-gray-100 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* جمع کل */}
      <div className="flex items-center justify-between mb-6 px-2">
        <span className="font-bold text-dark/90">جمع کل:</span>
        <span className="font-black text-xl text-primary">
          {totalPrice > 0 ? totalPrice.toLocaleString("fa-IR") + " تومان" : "رایگان"}
        </span>
      </div>

      <button
        onClick={onReserve}
        className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary/90 transition-all mb-6"
      >
        تایید و ادامه
      </button>

      <div className="border-t border-gray-300 pt-6 text-sm space-y-4">
        <InfoRow
          label="تاریخ"
          value={experience?.date ? new Date(experience.date).toLocaleDateString("fa-IR") : "در حال بارگذاری..."}
          color="primary"
        />
        <InfoRow label="ساعت" value={experience.time} color="complementary" />
        <InfoRow label="مدت زمان" value={experience.duration} color="primary" />
        <InfoRow label="شهر" value={experience.city} />
        <InfoRow label="میزبان" value={experience.providerName || experience.provider_name} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dark/60">{label}</span>
      <span
        className={`font-bold ${
          color ? `text-${color}` : "text-dark/90"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
