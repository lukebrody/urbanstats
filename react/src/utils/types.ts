export type NormalizeProto<T> = { [K in keyof T]-?: Exclude<NormalizeProto<T[K]>, null> }
