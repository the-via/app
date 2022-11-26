export type PelpiMeta<A = {}> = A;
export type PelpiInput<A> = {
  value: number;
  setValue: (val: number) => void;
  meta: PelpiMeta<A>;
};
