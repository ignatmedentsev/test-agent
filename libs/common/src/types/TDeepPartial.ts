export type TDeepPartial<T> = T extends object ? {
  [P in keyof T]?: TDeepPartial<T[P]> | undefined;
} : T;
