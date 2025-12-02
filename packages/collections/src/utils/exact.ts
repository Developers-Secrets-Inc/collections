type Exact<A, B> = A extends B
  ? Exclude<keyof A, keyof B> extends never
    ? A
    : never
  : never;
