import { CharacterType } from "../components/game/constants/animations";

export interface Character {
  catId: number;
  catName: CharacterType;
  description: string;
  grade: string;
}
