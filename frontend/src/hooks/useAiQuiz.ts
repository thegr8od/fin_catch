import { useApi } from "./useApi";

export const useAiQuiz = () => { 
  const { loading, error, execute: getAiQuiz } = useApi<string>("/api/ai", "GET");
  
  const getAiQuizContent = async () => {
    return await getAiQuiz();
  };
  
  return { loading, getAiQuizContent, error };

};

