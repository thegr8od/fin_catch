import { useApi } from "./useApi";
import { AllAccount, AccountDetail } from "../types/Accounts/Account";

export const useAccount = () => {
  const allAccountApi = useApi<AllAccount>("/api/finance/all/account", "GET");
  const accountDetailApi = useApi<AccountDetail, number>("/api/account/detail", "GET");

  return {
    ...allAccountApi,
    ...accountDetailApi,
    fetchAllAccount: allAccountApi.execute,
    fetchAccountDetail: accountDetailApi.execute,
  };
};
