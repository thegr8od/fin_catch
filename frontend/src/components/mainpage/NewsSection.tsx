import React from "react";
import newsImage from "../../assets/news.png";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  time: string;
}

interface NewsSectionProps {
  newsItems: NewsItem[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ newsItems }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        오늘의 금융 뉴스
      </h3>
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 max-h-[250px] overflow-y-auto">
        <ul className="space-y-3">
          {newsItems.map((news) => (
            <li key={news.id} className="flex border-b border-gray-100 pb-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg p-1">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                <img src={newsImage} alt={`뉴스 ${news.id}`} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-xs mb-1 text-gray-800">{news.title}</h4>
                <p className="text-xs text-gray-500 mb-1 line-clamp-1">{news.content}</p>
                <p className="text-xs text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {news.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewsSection;
