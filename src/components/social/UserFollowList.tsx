import { useSocialStore } from '@/store/socialStore';
import { cn } from '@/lib/utils';
import { UserPlus, UserMinus } from 'lucide-react';

interface UserFollowListProps {
  userIds: string[];
  title: string;
  type: 'followers' | 'following';
}

/**
 * Component for displaying a list of followers or following users.
 * Shows user avatars, names, and follow/unfollow buttons.
 * @param props - Component props
 * @param props.userIds - Array of user IDs to display
 * @param props.title - Section title (e.g., "Followers" or "Following")
 * @param props.type - List type for determining available actions
 * @returns User list with optional follow/unfollow actions
 */
export function UserFollowList({ userIds, title, type }: UserFollowListProps) {
  const { getUserProfile, followUser, unfollowUser, isFollowing } = useSocialStore();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-lg mb-4">{title}</h3>

      {userIds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No {type} yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userIds.map((userId) => {
            const user = getUserProfile(userId);
            if (!user) return null;

            const userIsFollowing = isFollowing(userId);

            return (
              <div
                key={userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{user.displayName}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>

                {type === 'following' && (
                  <button
                    onClick={() => {
                      if (userIsFollowing) {
                        unfollowUser(userId);
                      } else {
                        followUser(userId);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1',
                      userIsFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                  >
                    {userIsFollowing ? (
                      <>
                        <UserMinus className="w-3 h-3" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
