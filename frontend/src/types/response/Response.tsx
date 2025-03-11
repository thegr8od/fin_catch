export interface SuccessResponse<T> {
  isSuccess: true;
  code: number;
  message: string;
  result: T;
}

export interface ErrorResponse {
  isSuccess: false;
  code: number;
  message: string;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;
