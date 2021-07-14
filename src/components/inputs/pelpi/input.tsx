export type PelpiMeta<A = {}> = A;
export type PelpiInput<A> = {
  value: number;
  setValue: (number) => void;
  meta: PelpiMeta<A>;
};
