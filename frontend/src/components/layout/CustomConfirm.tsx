interface CustomConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomConfirm: React.FC<CustomConfirmProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] transform transition-all">
      <div className="flex flex-col items-center">
        <img src="/cats_assets/classic/classic_cat_static.png" alt="캐릭터" className="w-24 h-24 mb-4" />
        <p className="text-lg text-gray-800 font-korean-pixel text-center mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-4 w-full">
          <button onClick={onConfirm} className="flex-1 px-6 py-3 bg-red text-white rounded-lg font-korean-pixel">
            확인
          </button>
          <button onClick={onCancel} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-korean-pixel">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export const CustomAlert: React.FC<{ message: string; onConfirm: () => void }> = ({ message, onConfirm }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] transform transition-all">
      <div className="flex flex-col items-center">
        <img src="/cats_assets/classic/classic_cat_static.png" alt="캐릭터" className="w-24 h-24 mb-4" />
        <p className="text-lg text-gray-800 font-korean-pixel text-center mb-6 whitespace-pre-line">{message}</p>
        <button onClick={onConfirm} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300">
          확인
        </button>
      </div>
    </div>
  );
};
