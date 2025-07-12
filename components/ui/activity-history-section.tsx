'use client';

import { useState } from 'react';
import { Activity } from '@prisma/client';
import { ActivityHistoryCard } from './activity-history-card';
import { toast } from 'sonner';

interface ActivityHistorySectionProps {
  animalId: string;
  initialActivities?: Activity[];
}

const ACTIVITIES_PER_PAGE = 5;

export function ActivityHistorySection({ animalId, initialActivities = [] }: ActivityHistorySectionProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [displayCount, setDisplayCount] = useState(ACTIVITIES_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialActivities.length >= ACTIVITIES_PER_PAGE);

  // Load more activities from API
  const loadMoreActivities = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = Math.floor(activities.length / ACTIVITIES_PER_PAGE) + 1;
      const response = await fetch(
        `/api/activities?animalId=${animalId}&page=${currentPage}&limit=${ACTIVITIES_PER_PAGE}&sortBy=activityDate&sortOrder=desc`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const newActivities = result.data.data || [];
        const pagination = result.data.pagination;

        if (newActivities.length > 0) {
          setActivities(prev => [...prev, ...newActivities]);
          setHasMore(pagination.hasNext || false);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more activities:', error);
      toast.error('ไม่สามารถโหลดกิจกรรมเพิ่มเติมได้');
    } finally {
      setLoading(false);
    }
  };

  // Handle activity card click
  const handleActivityClick = (activityId: string) => {
    // Navigate to activity detail with return path info
    window.location.href = `/dashboard/activities/${activityId}?returnTo=animal&animalId=${animalId}`;
  };

  // Show visible activities based on display count
  const visibleActivities = activities.slice(0, displayCount);

  // Check if we need to load more from API
  const needsApiLoad = displayCount >= activities.length && hasMore;

  // Load more handler
  const handleLoadMore = () => {
    if (needsApiLoad) {
      loadMoreActivities();
    } else {
      // Show more from existing activities
      setDisplayCount(prev => prev + ACTIVITIES_PER_PAGE);
      
      // Check if we'll need more after this display
      if (displayCount + ACTIVITIES_PER_PAGE >= activities.length && hasMore) {
        loadMoreActivities();
      }
    }
  };

  // Show load more button condition
  const showLoadMore = visibleActivities.length < activities.length || hasMore;

  if (activities.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-[15px] p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ประวัติกิจกรรม
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500 text-sm">
            ยังไม่มีกิจกรรมสำหรับสัตว์ตัวนี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[15px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ประวัติกิจกรรม ({activities.length} รายการ)
        </h3>
        <button
          onClick={() => window.location.href = `/dashboard/animals/${animalId}/activities`}
          className="px-4 py-2 text-sm font-medium text-[#f39c12] bg-white border border-[#f39c12] rounded-lg hover:bg-[#f39c12] hover:text-white transition-colors duration-200 min-h-[44px]"
        >
          ดูกิจกรรมทั้งหมด
        </button>
      </div>

      {/* Activity History Cards */}
      <div className="space-y-0">
        {visibleActivities.map((activity) => (
          <ActivityHistoryCard
            key={activity.id}
            activity={activity}
            onClick={handleActivityClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#f39c12] bg-white border border-[#f39c12] rounded-lg hover:bg-[#f39c12] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังโหลด...
              </>
            ) : (
              <>
                ดูเพิ่มเติม
                {hasMore && ` (เหลืออีก ${activities.length - visibleActivities.length}+ รายการ)`}
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading indicator for initial load */}
      {loading && activities.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#f39c12]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">กำลังโหลดกิจกรรม...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityHistorySection;