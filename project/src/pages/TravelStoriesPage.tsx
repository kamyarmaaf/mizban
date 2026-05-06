import { useState, useEffect } from 'react';
import { BookOpen, Plus, Eye, Heart, Calendar, User, MapPin } from 'lucide-react';
import Footer from '../components/Footer';

interface TravelStory {
  id: string;
  title: string;
  content: string;
  location: string;
  authorName: string;
  image: string;
  views: number;
  likes: number;
  createdAt: Date;
}

interface TravelStoriesPageProps {
  onNavigate: (page: string, storyId?: string) => void;
}

export default function TravelStoriesPage({ onNavigate }: TravelStoriesPageProps) {

  const [stories, setStories] = useState<TravelStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const pageSize = 9;

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/stories/?page=${page}`
        );

        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات');
        }

        const data = await response.json();

        setNextPage(data.next);
        setPrevPage(data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));

        const formattedStories: TravelStory[] = data.results.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          content: item.content,
          location: item.location,
          authorName: item.author_name || 'کاربر ناشناس',
          image: item.image,
          views: item.views || 0,
          likes: item.likes_count || 0,
          createdAt: new Date(item.created_at)
        }));

        setStories(formattedStories);

      } catch (err) {
        console.error(err);
        setError('متاسفانه در دریافت داستان‌ها مشکلی پیش آمد.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [page]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  useEffect(() => {
    const currentPath = window.location.hash.slice(1).split('?')[0] || 'travel-stories';
    const newHash = `#${currentPath}?page=${page}`;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">

      <div className="relative bg-gradient-to-br from-primary via-primary to-primary py-20">

        <div className="relative max-w-7xl mx-auto px-4 text-center">

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            داستان‌های سفر
          </h1>

          <p className="text-xl text-white/90 mb-8">
            سفرهای خود را با ما به اشتراک بگذارید
          </p>

          <button
            onClick={() => onNavigate('write-story')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-complementary rounded-2xl font-black text-lg hover:bg-gray-50 transition"
          >
            <Plus className="w-5 h-5" />
            نوشتن داستان جدید
          </button>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-complementary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-bold text-xl">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {stories.map((story) => (
                <button
                  key={story.id}
                  className="bg-white rounded-3xl overflow-hidden shadow hover:-translate-y-2 transition text-right"
                  onClick={() => onNavigate('story-detail', story.id)}
                >

                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-4 flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4" />
                      {story.location}
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-black text-dark mb-2">
                      {story.title}
                    </h2>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {story.content}
                    </p>

                    <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {story.authorName}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {story.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {story.likes}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(story.createdAt)}
                      </div>
                    </div>
                  </div>

                </button>
              ))}

            </div>

            {/* pagination */}
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                disabled={!prevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 border rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                صفحه قبل
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl border font-bold transition
                  ${p === page
                    ? "bg-complementary text-white border-complementary"
                    : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={!nextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                صفحه بعد
              </button>
            </div>
          </>
        )}

      </div>

      <Footer />

    </div>
  );
}
