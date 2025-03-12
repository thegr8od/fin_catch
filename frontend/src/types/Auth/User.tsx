export interface User {
  email: string;
  nickname: string;
  exp: number;
  point: number;
  cats: Array<Cat>;
}

interface Cat {
  catId: number;
  catName: string;
}
