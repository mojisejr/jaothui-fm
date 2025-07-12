'use client';

import { Activity, ActivityStatus } from '@prisma/client';
import { 
  getActivityTypeIcon, 
  getActivityStatusDisplay, 
  getActivityStatusBadgeClass,
  formatActivityDateDisplay 
} from '@/lib/activity-utils';

interface ActivityHistoryCardProps {
  activity: Activity;
  onClick?: (activityId: string) => void;
}

export function ActivityHistoryCard({ activity, onClick }: ActivityHistoryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(activity.id);
    }
  };

  const activityIcon = getActivityTypeIcon(activity.title);
  const statusDisplay = getActivityStatusDisplay(activity.status);
  const statusBadgeClass = getActivityStatusBadgeClass(activity.status);
  const formattedDate = formatActivityDateDisplay(activity.activityDate);

  return (
    <div 
      className="bg-[#f9f9f9] rounded-[15px] p-[15px] mb-[15px] flex items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Activity Type Icon (Left Side) */}
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
        <span className="text-xl" role="img" aria-label={`${activity.title} icon`}>
          {activityIcon}
        </span>
      </div>

      {/* Main Content (Center) */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          {/* Activity Title */}
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {activity.title}
          </h3>
          
          {/* Activity Date */}
          <p className="text-sm text-gray-600 mt-1">
            วันที่: {formattedDate}
          </p>
          
          {/* Description (if available) */}
          {activity.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Reminder Date (if available) */}
          {activity.reminderDate && (
            <p className="text-xs text-gray-400 mt-1">
              แจ้งเตือน: {formatActivityDateDisplay(activity.reminderDate)}
            </p>
          )}
        </div>
      </div>

      {/* Status Indicator (Right Side) */}
      <div className="flex-shrink-0 ml-3">
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass}`}
        >
          {statusDisplay}
        </span>
      </div>
    </div>
  );
}

export default ActivityHistoryCard;