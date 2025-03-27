export const formatDateToInput = (dateString: string | undefined) => {
  // 날짜가 없는 경우 처리
  if (!dateString) return "-";

  // YYYYMMDD -> YYYY-MM-DD
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
};
