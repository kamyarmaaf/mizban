import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User, MapPin, Eye, Heart, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';

interface Story {
  id: string;
  title: string;
  content: string;
  location: string;
  image: string;
  author_name: string;
  author: number;
  views: number;
  likes_count: number;
  is_liked?: boolean;
  created_at: string;
}

interface StoryDetailPageProps {
  storyId: string;
  onNavigate: (page: string) => void;
}

export default function StoryDetailPage({ storyId, onNavigate }: StoryDetailPageProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/`, { headers });

        if (!response.ok) throw new Error('خطا در دریافت اطلاعات داستان');

        const data = await response.json();
        setStory(data);
      } catch (err) {
        setError('خطا در بارگذاری داستان');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  const handleLike = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('برای لایک کردن باید وارد حساب کاربری شوید');
      return;
    }

    try {
      setIsLiking(true);
      const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStory(prev => prev ? { ...prev, is_liked: data.is_liked, likes_count: data.likes_count } : null);
      }
    } catch (err) {
      console.error('خطا در لایک:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این داستان اطمینان دارید؟')) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stories/${storyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !story) return (
    <div className="min-h-screen flex items-center justify-center pt-20 text-red-500 font-bold">
      {error || 'داستان پیدا نشد'}
    </div>
  );

  const isAuthor = currentUserId && story.author && story.author.toString() === currentUserId;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* دکمه بازگشت */}
        <button
          onClick={() => onNavigate('travel-stories')}
          className="group flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 transition-all font-medium bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow w-max border border-gray-100"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>بازگشت به داستان‌ها</span>
        </button>

        {/* عکس داستان (فقط عکس بدون متن) */}
        <div className="w-full h-[45vh] min-h-[350px] rounded-3xl overflow-hidden shadow-lg mb-8 border-4 border-white bg-gray-100">
          <img
            src={getImageUrl(story.image)}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* کادر اصلی محتوا */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 lg:px-16">

          {/* اطلاعات داستان (منتقل شده به زیر عکس) */}
          <div className="mb-12 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2 text-emerald-700 mb-4 font-medium bg-emerald-50 w-max px-4 py-2 rounded-full border border-emerald-100">
              <MapPin className="w-5 h-5" />
              <span>{story.location}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                <span>{story.author_name}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>{formatDate(story.created_at)}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></div>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all duration-300 ${
                  story.is_liked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-white text-gray-600 hover:text-rose-500 hover:bg-rose-50 border border-gray-200 hover:border-rose-200'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    story.is_liked ? 'fill-current text-rose-500' : 'text-gray-400 group-hover:text-rose-400'
                  }`}
                />
                <span className="text-sm mt-0.5">{story.likes_count}</span>
              </button>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-500" />
                <span>{story.views} بازدید</span>
              </div>
            </div>
          </div>

          {/* متن داستان */}
          <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-loose text-justify font-normal">
            {story.content.split('\n').map((paragraph, index) =>
              paragraph.trim() ? <p key={index} className="mb-8">{paragraph}</p> : null
            )}
          </div>

          {/* دکمه حذف */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="mt-8 flex items-center gap-2 px-6 py-3 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full font-medium transition-colors"
              title="حذف داستان"
            >
              <Trash2 className="w-5 h-5" />
              حذف داستان
            </button>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
