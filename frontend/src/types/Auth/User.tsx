export interface User {
  email: string;
  nickname: string;
  exp: number;
  point: number;
  cats: Array<Cat>;
  mainCat: Cat;
  main_account: string;
}

interface Cat {
  catId: number;
  catName: string;
}
