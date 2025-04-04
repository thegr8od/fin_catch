import React, { useState, useCallback, useEffect } from "react";
import { bankLogo } from "../../utils/BankLogo";
import { Account, AccountDetail, AllConsumeHistory, ConsumeHistory, ConsumeHistoryList } from "../../types/Accounts/Account";
import { formatDateToInput } from "../../utils/formatDate";
import { formatBalance, formataccountNo } from "../../utils/formatAccount";
import { useApi } from "../../hooks/useApi";

interface MainAccount {
  bankCode: string;
  accountNo: string;
  accountName: string;
  accountBalance: number;
}

interface AccountLinkSectionProps {
  onAccountLink: () => void;
  mainAccount: MainAccount | null;
  error?: string | null;
  accounts: Account[];
  fetchAllAccount: () => Promise<any>;
}

// 달력 관련 타입
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  transactions: ConsumeHistory[];
  totalIncome: number;
  totalExpense: number;
}

const AccountLinkSection: React.FC<AccountLinkSectionProps> = ({ onAccountLink, mainAccount, error, accounts, fetchAllAccount }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [consumeHistory, setConsumeHistory] = useState<AllConsumeHistory | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // API 호출 함수들
  const accountDetailApi = useApi<AccountDetail, { accountNo: string }>("/api/finance/account/detail", "POST");
  const consumeHistoryApi = useApi<ConsumeHistoryList, { accountNo: string; year: number; month: number }>("/api/finance/account/transactions", "POST");

  // 거래내역 필터 상태
  const [historyFilter, setHistoryFilter] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
    transactionType: "A" as "A" | "M" | "D",
  });

  // 상세정보 조회
  const handleDetailClick = async (accountNo: string) => {
    const newShowDetail = !showDetail;
    setShowDetail(newShowDetail);

    if (newShowDetail && mainAccount) {
      setLoading(true);
      try {
        const response = await accountDetailApi.execute({ accountNo });
        if (response?.isSuccess && response.result) {
          setAccountDetail(response.result);
        }
      } catch (error) {
        console.error("계좌 상세 조회 에러:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 거래내역 조회 함수
  const fetchConsumeHistory = async (accountNo: string, year: number, month: number) => {
    setHistoryLoading(true);
    try {
      const response = await consumeHistoryApi.execute({ accountNo, year, month });
      if (response?.isSuccess && response.result) {
        setConsumeHistory({
          isSuccess: response.isSuccess,
          code: response.code || 0,
          message: response.message || "",
          result: response.result,
        });

        // 달력 데이터 생성
        generateCalendarDays(year, month, response.result.list);
      }
    } catch (error) {
      console.error("거래내역 조회 에러:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 달력 데이터 생성 함수
  const generateCalendarDays = (year: number, month: number, transactions: ConsumeHistory[]) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // 이전 달의 마지막 날짜들
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // 이전 달의 날짜들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 2, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dateStr = `${year}${month.toString().padStart(2, "0")}${i.toString().padStart(2, "0")}`;

      // 해당 날짜의 거래내역 필터링
      const dayTransactions = transactions.filter((t) => t.transactionDate === dateStr);

      // 수입과 지출 계산
      const totalIncome = dayTransactions.filter((t) => t.transactionTypeName !== "출금").reduce((sum, t) => sum + t.transactionBalance, 0);

      const totalExpense = dayTransactions.filter((t) => t.transactionTypeName === "출금").reduce((sum, t) => sum + t.transactionBalance, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        transactions: dayTransactions,
        totalIncome,
        totalExpense,
      });
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length; // 6주 달력을 위해 42일로 고정
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
      });
    }

    setCalendarDays(days);
  };

  // 거래내역 조회 및 필터 적용 함수
  const handleAnalysisAndFetch = async () => {
    if (mainAccount) {
      const year = parseInt(historyFilter.year);
      const month = parseInt(historyFilter.month);
      await fetchConsumeHistory(mainAccount.accountNo, year, month);
    }
  };

  // 최초 마운트 시 거래내역 조회
  useEffect(() => {
    if (mainAccount) {
      handleAnalysisAndFetch();
      setSelectedDate(null); // 계좌가 변경될 때 선택된 날짜 초기화
    }
  }, [mainAccount]);

  // 연월 변경 시 자동으로 거래내역 조회
  useEffect(() => {
    if (mainAccount) {
      handleAnalysisAndFetch();
    }
  }, [historyFilter.year, historyFilter.month]);

  const handleFilterChange = (name: string, value: string) => {
    if (name === "startDate" || name === "endDate") {
      value = value.replace(/-/g, "");
    }

    // 월 입력값 검증 및 보정
    if (name === "month") {
      const monthNum = parseInt(value);
      if (monthNum < 1) value = "01";
      if (monthNum > 12) value = "12";
      value = value.padStart(2, "0");
    }

    setHistoryFilter((prev) => {
      const newFilter = {
        ...prev,
        [name]: value,
      };
      return newFilter;
    });
  };

  const handleAccountLinkClick = async () => {
    try {
      setLoading(true);
      await fetchAllAccount();
      onAccountLink();
    } catch (error) {
      console.error("계좌 목록 갱신 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 선택 처리
  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  // 달력 헤더 렌더링
  const renderCalendarHeader = () => {
    return (
      <div className="grid grid-cols-7 gap-1 mb-4">
        <div className="text-center text-sm text-red-400 font-korean-pixel">일</div>
        <div className="text-center text-sm text-gray-600 font-korean-pixel">월</div>
        <div className="text-center text-sm text-gray-600 font-korean-pixel">화</div>
        <div className="text-center text-sm text-gray-600 font-korean-pixel">수</div>
        <div className="text-center text-sm text-gray-600 font-korean-pixel">목</div>
        <div className="text-center text-sm text-gray-600 font-korean-pixel">금</div>
        <div className="text-center text-sm text-blue-400 font-korean-pixel">토</div>
      </div>
    );
  };

  // 달력 날짜 렌더링
  const renderCalendarDays = () => {
    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg cursor-pointer transition-all ${day.isCurrentMonth ? "hover:bg-gray-50" : "opacity-30"} ${
              selectedDate && day.date.toDateString() === selectedDate.toDateString() ? "bg-blue-50" : ""
            }`}
            onClick={() => handleDateClick(day)}
          >
            <div className={`text-sm font-korean-pixel mb-2 ${day.isToday ? "text-blue-500 font-bold" : "text-gray-600"}`}>{day.date.getDate()}</div>

            {day.transactions.length > 0 && (
              <div className="text-xs">{day.totalExpense > 0 && <div className="text-gray-800 font-korean-pixel font-medium">-{formatBalance(day.totalExpense)}</div>}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 선택된 날짜의 거래내역 렌더링
  const renderSelectedDateTransactions = () => {
    if (!selectedDate) return null;

    const selectedDay = calendarDays.find((day) => day.date.toDateString() === selectedDate.toDateString());

    if (!selectedDay || selectedDay.transactions.length === 0) {
      return <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-gray-500 font-korean-pixel">거래내역이 없습니다</div>;
    }

    return (
      <div className="mt-6">
        <h5 className="text-lg font-bold text-gray-800 font-korean-pixel mb-4">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 거래내역
        </h5>
        <div className="space-y-3">
          {selectedDay.transactions.map((transaction: ConsumeHistory) => (
            <div key={transaction.transactionUniqueNo} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">{transaction.transactionTypeName === "출금" ? "💸" : "💰"}</div>
                <div>
                  <div className="text-sm font-korean-pixel text-gray-800">{transaction.transactionSummary}</div>
                  <div className="text-xs font-korean-pixel text-gray-500">{transaction.transactionTime.replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2")}</div>
                </div>
              </div>
              <div className={`text-right ${transaction.transactionTypeName === "출금" ? "text-gray-800" : "text-blue-500"} font-korean-pixel`}>
                {transaction.transactionTypeName === "출금" ? "-" : "+"}
                {formatBalance(transaction.transactionBalance)}원
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💰 주 거래 통장</h3>
        {mainAccount && (
          <div className="flex gap-2">
            <button onClick={() => handleDetailClick(mainAccount.accountNo)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-korean-pixel hover:bg-blue-100 transition-colors">
              {showDetail ? "상세정보 닫기" : "상세정보 보기"}
            </button>
            <button onClick={handleAccountLinkClick} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-korean-pixel hover:bg-gray-200 transition-colors">
              계좌 변경
            </button>
          </div>
        )}
      </div>

      {mainAccount ? (
        <>
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src={bankLogo[mainAccount.bankCode.toString()]} alt="bank logo" className="max-w-full max-h-full" />
                </div>
                <div>
                  <div className="text-lg font-korean-pixel text-gray-800">{mainAccount.accountName}</div>
                  <div className="text-sm font-korean-pixel text-gray-600">{mainAccount.accountNo}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold font-korean-pixel text-gray-800">{formatBalance(mainAccount.accountBalance)}원</div>
              </div>
            </div>
          </div>

          {showDetail && (
            <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
                </div>
              ) : accountDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">은행명</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{accountDetail.bankName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">예금주</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{accountDetail.userName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">계좌 종류</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{accountDetail.accountTypeName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">개설일</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{formatDateToInput(accountDetail.accountCreateDate)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">1회 이체한도</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{formatBalance(accountDetail.oneTimeTransferLimit)}원</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">1일 이체한도</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{formatBalance(accountDetail.dailyTransferLimit)}원</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">최근 거래일</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{formatDateToInput(accountDetail.lastTranscationDate)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-korean-pixel">통화</p>
                      <p className="text-base text-gray-800 font-korean-pixel">{accountDetail.currency}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 font-korean-pixel">계좌 상세 정보를 불러올 수 없습니다.</div>
              )}
            </div>
          )}

          {/* 달력 형태의 거래내역 */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-gray-800 font-korean-pixel">거래내역</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const prevMonth = parseInt(historyFilter.month) - 1;
                    const prevYear = parseInt(historyFilter.year);
                    if (prevMonth < 1) {
                      handleFilterChange("year", (prevYear - 1).toString());
                      handleFilterChange("month", "12");
                    } else {
                      handleFilterChange("month", prevMonth.toString().padStart(2, "0"));
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  ←
                </button>
                <span className="text-lg font-korean-pixel">
                  {historyFilter.year}년 {parseInt(historyFilter.month)}월
                </span>
                <button
                  onClick={() => {
                    const nextMonth = parseInt(historyFilter.month) + 1;
                    const nextYear = parseInt(historyFilter.year);
                    if (nextMonth > 12) {
                      handleFilterChange("year", (nextYear + 1).toString());
                      handleFilterChange("month", "01");
                    } else {
                      handleFilterChange("month", nextMonth.toString().padStart(2, "0"));
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  →
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <>
                {renderCalendarHeader()}
                {renderCalendarDays()}
                {renderSelectedDateTransactions()}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4 font-korean-pixel">{error || "아직 주 거래 통장이 설정되지 않았습니다"}</p>
          <button
            onClick={handleAccountLinkClick}
            className="px-6 py-3 bg-gradient-to-r from-form-color to-button-color text-gray-700 rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300"
          >
            주 거래 통장 설정하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountLinkSection;
