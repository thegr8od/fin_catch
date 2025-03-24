interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] transform transition-all">
        <div className="flex flex-col items-center">
          <img src="/cats_assets/classic/classic_cat_static.png" alt="캐릭터" className="w-24 h-24 mb-4" />
          <p className="text-lg text-gray-800 font-korean-pixel text-center mb-6 whitespace-pre-line">{message}</p>
          <div className="w-full">
            <button onClick={onClose} className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-korean-pixel hover:bg-blue-600 transition-colors">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
