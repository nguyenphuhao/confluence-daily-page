type SuccessResponse<T> = {
  message: string;
  data: T;
}
type ErrorResponse = {
  message: string;
  error: string;
}
export const toSuccessResponse = <T>(data: T, message?: string): SuccessResponse<T> => {
  return {
    message: message || 'Successfully',
    data
  }
}
export const toBadRequestResponse = (error: string, message?: string): ErrorResponse => {
  return {
    message: 'Bad Request',
    error
  }
}
