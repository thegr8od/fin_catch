export interface User {
  email: string;
  nickname: string;
  exp: number;
  point: number;
  cats: Array<Cat>;
  mainCat: Cat;
  main_account: number;
}

interface Cat {
  catId: number;
  catName: string;
}
