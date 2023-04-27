
export type TStringified<T> = {
  [P in keyof T]: string
};
