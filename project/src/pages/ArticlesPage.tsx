import { useState, useEffect } from 'react';
import { BookOpen, Plus, Eye, Heart, Calendar, User, Search, MapPin } from 'lucide-react';
import { Article } from '../types/article';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

interface ArticlesPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export default function ArticlesPage({ onNavigate }: ArticlesPageProps) {
  const { user } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  const pageSize = 10;

  const loadAllArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/articles/?page=${page}`);

      if (!response.ok) {
        throw new Error('خطا در دریافت لیست مقالات');
      }

      const data = await response.json();

      setNextPage(data.next);
      setPrevPage(data.previous);
      setTotalPages(Math.ceil(data.count / pageSize));

      const formattedArticles = data.results.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        content: item.content,
        image: item.cover_image,
        authorName: item.author_name,
        createdAt: new Date(item.created_at),
        location: item.address || '',
        views: item.views || 0,
        likes: item.likes_count || 0,
      }));

      setArticles(formattedArticles);

    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllArticles();
  }, [page]);

  useEffect(() => {
    // اسم صفحه فعلی رو از هش می‌گیریم
    const currentPath = window.location.hash.slice(1).split('?')[0] || 'articles';

    const newHash = `#${currentPath}?page=${page}`;

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
  }, [page]);

  const filteredArticles = searchTerm
    ? articles.filter(a =>
        a.title.includes(searchTerm) ||
        a.content.includes(searchTerm) ||
        (a.location && a.location.includes(searchTerm))
      )
    : articles;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">

      <div className="relative bg-gradient-to-br from-primary via-primary to-primary py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 text-center">

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            بلاگ میزبان
          </h1>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            مکان های دیدنی ایران
          </p>

          {user && (
            <button
              onClick={() => onNavigate('write-article')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-complementary rounded-2xl font-black text-lg hover:bg-gray-50 transition"
            >
              <Plus className="w-5 h-5" />
              نوشتن مقاله جدید
            </button>
          )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">

            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در مقالات..."
              className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-right outline-none transition"
            />

          </div>
        </div>

        {loading ? (

          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-complementary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
          </div>

        ) : (

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {filteredArticles.map((article) => (

              <button
                key={article.id}
                className="bg-white rounded-3xl overflow-hidden shadow hover:-translate-y-2 transition text-right"
                onClick={() => onNavigate('article-detail', article.id)}
              >

                {article.image && (
                  <div className="relative h-40 overflow-hidden">

                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />

                    {article.location && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs text-dark font-medium">
                        <MapPin className="w-3 h-3 text-complementary" />
                        {article.location}
                      </div>
                    )}

                  </div>
                )}

                <div className="p-6">

                  <h2 className="text-xl font-black text-dark mb-2">
                    {article.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {article.content}
                  </p>

                  <div className="flex items-center gap-1 mb-1 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    {article.authorName}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">

                    <div className="flex items-center gap-4 text-sm text-gray-500">

                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views}
                      </div>

                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {article.likes}
                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.createdAt)}
                    </div>

                  </div>

                </div>

              </button>

            ))}

          </div>

        )}

        {/* PAGINATION */}

        <div className="flex items-center justify-center gap-3 mt-12">

          <button
            disabled={!prevPage}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40 transition"
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
            className="px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40 transition"
          >
            صفحه بعد
          </button>

        </div>

      </div>

      <Footer />

    </div>
  );
}
