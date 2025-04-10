import React from "react"

interface GameLayoutProps {
  children: React.ReactNode
  background: string
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, background }) => {
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${background})` }}>
      {children}
    </div>
  )
}

export default GameLayout
