import React from "react";
import Background from "../layout/Background";
import mainBg from "../../assets/main.gif";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * RoomPreparePage의 에러를 처리하는 에러 경계 컴포넌트
 */
export class RoomPrepareErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("RoomPrepare 에러:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Background backgroundImage={mainBg}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-2xl">문제가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
          </div>
        </Background>
      );
    }

    return this.props.children;
  }
}
