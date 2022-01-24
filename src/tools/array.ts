type ArraySource<T> = ArrayLike<T> | Iterable<T>;

export const array = {
  at,
  bisect,
  clone,
  from,
  last,
  reverse,
};

function bisect<T>(index: number, source: ArraySource<T>) {
  const value = from(source);
  index =
    // clamp at end
    Math.abs(index) > value.length
      ? value.length - 1
      : // accepts fractions, for example 1/2
      index > 0 && index < 1
      ? Math.floor(index * value.length)
      : index < 0
      ? value.length - index
      : index;

  return [value.slice(0, index), value.slice(index)];
}

function at<T>(delta: number, source?: ArraySource<T>) {
  const value = from(source);
  return value[delta % value.length];
}

function from<T>(source?: ArraySource<T>): T[] {
  return source == null
    ? []
    : Array.isArray(source)
    ? source
    : isArrayLike(source) || isIterable(source)
    ? Array.from(source)
    : [];
}

function last<T>(source?: ArraySource<T>) {
  return at(-1, source);
}

function reverse<T>(source?: ArraySource<T>) {
  return from(source)?.slice()?.reverse();
}

function clone<T>(source?: ArraySource<T>) {
  return from(source)?.slice() ?? [];
}

export function isArrayLike<T>(source?: unknown): source is ArrayLike<T> {
  return source != null && typeof (source as ArrayLike<T>)?.length === "number";
}

export function isIterable<T>(source?: unknown): source is Iterable<T> {
  return typeof (source as Iterable<T>)?.[Symbol.iterator] === "function";
}
