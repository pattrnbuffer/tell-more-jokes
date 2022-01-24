export const resultFor = <T, E>(resolve: () => T): [E] | [undefined, T] => {
  try {
    return [undefined, resolve()];
  } catch (e: unknown) {
    return [e as E];
  }
};
