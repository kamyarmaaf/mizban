import { useState, useEffect } from 'react';
import { Send, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';

interface Comment {
  id: string;
  experience_id: string;
  user_id: string;
  user_name: string;
  comment_text: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface CommentsProps {
  experienceId: string;
}

export default function Comments({ experienceId }: CommentsProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    loadComments();
  }, [experienceId]);

  const loadComments = async () => {
    setLoadingComments(true);

    const savedComments = localStorage.getItem('allComments');
    const allComments = savedComments ? JSON.parse(savedComments) : [];
    const experienceComments = allComments
      .filter((c: Comment) => c.experience_id === experienceId)
      .sort((a: Comment, b: Comment) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    setComments(experienceComments);
    setLoadingComments(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      alert('لطفا ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    if (!newComment.trim()) {
      alert('لطفا متن کامنت را وارد کنید');
      return;
    }

    setLoading(true);

    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      experience_id: experienceId,
      user_id: user.id,
      user_name: profile.full_name,
      comment_text: newComment.trim(),
      rating: newRating > 0 ? newRating : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const allComments = [...comments, newCommentObj];
    setComments(allComments);

    const savedComments = localStorage.getItem('allComments');
    const existingComments = savedComments ? JSON.parse(savedComments) : [];
    localStorage.setItem('allComments', JSON.stringify([...existingComments, newCommentObj]));

    setNewComment('');
    setNewRating(0);
    setLoading(false);
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment_text);
    setEditRating(comment.rating || 0);
  };

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) {
      alert('لطفا متن کامنت را وارد کنید');
      return;
    }

    const savedComments = localStorage.getItem('allComments');
    const allComments = savedComments ? JSON.parse(savedComments) : [];

    const updatedComments = allComments.map((c: Comment) => {
      if (c.id === commentId) {
        return {
          ...c,
          comment_text: editText.trim(),
          rating: editRating > 0 ? editRating : null,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    });

    localStorage.setItem('allComments', JSON.stringify(updatedComments));

    setEditingId(null);
    setEditText('');
    setEditRating(0);
    await loadComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('آیا از حذف این کامنت اطمینان دارید؟')) return;

    const savedComments = localStorage.getItem('allComments');
    const allComments = savedComments ? JSON.parse(savedComments) : [];

    const filteredComments = allComments.filter((c: Comment) => c.id !== commentId);
    localStorage.setItem('allComments', JSON.stringify(filteredComments));

    await loadComments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-light p-8 mt-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-dark mb-1">نظرات و تجربیات</h2>
          <p className="text-dark/50 text-sm font-medium">
            {comments.length} نظر ثبت شده
          </p>
        </div>
      </div>

      {user && profile ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-light/30 rounded-3xl p-6 md:p-8 border border-light">
          <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
             <div className="w-1.5 h-6 bg-primary rounded-full"></div>
             نظر خود را ثبت کنید
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-bold text-dark/70 mb-3 text-right">
              امتیاز شما (اختیاری)
            </label>
            <StarRating
              rating={newRating}
              size="lg"
              interactive={true}
              onRate={setNewRating}
            />
          </div>

          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="تجربه خود را با دیگران به اشتراک بگذارید..."
              rows={4}
              className="w-full px-5 py-4 bg-white border border-light rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-right resize-none outline-none transition-all text-dark placeholder:text-dark/40"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold hover:opacity-90 hover:-translate-y-1 hover:shadow-soft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            <Send className="w-5 h-5" />
            {loading ? 'در حال ارسال...' : 'ثبت نظر'}
          </button>
        </form>
      ) : (
        <div className="mb-10 bg-light rounded-3xl p-8 border border-light text-center">
          <p className="text-dark font-bold text-lg mb-2">برای ثبت نظر وارد شوید</p>
          <p className="text-dark/60">
            شما باید وارد حساب کاربری خود شوید تا بتوانید نظر ثبت کنید
          </p>
        </div>
      )}

      <div className="space-y-6">
        {loadingComments ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-light border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-dark/50 font-medium">در حال بارگذاری نظرات...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-light/50 rounded-3xl border border-light border-dashed">
            <MessageSquare className="w-16 h-16 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/70 font-bold text-lg">هنوز نظری ثبت نشده</p>
            <p className="text-dark/40 text-sm mt-2 font-medium">اولین نفری باشید که نظر می‌دهد!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-3xl p-6 border border-light shadow-sm hover:shadow-soft transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-secondary font-bold text-lg">
                      {comment.user_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-dark text-lg">{comment.user_name}</p>
                    <p className="text-xs font-medium text-dark/40 mt-1">{formatDate(comment.created_at)}</p>
                  </div>
                </div>

                {user && user.id === comment.user_id && (
                  <div className="flex items-center gap-2">
                    {editingId === comment.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="p-2.5 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary hover:text-white transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                            setEditRating(0);
                          }}
                          className="p-2.5 bg-light text-dark/60 rounded-xl hover:bg-dark/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(comment)}
                          className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-2.5 bg-complementary/10 text-complementary rounded-xl hover:bg-complementary hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {comment.rating && editingId !== comment.id && (
                <div className="mb-4 bg-light/30 inline-block px-3 py-1.5 rounded-xl">
                  <StarRating rating={comment.rating} size="sm" />
                </div>
              )}

              {editingId === comment.id ? (
                <div className="space-y-4 mt-4 bg-light/30 p-4 rounded-2xl border border-light">
                  <div>
                    <label className="block text-sm font-bold text-dark/70 mb-2 text-right">
                      امتیاز
                    </label>
                    <StarRating
                      rating={editRating}
                      size="md"
                      interactive={true}
                      onRate={setEditRating}
                    />
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right resize-none text-dark shadow-sm"
                  />
                </div>
              ) : (
                <p className="text-dark/70 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {comment.comment_text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
