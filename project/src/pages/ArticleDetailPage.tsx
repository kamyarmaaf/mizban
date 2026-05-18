import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User, MapPin, Eye, Heart, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

interface Article {
  id: string;
  title: string;
  content: string;
  image: string;
  authorName: string;
  authorId: number | string;
  createdAt: string;
  location: string;
  views: number;
  likes: number;
  isLiked?: boolean;
}

interface ArticleDetailPageProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

export default function ArticleDetailPage({ articleId, onNavigate }: ArticleDetailPageProps) {
  const { user } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`http://127.0.0.1:8000/api/articles/${articleId}/`, { headers });

        if (!res.ok) throw new Error('خطا در دریافت اطلاعات مقاله');

        const data = await res.json();

        setArticle({
          id: data.id.toString(),
          title: data.title,
          content: data.content,
          image: data.cover_image || '',
          authorName: data.author_name,
          authorId: data.author,
          createdAt: data.created_at,
          location: data.address || '',
          views: data.views,
          likes: data.likes_count,
          isLiked: data.is_liked,
        });
      } catch (e) {
        setError('مقاله پیدا نشد یا خطا در بارگذاری');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  const handleLike = async () => {
    if (!article) return;
    if (!user) {
      alert('برای لایک کردن باید وارد حساب کاربری شوید');
      return;
    }

    try {
      setIsLiking(true);
      const token = localStorage.getItem('access_token');

      const res = await fetch(`http://127.0.0.1:8000/api/articles/${articleId}/like/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` || '' },
      });

      if (res.ok) {
        const data = await res.json();
        setArticle(prev => prev ? { ...prev, likes: data.likes_count, isLiked: data.is_liked } : prev);
      }
    } catch (err) {
      console.error('خطا در لایک:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/articles/${articleId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` || '' },
      });

      if (res.ok || res.status === 204) {
        alert('مقاله با موفقیت حذف شد');
        onNavigate('articles');
      } else {
        alert('شما اجازه حذف این مقاله را ندارید');
      }
    } catch (err) {
      alert('خطا در حذف مقاله');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !article) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-complementary font-bold px-4 text-center">
      <p>{error || 'مقاله پیدا نشد'}</p>
      <button
        onClick={() => onNavigate('articles')}
        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition"
      >
        بازگشت به مقاله‌ها
      </button>
    </div>
  );

  const isAuthor = user && (user.id === article.authorId || user.role === 'admin');

  return (
    <div className="min-h-screen bg-light pb-24 pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* دکمه بازگشت */}
        <button
          onClick={() => onNavigate('articles')}
          className="group flex items-center gap-2 text-dark/60 hover:text-primary mb-6 transition-all font-medium bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow w-max border border-dark/10"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>بازگشت به مقاله‌ها</span>
        </button>

        {/* عکس مقاله */}
        {article.image && (
          <div className="w-full h-[45vh] min-h-[350px] rounded-3xl overflow-hidden shadow-lg mb-8 border-4 border-white bg-dark/5">
            <img
              src={getImageUrl(article.image)}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        )}

        {/* کادر محتوای اصلی */}
        <div className="bg-white rounded-3xl shadow-sm border border-dark/10 p-8 md:p-12 lg:px-16">

          {/* اطلاعات مقاله */}
<div className="mb-6 border-b border-dark/10 pb-6">
  {article.location && (
    <div className="flex items-center gap-2 text-primary mb-4 font-medium bg-primary/10 w-max px-4 py-2 rounded-full border border-primary/20">
      <MapPin className="w-5 h-5" />
      <span>{article.location}</span>
    </div>
  )}

  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-dark">
    {article.title}
  </h1>

  <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-dark/60 font-medium mb-4">
    <div className="flex items-center gap-2">
      <User className="w-5 h-5 text-primary" />
      <span>{article.authorName}</span>
    </div>
    <div className="w-1.5 h-1.5 rounded-full bg-dark/20 hidden sm:block"></div>
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-primary" />
      <span>{formatDate(article.createdAt)}</span>
    </div>
    <div className="w-1.5 h-1.5 rounded-full bg-dark/20 hidden sm:block"></div>
    <div className="flex items-center gap-2">
      <Eye className="w-5 h-5 text-primary" />
      <span>{article.views} بازدید</span>
    </div>

    {/* دکمه لایک همینجا */}
    <button
      onClick={handleLike}
      disabled={isLiking}
      className={`ml-6 flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition duration-300 shadow-sm hover:shadow-md ${
        article.isLiked
          ? 'bg-complementary/10 text-complementary border border-complementary/20'
          : 'bg-white text-dark/60 hover:text-complementary hover:bg-complementary/10 border border-dark/10 hover:border-complementary/20'
      }`}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-300 hover:scale-110 ${
          article.isLiked ? 'fill-current text-complementary' : 'text-dark/40'
        }`}
      />
      <span className="text-base font-semibold">{article.likes}</span>
    </button>
  </div>
</div>


          {/* متن مقاله */}
          <div className="prose prose-lg md:prose-xl max-w-none text-dark/80 leading-loose text-justify font-normal">
            {article.content.split('\n').map((p, i) => p.trim() ? <p key={i} className="mb-8">{p}</p> : null)}
          </div>

          {/* دکمه‌های لایک و حذف */}
          <div className="mt-8 flex flex-wrap items-center gap-4">

            {/* دکمه حذف */}
            {isAuthor && (
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-complementary text-white rounded-xl font-semibold hover:bg-complementary/90 transition"
                title="حذف مقاله"
              >
                <Trash2 className="inline w-5 h-5 ml-2" />
                حذف مقاله
              </button>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
