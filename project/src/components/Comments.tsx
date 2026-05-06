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
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">نظرات و تجربیات</h2>
          <p className="text-gray-500 text-sm">
            {comments.length} نظر ثبت شده
          </p>
        </div>
      </div>

      {user && profile ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
          <h3 className="font-bold text-gray-900 mb-4">نظر خود را ثبت کنید</h3>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
              امتیاز شما (اختیاری)
            </label>
            <StarRating
              rating={newRating}
              size="lg"
              interactive={true}
              onRate={setNewRating}
            />
          </div>

          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="تجربه خود را با دیگران به اشتراک بگذارید..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right resize-none transition-all"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'در حال ارسال...' : 'ثبت نظر'}
          </button>
        </form>
      ) : (
        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-blue-800 font-bold mb-2">برای ثبت نظر وارد شوید</p>
          <p className="text-blue-600 text-sm">
            شما باید وارد حساب کاربری خود شوید تا بتوانید نظر ثبت کنید
          </p>
        </div>
      )}

      <div className="space-y-4">
        {loadingComments ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">در حال بارگذاری نظرات...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">هنوز نظری ثبت نشده</p>
            <p className="text-gray-400 text-sm mt-2">اولین نفری باشید که نظر می‌دهد!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {comment.user_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{comment.user_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>

                {user && user.id === comment.user_id && (
                  <div className="flex items-center gap-2">
                    {editingId === comment.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                            setEditRating(0);
                          }}
                          className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(comment)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {comment.rating && editingId !== comment.id && (
                <div className="mb-3">
                  <StarRating rating={comment.rating} size="sm" />
                </div>
              )}

              {editingId === comment.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-right resize-none"
                  />
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
