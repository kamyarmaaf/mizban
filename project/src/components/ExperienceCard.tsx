import { MapPin, Heart, Calendar, Clock } from 'lucide-react';
import { Experience } from '../types';
import { useState } from 'react';
import StarRating from './StarRating';
import dayjs from "../utils/dayjs-jalali";

interface ExperienceCardProps {
  experience: Experience;
  onViewDetails: (id: string) => void;
}

export default function ExperienceCard({ experience, onViewDetails }: ExperienceCardProps) {
  const [isLiked, setIsLiked] = useState(experience.is_favorited || false);
  const [isLiking, setIsLiking] = useState(false);

  const persianDate = dayjs(experience.date)
    .calendar("jalali")
    .format("YYYY/MM/DD");

  const isFull = experience.capacity <= 0;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('برای افزودن به علاقه‌مندی‌ها باید وارد شوید.');
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/experiences/${experience.id}/favorite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLiked(prev => !prev);
      }
    } catch (error) {
      console.error('Error liking experience:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="group h-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col">

      {/* بخش عکس */}
      <div
        className="relative h-36 sm:h-48 md:h-56 shrink-0 overflow-hidden cursor-pointer"
        onClick={() => !isFull && onViewDetails(experience.id)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* عکس تجربه */}
        <img
          src={experience.image}
          alt={experience.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isFull ? "grayscale opacity-70" : "group-hover:scale-110"
          }`}
        />

        {/* دکمه قلب */}
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className="absolute top-2 left-2 md:top-4 md:left-4 p-1.5 md:p-2.5 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all z-20 hover:scale-110 active:scale-95 shadow-lg"
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-all ${isLiked ? 'fill-complementary text-complementary scale-110' : 'text-dark/60'}`} />
        </button>

        {/* نمایش دسته‌بندی */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 px-2 py-1 md:px-4 md:py-2 glass-effect rounded-full text-[10px] md:text-sm font-bold text-dark z-20 shadow-md">
          {experience.category}
        </div>

        {/* نشانگر تکمیل ظرفیت */}
        {isFull && (
          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-red-600 text-white px-3 py-1 text-xs md:text-sm rounded-full z-20 shadow-xl font-bold">
            تکمیل ظرفیت
          </div>
        )}
      </div>

      {/* بخش توضیحات */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">

        <h3
          className={`font-bold md:font-black text-sm sm:text-base md:text-xl mb-1.5 md:mb-3 line-clamp-1 cursor-pointer min-h-[28px] ${
            isFull ? "text-dark/40" : "text-dark group-hover:text-primary"
          } transition-colors`}
          onClick={() => !isFull && onViewDetails(experience.id)}
        >
          {experience.title}
        </h3>

        <p className="text-dark/70 text-[11px] md:text-sm mb-3 md:mb-4 line-clamp-2 leading-relaxed min-h-[40px]">
          {experience.description}
        </p>

        {experience.rating && (
          <div className="mb-3 md:mb-4">
            <StarRating rating={experience.rating} totalRatings={experience.totalRatings} size="sm" />
          </div>
        )}

        <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-5 mt-auto">
          <div className="flex items-center gap-1.5 md:gap-2 text-dark/60 text-xs md:text-sm bg-light rounded-lg px-2 py-1.5 md:px-3 md:py-2">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="font-medium truncate">{experience.province}، {experience.city}</span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="flex items-center justify-center gap-1 text-dark/70 bg-light rounded-lg px-1.5 py-1 md:px-2.5 md:py-1.5 flex-1 truncate">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-xs truncate">{persianDate}</span>
            </div>

            <div className="flex items-center justify-center gap-1 text-dark/70 bg-light rounded-lg px-1.5 py-1 md:px-2.5 md:py-1.5 flex-1 truncate">
              <Clock className="w-3 h-3 text-complementary" />
              <span className="text-xs truncate">{experience.time}</span>
            </div>
          </div>
        </div>

        {/* قیمت و دکمه */}
        <div className="flex flex-wrap items-end justify-between gap-2 pt-3 md:pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className={`text-base sm:text-xl md:text-3xl font-black ${isFull ? "text-dark/40" : "text-dark"}`}>
              {experience.price.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] md:text-sm font-medium text-dark/60 mt-1">تومان / نفر</span>
          </div>

          <button
            disabled={isFull}
            onClick={() => onViewDetails(experience.id)}
            className={`px-3 py-1.5 md:px-5 md:py-3 rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold transition-all ${
              isFull
                ? "bg-dark/10 text-dark/40 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            {isFull ? "تکمیل ظرفیت" : "مشاهده"}
          </button>
        </div>

      </div>
    </div>
  );
}
