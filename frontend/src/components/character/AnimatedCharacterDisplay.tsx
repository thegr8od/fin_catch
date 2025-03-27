import React from "react";
import { Cat } from "../../types/profile/Cat";
import CharacterAnimation from "../game/CharacterAnimation";

interface AnimatedCharacterDisplayProps {
  character: Cat;
  state: "idle" | "attack" | "damage" | "dead" | "victory";
  scale?: number;
  resourcesLoaded: Record<string, boolean>;
}

const AnimatedCharacterDisplay: React.FC<AnimatedCharacterDisplayProps> = React.memo(
  ({ character, state, scale = 2, resourcesLoaded }) => {
    const isResourceLoaded = resourcesLoaded[`${character.catName}_${state}`];

    if (!isResourceLoaded) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div
        style={{
          position: "relative",
          width: "150px",
          height: "60px",
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CharacterAnimation
            key={character.catName}
            state={state}
            direction={true}
            scale={2}
            className="w-full h-full"
            characterType={character.catName}
            isPlaying={true}
            loop={true}
            size={"small"}
          />
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.character.catName === nextProps.character.catName && prevProps.state === nextProps.state && prevProps.scale === nextProps.scale
);

export default AnimatedCharacterDisplay;
