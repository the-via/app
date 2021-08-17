export type PropertiesOfType<TBase, TProps> = Pick<
  TBase,
  {
    [Key in keyof TBase]: TBase[Key] extends TProps ? Key : never;
  }[keyof TBase]
>;

export type ValueOf<T> = T[keyof T];
