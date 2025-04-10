export const formataccountNo = (accountNo: number) => {
  return accountNo.toString().replace(/(\d{4})(?=\d)/g, "$1-");
};

export const formatBalance = (balance: number) => {
  return new Intl.NumberFormat("ko-KR").format(balance);
};
