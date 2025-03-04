import "./App.css";
import PixiTest from "./components/PixiTest";

function App() {
  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">PixiJS 테스트 앱</h1>
      <PixiTest />
      <p className="mt-4 text-gray-600">
        위의 상자에서 회전하는 토끼 스프라이트를 볼 수 있습니다.
      </p>
    </div>
  );
}

export default App;
