type Omit<K, T> = Pick<T, Exclude<keyof T, K>>
type PartialExclude<K extends keyof T, T> = { [P in K]: T[P] } & Partial<T>;
