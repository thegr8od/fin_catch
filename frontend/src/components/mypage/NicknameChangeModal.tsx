import React, { useState, useEffect } from "react";
import { useNicknameManager } from "../../hooks/useUpdateNickname";

interface NicknameChangeModalProps {
  onClose: () => void;
  currentNickname: string;
  onUpdateNickname: (newNickname: string) => void;
}

const NicknameChangeModal: React.FC<NicknameChangeModalProps> = ({ onClose, currentNickname, onUpdateNickname }) => {
  const [nickname, setNickname] = useState(currentNickname);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" | null }>({
    text: "",
    type: null,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checkNicknameAvailability, checkAndUpdateNickname, loading } = useNicknameManager();

  // 닉네임 입력 시 유효성 상태 초기화
  useEffect(() => {
    if (nickname !== currentNickname) {
      setIsNicknameAvailable(false);
      setMessage({ text: "", type: null });
    }
  }, [nickname, currentNickname]);

  // 닉네임 유효성 검사
  const validateNickname = (value: string) => {
    if (value.trim() === "") {
      setMessage({ text: "닉네임을 입력해주세요.", type: "error" });
      return false;
    }

    if (value.length < 2) {
      setMessage({ text: "닉네임은 2자 이상이어야 합니다.", type: "error" });
      return false;
    }

    if (value.length > 10) {
      setMessage({ text: "닉네임은 10자 이하여야 합니다.", type: "error" });
      return false;
    }

    if (value === currentNickname) {
      setMessage({ text: "현재 닉네임과 동일합니다.", type: "info" });
      return false;
    }

    return true;
  };

  // 닉네임 중복 체크
  const handleCheckNickname = async () => {
    if (!validateNickname(nickname)) {
      return;
    }

    setIsChecking(true);
    setMessage({ text: "닉네임 중복 확인 중...", type: "info" });

    try {
      const result = await checkNicknameAvailability(nickname);

      if (result.success) {
        const isDuplicated = result.data;

        if (isDuplicated) {
          setMessage({ text: "이미 사용 중인 닉네임입니다.", type: "error" });
          setIsNicknameAvailable(false);
        } else {
          setMessage({ text: "사용 가능한 닉네임입니다.", type: "success" });
          setIsNicknameAvailable(true);
        }
      } else {
        setMessage({ text: "닉네임 확인 중 오류가 발생했습니다.", type: "error" });
        setIsNicknameAvailable(false);
      }
    } catch (error) {
      setMessage({ text: "닉네임 확인 중 오류가 발생했습니다.", type: "error" });
      setIsNicknameAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // 닉네임 변경 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameAvailable) {
      setMessage({ text: "닉네임 중복 확인을 먼저 해주세요.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "닉네임 변경 중...", type: "info" });

    try {
      const result = await checkAndUpdateNickname(nickname);

      if (result.success) {
        setMessage({ text: "닉네임이 성공적으로 변경되었습니다.", type: "success" });

        // 부모 컴포넌트에 변경된 닉네임 전달
        onUpdateNickname(nickname);

        // 성공 후 1초 뒤 모달 닫기
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setMessage({ text: result.message || "닉네임 변경 중 오류가 발생했습니다.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "닉네임 변경 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">닉네임 변경</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isChecking || isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nickname" className="block text-gray-700 font-medium mb-2 font-korean-pixel">
              새 닉네임
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-korean-pixel"
                placeholder="새 닉네임을 입력하세요"
                disabled={isChecking || isSubmitting}
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-korean-pixel whitespace-nowrap"
                disabled={isChecking || isSubmitting}
              >
                {isChecking ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            {message.text && (
              <p className={`mt-2 text-sm ${message.type === "error" ? "text-red-600" : message.type === "success" ? "text-green-600" : "text-blue-600"} font-korean-pixel`}>{message.text}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-korean-pixel" disabled={isChecking || isSubmitting}>
              취소
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-white font-korean-pixel ${
                isNicknameAvailable ? "bg-gradient-to-r from-form-color to-button-color hover:opacity-90" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isNicknameAvailable || isChecking || isSubmitting}
            >
              {isSubmitting ? "변경 중..." : "변경하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NicknameChangeModal;
