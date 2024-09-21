// compose2 composes two functions: f and g
export const compose2 =
  <Args extends any[], B, C>(f: (b: B) => C, g: (...a: Args) => B) =>
  (...a: Args): C =>
    f(g(...a));

export const compose: {
  <A extends any[], B>(f: (...a: A) => B): (...a: A) => B;
  <A extends any[], B, C>(f: (b: B) => C, g: (...a: A) => B): (...a: A) => C;
  <A extends any[], B, C, D>(
    f: (c: C) => D,
    g: (b: B) => C,
    h: (...a: A) => B,
  ): (...a: A) => D;
  <A extends any[], B, C, D, E>(
    f: (d: D) => E,
    g: (c: C) => D,
    h: (b: B) => C,
    i: (...a: A) => B,
  ): (...a: A) => E;
  <A extends any[], B, C, D, E, F>(
    f: (e: E) => F,
    g: (d: D) => E,
    h: (c: C) => D,
    i: (b: B) => C,
    j: (...a: A) => B,
  ): (...a: A) => F;
  <A extends any[], B, C, D, E, F, G>(
    f: (f: F) => G,
    g: (e: E) => F,
    h: (d: D) => E,
    i: (c: C) => D,
    j: (b: B) => C,
    k: (...a: A) => B,
  ): (...a: A) => G;
  <A extends any[], B, C, D, E, F, G, H>(
    f: (g: G) => H,
    g: (f: F) => G,
    h: (e: E) => F,
    i: (d: D) => E,
    j: (c: C) => D,
    k: (b: B) => C,
    l: (...a: A) => B,
  ): (...a: A) => H;
  <A extends any[], B, C, D, E, F, G, H, I>(
    f: (h: H) => I,
    g: (g: G) => H,
    h: (f: F) => G,
    i: (e: E) => F,
    j: (d: D) => E,
    k: (c: C) => D,
    l: (b: B) => C,
    m: (...a: A) => B,
  ): (...a: A) => I;
  <A extends any[], B, C, D, E, F, G, H, I, J>(
    f: (i: I) => J,
    g: (h: H) => I,
    h: (g: G) => H,
    i: (f: F) => G,
    j: (e: E) => F,
    k: (d: D) => E,
    l: (c: C) => D,
    m: (b: B) => C,
    n: (...a: A) => B,
  ): (...a: A) => J;
  <A extends any[], B, C, D, E, F, G, H, I, J, K>(
    f: (j: J) => K,
    g: (i: I) => J,
    h: (h: H) => I,
    i: (g: G) => H,
    j: (f: F) => G,
    k: (e: E) => F,
    l: (d: D) => E,
    m: (c: C) => D,
    n: (b: B) => C,
    o: (...a: A) => B,
  ): (...a: A) => K;
  <A extends any[], B, C, D, E, F, G, H, I, J, K, L>(
    f: (k: K) => L,
    g: (j: J) => K,
    h: (i: I) => J,
    i: (h: H) => I,
    j: (g: G) => H,
    k: (f: F) => G,
    l: (e: E) => F,
    m: (d: D) => E,
    n: (c: C) => D,
    o: (b: B) => C,
    p: (...a: A) => B,
  ): (...a: A) => L;
  <A extends any[], B, C, D, E, F, G, H, I, J, K, L, M>(
    f: (l: L) => M,
    g: (k: K) => L,
    h: (j: J) => K,
    i: (i: I) => J,
    j: (h: H) => I,
    k: (g: G) => H,
    l: (f: F) => G,
    m: (e: E) => F,
    n: (d: D) => E,
    o: (c: C) => D,
    p: (b: B) => C,
    q: (...a: A) => B,
  ): (...a: A) => M;
  <A extends any[], B, C, D, E, F, G, H, I, J, K, L, M, N>(
    f: (m: M) => N,
    g: (l: L) => M,
    h: (k: K) => L,
    i: (j: J) => K,
    j: (i: I) => J,
    k: (h: H) => I,
    l: (g: G) => H,
    m: (f: F) => G,
    n: (e: E) => F,
    o: (d: D) => E,
    p: (c: C) => D,
    q: (b: B) => C,
    r: (...a: A) => B,
  ): (...a: A) => N;
  <A extends any[], B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
    f: (n: N) => O,
    g: (m: M) => N,
    h: (l: L) => M,
    i: (k: K) => L,
    j: (j: J) => K,
    k: (i: I) => J,
    l: (h: H) => I,
    m: (g: G) => H,
    n: (f: F) => G,
    o: (e: E) => F,
    p: (d: D) => E,
    q: (c: C) => D,
    r: (b: B) => C,
    s: (...a: A) => B,
  ): (...a: A) => O;
  <A extends any[], B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
    f: (o: O) => P,
    g: (n: N) => O,
    h: (m: M) => N,
    i: (l: L) => M,
    j: (k: K) => L,
    k: (j: J) => K,
    l: (i: I) => J,
    m: (h: H) => I,
    n: (g: G) => H,
    o: (f: F) => G,
    p: (e: E) => F,
    q: (d: D) => E,
    r: (c: C) => D,
    s: (b: B) => C,
    t: (...a: A) => B,
  ): (...a: A) => P;
} = (...fns: Array<(...args: any[]) => any>) => fns.reduce(compose2);
