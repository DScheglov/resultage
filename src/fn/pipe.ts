/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-return */
const pipe2 = <T, S>(value: T, fn: (value: T) => S): S => fn(value);

export const pipe: {
  <T>(value: T): T;
  <T, A>(value: T, fn1: (value: T) => A): A;
  <T, A, B>(value: T, fn1: (value: T) => A, fn2: (value: A) => B): B;
  <T, A, B, C>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
  ): C;
  <T, A, B, C, D>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
  ): D;
  <T, A, B, C, D, E>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
  ): E;
  <T, A, B, C, D, E, F>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
  ): F;
  <T, A, B, C, D, E, F, G>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
  ): G;
  <T, A, B, C, D, E, F, G, H>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
  ): H;
  <T, A, B, C, D, E, F, G, H, I>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
    fn9: (value: H) => I,
  ): I;
  <T, A, B, C, D, E, F, G, H, I, J>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
    fn9: (value: H) => I,
    fn10: (value: I) => J,
  ): J;
  <T, A, B, C, D, E, F, G, H, I, J, K>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
    fn9: (value: H) => I,
    fn10: (value: I) => J,
    fn11: (value: J) => K,
  ): K;
  <T, A, B, C, D, E, F, G, H, I, J, K, L>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
    fn9: (value: H) => I,
    fn10: (value: I) => J,
    fn11: (value: J) => K,
    fn12: (value: K) => L,
  ): L;
  <T, A, B, C, D, E, F, G, H, I, J, K, L, M>(
    value: T,
    fn1: (value: T) => A,
    fn2: (value: A) => B,
    fn3: (value: B) => C,
    fn4: (value: C) => D,
    fn5: (value: D) => E,
    fn6: (value: E) => F,
    fn7: (value: F) => G,
    fn8: (value: G) => H,
    fn9: (value: H) => I,
    fn10: (value: I) => J,
    fn11: (value: J) => K,
    fn12: (value: K) => L,
    fn13: (value: L) => M,
  ): M;
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
} = (...fns: [any, ...Array<(value: any) => any>]) => {
  const count = fns.length;

  switch (count) {
  case 1:
    return fns[0];
  case 2:
    const [v, fn] = fns;
    return fn(v);
  case 3:
    const [v2, fn2, fn3] = fns;
    return fn3(fn2(v2));
  case 4:
    const [v3, fn4, fn5, fn6] = fns;
    return fn6(fn5(fn4(v3)));
  case 5:
    const [v4, fn7, fn8, fn9, fn10] = fns;
    return fn10(fn9(fn8(fn7(v4))));
  case 6:
    const [v5, fn11, fn12, fn13, fn14, fn15] = fns;
    return fn15(fn14(fn13(fn12(fn11(v5)))));
  case 7:
    const [v6, fn16, fn17, fn18, fn19, fn20, fn21] = fns;
    return fn21(fn20(fn19(fn18(fn17(fn16(v6))))));
  case 8:
    const [v7, fn22, fn23, fn24, fn25, fn26, fn27, fn28] = fns;
    return fn28(fn27(fn26(fn25(fn24(fn23(fn22(v7)))))));
  case 9:
    const [v8, fn29, fn30, fn31, fn32, fn33, fn34, fn35, fn36] = fns;
    return fn36(fn35(fn34(fn33(fn32(fn31(fn30(fn29(v8))))))));
  case 10:
    const [v9, fn37, fn38, fn39, fn40, fn41, fn42, fn43, fn44, fn45] = fns;
    return fn45(fn44(fn43(fn42(fn41(fn40(fn39(fn38(fn37(v9)))))))));
  case 11:
    const [
      v10,
      fn46,
      fn47,
      fn48,
      fn49,
      fn50,
      fn51,
      fn52,
      fn53,
      fn54,
      fn55,
    ] = fns;
    return fn55(
      fn54(
        fn53(fn52(fn51(fn50(fn49(fn48(fn47(fn46(v10)))))))),
      ),
    );
  default:
  }
  return fns.reduce(pipe2);
};
