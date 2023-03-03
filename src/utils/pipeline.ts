export const pipeline = <T>(initArg: T, ...fns: Array<(arg: T) => T>) =>
  fns.reduce((acc, fn) => fn(acc), initArg);
