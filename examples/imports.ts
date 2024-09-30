import {
  thenMap as Index_thenMap,
  thenMapErr as Index_thenMapErr,
  thenChain as Index_thenChain,
  thenChainErr as Index_thenChainErr,
  thenMatch as Index_thenMatch,
  thenUnwrap as Index_thenUnwrap,
  thenUnwrapOr as Index_thenUnwrapOr,
  thenUnwrapOrElse as Index_thenUnwrapOrElse,
  thenUnwrapOrReject as Index_thenUnwrapOrReject,
  thenUnwrapErr as Index_thenUnwrapErr,
  thenUnwrapErrOr as Index_thenUnwrapErrOr,
  thenUnwrapErrOrElse as Index_thenUnwrapErrOrElse,
  thenTap as Index_thenTap,
  thenTapAndWait as Index_thenTapAndWait,
  thenTapErr as Index_thenTapErr,
  thenTapErrAndWait as Index_thenTapErrAndWait,
  flip as Index_flip,
  from as Index_from,
  thenUnpack as Index_thenUnpack,
  ok as Index_ok,
  asyncOk as Index_asyncOk,
  err as Index_err,
  asyncErr as Index_asyncErr,
  isResult as Index_isResult,
  isOk as Index_isOk,
  isErr as Index_isErr,
  ensureResult as Index_ensureResult,
  okIf as Index_okIf,
  expect as Index_expect,
  expectExists as Index_expectExists,
  okIfExists as Index_okIfExists,
  map as Index_map,
  mapErr as Index_mapErr,
  chain as Index_chain,
  chainErr as Index_chainErr,
  unwrap as Index_unwrap,
  unwrapOr as Index_unwrapOr,
  unwrapOrElse as Index_unwrapOrElse,
  unwrapErr as Index_unwrapErr,
  unwrapErrOr as Index_unwrapErrOr,
  unwrapErrOrElse as Index_unwrapErrOrElse,
  unpack as Index_unpack,
  match as Index_match,
  tap as Index_tap,
  tapErr as Index_tapErr,
  Do as Index_Do,
  reduce as Index_reduce,
  collect as Index_collect,
  partition as Index_partition,
  sequence as Index_sequence,
} from 'resultage';

import {
  ok as Base_ok,
  asyncOk as Base_asyncOk,
  err as Base_err,
  asyncErr as Base_asyncErr,
  isResult as Base_isResult,
  isOk as Base_isOk,
  isErr as Base_isErr,
  ensureResult as Base_ensureResult,
  okIf as Base_okIf,
  expect as Base_expect,
  expectExists as Base_expectExists,
  okIfExists as Base_okIfExists,
  Do as Base_Do,
} from 'resultage/base';

import {
  assertNever as Fn_assertNever,
  compose2 as Fn_compose2,
  compose as Fn_compose,
  identity as Fn_identity,
  idX as Fn_idX,
  lazy as Fn_lazy,
  asConst as Fn_asConst,
  pipe as Fn_pipe,
  unreachable as Fn_unreachable,
} from 'resultage/fn';

import {
  map as Methods_map,
  mapErr as Methods_mapErr,
  chain as Methods_chain,
  chainErr as Methods_chainErr,
  unwrap as Methods_unwrap,
  unwrapOr as Methods_unwrapOr,
  unwrapOrElse as Methods_unwrapOrElse,
  unwrapErr as Methods_unwrapErr,
  unwrapErrOr as Methods_unwrapErrOr,
  unwrapErrOrElse as Methods_unwrapErrOrElse,
  unpack as Methods_unpack,
  match as Methods_match,
  tap as Methods_tap,
  tapErr as Methods_tapErr,
} from 'resultage/methods';

import {
  reduce as Lists_reduce,
  collect as Lists_collect,
  partition as Lists_partition,
  sequence as Lists_sequence,
} from 'resultage/lists';

console.log({
  Index_thenMap,
  Index_thenMapErr,
  Index_thenChain,
  Index_thenChainErr,
  Index_thenMatch,
  Index_thenUnwrap,
  Index_thenUnwrapOr,
  Index_thenUnwrapOrElse,
  Index_thenUnwrapOrReject,
  Index_thenUnwrapErr,
  Index_thenUnwrapErrOr,
  Index_thenUnwrapErrOrElse,
  Index_thenTap,
  Index_thenTapAndWait,
  Index_thenTapErr,
  Index_thenTapErrAndWait,
  Index_flip,
  Index_from,
  Index_thenUnpack,
  Index_ok,
  Index_asyncOk,
  Index_err,
  Index_asyncErr,
  Index_isResult,
  Index_isOk,
  Index_isErr,
  Index_ensureResult,
  Index_okIf,
  Index_expect,
  Index_expectExists,
  Index_okIfExists,
  Index_map,
  Index_mapErr,
  Index_chain,
  Index_chainErr,
  Index_unwrap,
  Index_unwrapOr,
  Index_unwrapOrElse,
  Index_unwrapErr,
  Index_unwrapErrOr,
  Index_unwrapErrOrElse,
  Index_unpack,
  Index_match,
  Index_tap,
  Index_tapErr,
  Index_Do,
  Index_reduce,
  Index_collect,
  Index_partition,
  Index_sequence,
  Base_ok,
  Base_asyncOk,
  Base_err,
  Base_asyncErr,
  Base_isResult,
  Base_isOk,
  Base_isErr,
  Base_ensureResult,
  Base_okIf,
  Base_expect,
  Base_expectExists,
  Base_okIfExists,
  Base_Do,
  Fn_assertNever,
  Fn_compose2,
  Fn_compose,
  Fn_identity,
  Fn_idX,
  Fn_lazy,
  Fn_asConst,
  Fn_pipe,
  Fn_unreachable,
  Methods_map,
  Methods_mapErr,
  Methods_chain,
  Methods_chainErr,
  Methods_unwrap,
  Methods_unwrapOr,
  Methods_unwrapOrElse,
  Methods_unwrapErr,
  Methods_unwrapErrOr,
  Methods_unwrapErrOrElse,
  Methods_unpack,
  Methods_match,
  Methods_tap,
  Methods_tapErr,
  Lists_reduce,
  Lists_collect,
  Lists_partition,
  Lists_sequence,
});
