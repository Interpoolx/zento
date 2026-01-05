import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import type { PageComment } from '@/types';

interface PageCommentsProps {
  pageId: string;
  currentUserId?: string;
}

/**
 * Component for displaying and managing page comments.
 * Allows users to view, add, and delete comments on a page.
 * @param props - Component props
 * @param props.pageId - The unique identifier of the page
 * @param props.currentUserId - Optional ID of the currently logged-in user
 * @returns Comments list with optional comment form
 */
export function PageComments({ pageId, currentUserId }: PageCommentsProps) {
  const { getPageComments, addComment, removeComment } = useSocialStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const comments = getPageComments(pageId);

  /**
   * Submits a new comment to the page.
   * Creates a comment object and adds it to the store.
   */
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    const comment: PageComment = {
      id: crypto.randomUUID(),
      pageId,
      userId: currentUserId,
      authorName: 'You',
      content: newComment,
      likes: 0,
      isLiked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addComment(pageId, comment);
    setNewComment('');
    setIsSubmitting(false);
  };

  /**
   * Deletes a comment from the page.
   * @param commentId - The ID of the comment to remove
   */
  const handleDeleteComment = (commentId: string) => {
    removeComment(pageId, commentId);
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {currentUserId && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a comment
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What do you think?"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'transition-all'
              )}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-all',
                newComment.trim() && !isSubmitting
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm">{comment.authorName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {currentUserId === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-3">{comment.content}</p>

              <button
                className={cn(
                  'text-xs font-medium flex items-center gap-1',
                  comment.isLiked
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-3 h-3', comment.isLiked && 'fill-current')} />
                {comment.likes > 0 && comment.likes}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
