import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Experience } from '../types';
import ExperienceCard from './ExperienceCard';

interface FavoritesPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/favorites/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // اگر data خودش آرایه است که همون رو استفاده کن، در غیر این صورت data.results رو بگیر
          const favoritesArray = Array.isArray(data) ? data : (data.results || []);

          const likedExperiences = favoritesArray.map((exp: any) => {
            const rawImageUrl = exp.images?.find((img: any) => img.is_cover)?.image || exp.images?.[0]?.image;

            const finalImageUrl = rawImageUrl
              ? (rawImageUrl.startsWith('http') ? rawImageUrl : `http://127.0.0.1:8000${rawImageUrl}`)
              : ''; // یا placeholder اگر داری

            return {
              ...exp,
              image: finalImageUrl,
              liked: true
            };
          });

          setFavorites(likedExperiences);

        } else {
          console.error('Failed to fetch favorites');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleViewDetails = (id: string) => {
    onNavigate('experience-detail', id);
  };

  return (
    <div className="min-h-screen bg-light/20 pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر صفحه */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-complementary/10 rounded-2xl mb-6">
            <Heart className="w-8 h-8 text-complementary fill-complementary/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-dark mb-4 tracking-tight">
            تجربه‌های موردعلاقه شما
          </h1>
          <p className="text-lg text-dark/60 font-medium max-w-2xl mx-auto mt-4">
            لیست فعالیت‌هایی که ذخیره کرده‌اید تا در فرصت مناسب به سراغشان بروید و فراموششان نکنید.
          </p>
        </div>

        {loading ? (
          /* حالت در حال بارگذاری */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-light border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-dark/50 font-bold text-lg">در حال بارگذاری علاقه‌مندی‌ها...</p>
          </div>
        ) : favorites.length === 0 ? (
          /* حالت لیست خالی */
          <div className="text-center py-20 bg-white rounded-3xl border border-light shadow-soft max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-light/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-light/50">
              <Heart className="w-10 h-10 text-dark/30" strokeWidth={1.5} />
            </div>
            <p className="text-dark text-2xl font-bold mb-3">
              هنوز هیچ موردی را نپسندیده‌اید!
            </p>
            <p className="text-dark/50 font-medium px-6">
              با کلیک روی آیکون قلب در کنار هر تجربه، آن را به این لیست اضافه کنید.
            </p>
          </div>
        ) : (
          /* لیست علاقه‌مندی‌ها */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {favorites.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
