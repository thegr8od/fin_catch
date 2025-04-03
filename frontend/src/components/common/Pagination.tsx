import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded mr-2 ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
      >
        이전
      </button>
      
      {/* 페이지 번호 버튼 - 최대 5개 표시 */}
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        // 현재 페이지 주변 페이지들 표시
        let pageNum;
        if (totalPages <= 5) {
          // 전체 페이지가 5개 이하면 1~5 표시
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          // 현재 페이지가 앞쪽이면 1~5 표시
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          // 현재 페이지가 뒤쪽이면 마지막 5개 표시
          pageNum = totalPages - 4 + i;
        } else {
          // 그 외에는 현재 페이지 중심으로 표시
          pageNum = currentPage - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 mx-1 rounded-full ${
              currentPage === pageNum
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ml-2 ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;