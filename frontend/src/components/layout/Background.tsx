import React from "react";

interface BackgroundProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

const Background: React.FC<BackgroundProps> = ({ children, backgroundImage }) => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundColor: backgroundImage ? "transparent" : "#f5f5f5",
      }}
    >
      {children}
    </div>
  );
};

export default Background;
