interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">경고</h2>
        <p className="text-gray">{message}</p>
        <button className="mt-4 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 transition-colors" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};
