export const timeout = async (time: number) =>
  new Promise((res) => setTimeout(res, time));
