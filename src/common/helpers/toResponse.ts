type ResponseType<T> = {
  message: string;
  data: T;
}
export default <T>(data: T, message?: string): ResponseType<T> => {
  return {
    message: message || 'Successfully',
    data
  }
}