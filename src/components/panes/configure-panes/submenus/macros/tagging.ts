export const tagWithID = function <A>(val: A, id: number): [A, number] {
  return [val, id];
};

export const unwrapTagWithID = function <A>([val]: [A, number]) {
  return val;
};
