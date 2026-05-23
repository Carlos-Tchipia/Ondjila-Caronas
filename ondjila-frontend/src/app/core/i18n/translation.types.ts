/** Maps a const translation tree so EN values are typed as `string`, not PT literals. */
export type DeepStringTree<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepStringTree<T[K]>;
};
