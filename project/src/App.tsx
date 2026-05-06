import { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatWidget from './components/ChatWidget';
import HomePage from './pages/HomePage';
import ExperiencesPage from './pages/ExperiencesPage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import WriteExperiencePage from './pages/WriteExperiencePage';
import FavoritesPage from './components/FavoritesPage';
import ProviderDashboard from './pages/ProviderDashboard';
import TouristDashboard from './pages/TouristDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AIChatPage from './pages/AIChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProviderSignupPage from './pages/ProviderSignupPage';
import ArticlesPage from './pages/ArticlesPage';
import WriteArticlePage from './pages/WriteArticlePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import TravelStoriesPage from './pages/TravelStoriesPage';
import WriteStoryPage from './pages/WriteStoryPage';
import AboutPage from './pages/about';
import StoryDetailPage from './pages/StoryDetailPage';
import { useAuth } from './contexts/AuthContext';
import MizbanPublicProfilePage from './pages/MizbanPublicProfilePage';
import EditExperiencePage from './pages/EditExperiencePage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';

// نوع 'checkout' به لیست صفحه‌ها اضافه شد
type Page = 'home' | 'experiences' | 'experience-detail' | 'write-experience' | 'provider-dashboard' |
 'tourist-dashboard' | 'admin-dashboard' | 'profile' | 'ai-chat' | 'login' | 'signup' |
  'provider-signup' | 'articles' | 'write-article' | 'article-detail' | 'travel-stories' | 'write-story' |
   'story-detail' | 'favorites' | 'about' | 'mizban-profile' | 'edit-experience' | 'checkout' | 'payment-verify';

function App() {
  // گرفتن اطلاعات کاربر (در صورت وجود) از کانتکست
  const { loading, user } = useAuth() as any;

  const getInitialPage = (): Page => {
    const hash = window.location.hash.slice(1).split('?')[0];
    const stored = localStorage.getItem('currentPage');
    if (hash) return hash as Page;
    if (stored) return stored as Page;
    return 'home';
  };

  const getInitialExperienceId = (): string => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (window.location.hash.startsWith('#experience-detail') && id) return id;
    return localStorage.getItem('selectedExperienceId') || '';
  };

  const getInitialArticleId = (): string => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (window.location.hash.startsWith('#article-detail') && id) return id;
    return localStorage.getItem('selectedArticleId') || '';
  };

  const getInitialStoryId = (): string => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (window.location.hash.startsWith('#story-detail') && id) return id;
    return localStorage.getItem('selectedStoryId') || '';
  };

  const getInitialMizbanId = (): string => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (window.location.hash.startsWith('#mizban-profile') && id) return id;
    return localStorage.getItem('selectedMizbanId') || '';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(getInitialExperienceId());
  const [selectedArticleId, setSelectedArticleId] = useState<string>(getInitialArticleId());
  const [selectedStoryId, setSelectedStoryId] = useState<string>(getInitialStoryId());
  const [selectedMizbanId, setSelectedMizbanId] = useState<string>(getInitialMizbanId());

  // State مربوط به اطلاعات پرداخت/رزرو که در sessionStorage هم ذخیره می‌شود تا با رفرش نپرد
  const [checkoutData, setCheckoutData] = useState<any>(() => {
    const savedData = sessionStorage.getItem('checkoutData');
    return savedData ? JSON.parse(savedData) : null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | 'provider-signup'>('login');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1).split('?')[0];
      if (hash) {
        setCurrentPage(hash as Page);
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const id = params.get('id');
        if (id) {
          if (hash === 'experience-detail') setSelectedExperienceId(id);
          if (hash === 'edit-experience') setSelectedExperienceId(id);
          if (hash === 'article-detail') setSelectedArticleId(id);
          if (hash === 'story-detail') setSelectedStoryId(id);
          if (hash === 'mizban-profile') setSelectedMizbanId(id);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // پارامتر دوم از idOrExperienceId به idOrData تغییر یافت تا بتواند آبجکت اطلاعات رزرو را هم بگیرد
  const handleNavigate = (page: string, idOrData?: any, city?: string) => {
    if (page === 'login' || page === 'signup' || page === 'provider-signup') {
      setAuthModalType(page as 'login' | 'signup' | 'provider-signup');
      setShowAuthModal(true);
      return;
    }

    setCurrentPage(page as Page);
    localStorage.setItem('currentPage', page);

    if (page === 'checkout') {
      if (idOrData) {
        setCheckoutData(idOrData);
        sessionStorage.setItem('checkoutData', JSON.stringify(idOrData));
      }
      window.location.hash = 'checkout';

    } else if (page === 'article-detail' && idOrData) {
      setSelectedArticleId(idOrData);
      localStorage.setItem('selectedArticleId', idOrData);
      window.location.hash = `${page}?id=${idOrData}`;

    } else if ((page === 'experience-detail' || page === 'edit-experience') && idOrData) {
      setSelectedExperienceId(idOrData);
      localStorage.setItem('selectedExperienceId', idOrData);
      window.location.hash = `${page}?id=${idOrData}`;

    } else if (page === 'story-detail' && idOrData) {
      setSelectedStoryId(idOrData);
      localStorage.setItem('selectedStoryId', idOrData);
      window.location.hash = `${page}?id=${idOrData}`;

    } else if (page === 'mizban-profile' && idOrData) {
      setSelectedMizbanId(idOrData);
      localStorage.setItem('selectedMizbanId', idOrData);
      window.location.hash = `${page}?id=${idOrData}`;

    } else if (city) {
      window.location.hash = `${page}?city=${encodeURIComponent(city)}`;
    } else {
      window.location.hash = page;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthNavigate = (type: 'login' | 'signup' | 'provider-signup') => {
    setAuthModalType(type);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <ChatWidget />

      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'experiences' && <ExperiencesPage onNavigate={handleNavigate} />}

      {currentPage === 'experience-detail' && (
        <ExperienceDetailPage experienceId={selectedExperienceId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'write-experience' && <WriteExperiencePage onNavigate={handleNavigate} />}

      {currentPage === 'edit-experience' && (
        <EditExperiencePage experienceId={selectedExperienceId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'provider-dashboard' && <ProviderDashboard onNavigate={handleNavigate} />}
      {currentPage === 'tourist-dashboard' && <TouristDashboard />}
      {currentPage === 'admin-dashboard' && <AdminDashboard />}
      {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
      {currentPage === 'ai-chat' && <AIChatPage onNavigate={handleNavigate} />}
      {currentPage === 'articles' && <ArticlesPage onNavigate={handleNavigate} />}
      {currentPage === 'write-article' && <WriteArticlePage onNavigate={handleNavigate} />}

      {currentPage === 'article-detail' && (
        <ArticleDetailPage articleId={selectedArticleId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'travel-stories' && <TravelStoriesPage onNavigate={handleNavigate} />}
      {currentPage === 'write-story' && <WriteStoryPage onNavigate={handleNavigate} />}

      {currentPage === 'story-detail' && (
        <StoryDetailPage storyId={selectedStoryId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'mizban-profile' && (
        <MizbanPublicProfilePage mizbanId={selectedMizbanId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'favorites' && <FavoritesPage onNavigate={handleNavigate} />}
      {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}

      {/* کامپوننت مربوط به صفحه پرداخت اضافه شد */}
      {currentPage === 'checkout' && (
        <CheckoutPage data={checkoutData} user={user} onNavigate={handleNavigate} />
      )}

      {currentPage === 'payment-verify' && (
        <PaymentVerifyPage onNavigate={handleNavigate} />
      )}

      {showAuthModal && authModalType === 'login' && (
        <LoginPage onNavigate={handleAuthNavigate} onClose={handleCloseAuthModal} />
      )}
      {showAuthModal && authModalType === 'signup' && (
        <SignupPage onNavigate={handleAuthNavigate} onClose={handleCloseAuthModal} />
      )}
      {showAuthModal && authModalType === 'provider-signup' && (
        <ProviderSignupPage
          onClose={handleCloseAuthModal}
          onNavigateToLogin={() => setAuthModalType('login')}
        />
      )}
    </div>
  );
}

export default App;
