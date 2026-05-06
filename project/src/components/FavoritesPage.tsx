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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-800">
            تجربه‌های موردعلاقه شما
          </h1>
          <p className="text-lg text-gray-500 mt-4">
            لیست فعالیت‌هایی که ذخیره کرده‌اید تا فراموششان نکنید.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p>در حال بارگذاری...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-bold mb-2">
              هنوز هیچ موردی را نپسندیده‌اید!
            </p>
            <p className="text-gray-500">
              با کلیک روی آیکون قلب در کنار هر تجربه، آن را به اینجا اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map(exp => (
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
