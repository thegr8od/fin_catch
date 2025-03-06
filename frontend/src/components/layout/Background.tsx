import React from "react";
import mainBg from "../../assets/main.gif";

interface BackgroundProps {
  children: React.ReactNode;
  backgroundImage?: string;
  overlayOpacity?: number;
  enableScanline?: boolean;
}

const Background: React.FC<BackgroundProps> = ({ children, backgroundImage = mainBg, overlayOpacity = 0, enableScanline = false }) => {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center font-pixel relative">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url(${backgroundImage})` }}>
        {/* 노이즈 효과 오버레이 */}
        {overlayOpacity > 0 && <div className="absolute inset-0 bg-black z-1" style={{ opacity: overlayOpacity }}></div>}

        {/* 스캔라인 효과 */}
        {enableScanline && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.03] animate-pulse z-1"></div>}
      </div>

      {/* 콘텐츠 - z-index 추가 */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default Background;
