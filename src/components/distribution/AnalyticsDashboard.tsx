import { useMemo } from 'react';
import { useDistributionStore } from '@/store/distributionStore';
import { TrendingUp, Eye, MousePointerClick, Share2, Calendar } from 'lucide-react';

interface AnalyticsDashboardProps {
  pageId: string;
}

/**
 * Displays an analytics dashboard showing page views, clicks, referrers, and device statistics.
 * Shows a placeholder message when the page is not published.
 * @param props - Component props
 * @param props.pageId - The unique identifier of the page to display analytics for
 * @returns Analytics dashboard component with stats overview and detailed breakdowns
 */
export function AnalyticsDashboard({ pageId }: AnalyticsDashboardProps) {
  const { getAnalytics, getDistribution, getShareLinks } = useDistributionStore();
  const analytics = getAnalytics(pageId);
  const distribution = getDistribution(pageId);
  const shareLinks = getShareLinks(pageId);

  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalViews: 0,
        totalClicks: 0,
        clickRate: 0,
        topReferrer: 'Direct',
        topDevice: 'Desktop',
      };
    }

    const totalViews = analytics.views || 0;
    const totalClicks = analytics.clicks || distribution?.clickCount || 0;
    const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

    const referrers = Object.entries(analytics.referrers || {});
    const topReferrer = referrers.length > 0
      ? referrers.sort(([, a], [, b]) => b - a)[0][0]
      : 'Direct';

    const devices = Object.entries(analytics.devices || {});
    const topDevice = devices.length > 0
      ? devices.sort(([, a], [, b]) => b - a)[0][0]
      : 'Desktop';

    return { totalViews, totalClicks, clickRate, topReferrer, topDevice };
  }, [analytics, distribution]);



  if (!distribution?.isPublished) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Eye className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No analytics yet</h3>
          <p className="text-sm text-gray-500">Publish your page to start tracking views and engagement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClicks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.clickRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shares</p>
              <p className="text-3xl font-bold text-gray-900">{shareLinks.reduce((sum, l) => sum + l.clicks, 0)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Share2 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Top Referrers</h3>
          {analytics?.referrers && Object.entries(analytics.referrers).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.referrers)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([referrer, count]) => (
                  <div key={referrer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 truncate">{referrer}</div>
                    <div className="text-sm font-semibold text-gray-900">{count}</div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No referrer data yet</p>
          )}
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Traffic by Device</h3>
          {analytics?.devices && Object.entries(analytics.devices).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.devices)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => {
                  const percentage = stats.totalViews > 0
                    ? ((count / stats.totalViews) * 100).toFixed(0)
                    : '0';
                  return (
                    <div key={device}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{device}</span>
                        <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No device data yet</p>
          )}
        </div>
      </div>

      {/* Share Platforms */}
      {shareLinks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Share Performance</h3>
          <div className="space-y-3">
            {shareLinks
              .sort((a, b) => b.clicks - a.clicks)
              .map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-700 capitalize">{link.platform}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{link.clicks} clicks</p>
                      <p className="text-xs text-gray-500">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Analytics Tips</p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>• Data is updated in real-time</li>
              <li>• Click rate shows engagement level</li>
              <li>• Use shares to track social reach</li>
              <li>• Check device breakdown for optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
