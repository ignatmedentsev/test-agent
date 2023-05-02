export type TApiDescription<T extends string, K extends object, V> = {
  url: T,
  payload: K,
  result: V,
};
