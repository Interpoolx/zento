import { useSocialStore } from '@/store/socialStore';
import { cn } from '@/lib/utils';
import { UserPlus, UserMinus } from 'lucide-react';
import type { UserProfile as UserProfileType } from '@/types';

interface UserProfileProps {
  user: UserProfileType;
  isCurrentUser?: boolean;
}

/**
 * Component for displaying a user's profile with stats and follow functionality.
 * Shows avatar, bio, follower/following counts, and engagement statistics.
 * @param props - Component props
 * @param props.user - The user profile data to display
 * @param props.isCurrentUser - Whether this is the currently logged-in user's profile
 * @returns Full user profile card with stats and actions
 */
export function UserProfile({ user, isCurrentUser }: UserProfileProps) {
  const { followUser, unfollowUser, isFollowing, getStats } = useSocialStore();
  const isUserFollowing = isFollowing(user.id);
  const stats = getStats();

  /**
   * Toggles the follow state for this user.
   * Follows the user if not following, otherwise unfollows.
   */
  const handleFollowClick = () => {
    if (isUserFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header Background */}
      <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600" />

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Profile Picture */}
        <div className="flex items-end justify-between mb-4 -mt-16 relative">
          <div>
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            )}
          </div>
          {!isCurrentUser && (
            <button
              onClick={handleFollowClick}
              className={cn(
                'px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2',
                isUserFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              )}
            >
              {isUserFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold">{user.displayName}</h2>
          <p className="text-gray-500 mb-2">@{user.username}</p>
          {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 my-4">
            <div className="text-center">
              <div className="text-xl font-bold">{user.followerCount}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{user.followingCount}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalViews}</div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
          </div>

          {/* Social Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Likes Received</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalLikes}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Comments</div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
            </div>
          </div>
        </div>

        {/* Joined Date */}
        <div className="mt-4 text-xs text-gray-500">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
