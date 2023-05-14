export default <T>(message: T) => {
  return Buffer.from(JSON.stringify(message));
}