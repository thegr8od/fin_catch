import React from "react";

interface Activity {
  id: number;
  title: string;
  date: string;
}

interface RecentActivitiesSectionProps {
  activities: Activity[];
}

const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({ activities }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center font-korean-pixel">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        최근 활동
      </h3>
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 h-[200px] overflow-y-auto">
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="border-b border-gray-200 pb-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg p-2">
              <p className="text-sm text-gray-800">{activity.title}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {activity.date}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-end">
          <button className="text-xs text-amber-500 hover:text-amber-600 transition-colors duration-200 flex items-center">
            더 보기
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitiesSection;
