import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User, MapPin, Eye, Heart, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext'; // اضافه شدن useAuth

interface Story {
  id: string;
  title: string;
  content: string;
  location: string;
  image: string;
  authorName: string; // استانداردسازی نام‌ها
  authorId: number;
  views: number;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

interface StoryDetailPageProps {
  storyId: string;
  onNavigate: (page: string) => void;
}

export default function StoryDetailPage({ storyId, onNavigate }: StoryDetailPageProps) {
  const { user } = useAuth(); // استفاده از کانتکست به جای localStorage
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/`, { headers });
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات داستان');

        const data = await response.json();
        // یکپارچه‌سازی کلیدها هنگام دریافت از API
        setStory({
          id: data.id,
          title: data.title,
          content: data.content,
          location: data.location,
          image: data.image,
          authorName: data.author_name,
          authorId: data.author,
          views: data.views,
          likes: data.likes_count,
          isLiked: data.is_liked,
          createdAt: data.created_at,
        });
      } catch (err) {
        setError('خطا در بارگذاری داستان یا داستان مورد نظر یافت نشد');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId]);

  const handleLike = async () => {
    if (!user) {
      alert('برای لایک کردن باید وارد حساب کاربری شوید');
      return;
    }
    if (!story) return;

    try {
      setIsLiking(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/like/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` || '' },
      });

      if (response.ok) {
        const data = await response.json();
        setStory(prev => prev ? { ...prev, isLiked: data.is_liked, likes: data.likes_count } : null);
      }
    } catch (err) {
      console.error('خطا در لایک:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این داستان اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` || '' },
      });

      if (response.ok || response.status === 204) {
        alert('داستان با موفقیت حذف شد');
        onNavigate('travel-stories');
      } else {
        alert('شما اجازه حذف این داستان را ندارید');
      }
    } catch (err) {
      console.error('خطا در حذف:', err);
      alert('خطا در حذف داستان. لطفاً دوباره تلاش کنید.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(dateString));
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !story) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-complementary font-bold px-4 text-center">
      <p>{error || 'داستان پیدا نشد'}</p>
      <button
        onClick={() => onNavigate('travel-stories')}
        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition"
      >
        بازگشت به داستان‌ها
      </button>
    </div>
  );

  const isAuthor = user && story.authorId && user.id === story.authorId;

  return (
    <div className="min-h-screen bg-light pb-24 pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* دکمه بازگشت */}
        <button
          onClick={() => onNavigate('travel-stories')}
          className="group flex items-center gap-2 text-dark/60 hover:text-primary mb-6 transition-all font-medium bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow w-max border border-dark/10"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>بازگشت به داستان‌ها</span>
        </button>

        {/* عکس داستان */}
        <div className="w-full h-[45vh] min-h-[350px] rounded-3xl overflow-hidden shadow-lg mb-8 border-4 border-white bg-dark/5">
          <img
            src={getImageUrl(story.image)}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* کادر اصلی محتوا */}
        <div className="bg-white rounded-3xl shadow-sm border border-dark/10 p-8 md:p-12 lg:px-16">

          {/* اطلاعات داستان */}
          <div className="mb-12 border-b border-dark/10 pb-8">
            <div className="flex items-center gap-2 text-primary mb-4 font-medium bg-primary/10 w-max px-4 py-2 rounded-full border border-primary/20">
              <MapPin className="w-5 h-5" />
              <span>{story.location}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-dark">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-dark/60 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>{story.authorName}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-dark/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{formatDate(story.createdAt)}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-dark/20 hidden sm:block"></div>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all duration-300 ${
                  story.isLiked
                    ? 'bg-complementary/10 text-complementary border border-complementary/20'
                    : 'bg-white text-dark/70 hover:text-complementary hover:bg-complementary/10 border border-dark/20 hover:border-complementary/20'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    story.isLiked ? 'fill-current text-complementary' : 'text-dark/40 group-hover:text-complementary/80'
                  }`}
                />
                <span className="text-sm mt-0.5">{story.likes}</span>
              </button>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <span>{story.views} بازدید</span>
              </div>
            </div>
          </div>

          {/* متن داستان */}
          <div className="prose prose-lg md:prose-xl max-w-none text-dark/80 leading-loose text-justify font-normal">
            {story.content.split('\n').map((paragraph, index) =>
              paragraph.trim() ? <p key={index} className="mb-8">{paragraph}</p> : null
            )}
          </div>

          {/* دکمه حذف */}
          {isAuthor && (
            <div className="mt-12 flex justify-end">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-complementary/10 text-complementary hover:bg-complementary hover:text-white rounded-full font-medium transition-all"
                title="حذف داستان"
              >
                <Trash2 className="w-5 h-5" />
                <span>حذف داستان</span>
              </button>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
