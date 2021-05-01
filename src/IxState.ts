/**
 * `IxState` (Indexed State) is a derivation of `State`, that may have **polymorphic** states;
 * The input may be of a different type than the output.
 *
 * State changes are kept track of by the generics `I`, `O`, `X` and `Z`.
 * - `I` indicates the current input state
 * - `O` indicates the current output state
 * - `Z` indicates the next input state
 * - `Z` indicates the next output state
 *
 * When composing `IxState` where the indexes are polymorhpic, functions `ichain` and `iap` can be
 * used to compose `<I, O>` with `<O, Z>` to return `<I, Z>`.
 *
 * Intuitively this is function composition on the indexes.
 *
 *
 * `IxState` derived by applying the `Identity` monad to the transformer `IxStateT`.
 * @since 2.10.0
 */

import { Apply2, apFirst as apFirst_, apSecond as apSecond_, apS as apS_ } from './Apply'
import { Chain2, bind as bind_ } from './Chain'
import { Functor3, bindTo as bindTo_, flap as flap_ } from './Functor'
import { IxApplicative3 } from './IxApplicative'
import { IxApply3, iapFirst as iapFirst_, iapSecond as iapSecond_, iapS as iapS_ } from './IxApply'
import { IxChain3, ichainFirst as ichainFirst_, ibind as ibind_ } from './IxChain'
import { IxFunctor3, ibindTo as ibindTo_, iflap as iflap_ } from './IxFunctor'
import { IxMonad3 } from './IxMonad'
import { IxPointed3 } from './IxPointed'
import { Monad2 } from './Monad'
import { Pointed2 } from './Pointed'
import { State } from './State'
import * as I from './Identity'
import * as IxStateT from './IxStateT'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category Model
 * @since 2.10.0
 */
export interface IxState<I, O, A> {
  (i: I): [A, O]
}

/**
 * @category Model
 * @since 2.10.0
 */
export const URI = 'IxState'

/**
 * @category Model
 * @since 2.10.0
 */
export type URI = typeof URI

declare module './HKT' {
  export interface URItoKind3<R, E, A> {
    readonly [URI]: IxState<R, E, A>
  }

  // Allows usage with `ap, `chain` and `of`: Isomorphic state.
  export interface URItoKind2<E, A> {
    readonly [URI]: IxState<E, E, A>
  }
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @summary
 * Apply a function to the state, polymorphically changing the resulting state.
 *
 * @category constructors
 * @since 2.10.0
 */
export const imodify: <I, O>(f: (i: I) => O) => IxState<I, O, void> =
  /*#__PURE__*/
  IxStateT.imodify(I.Pointed)

/**
 * @category constructors
 * @since 2.10.0
 */
export const put: <I>(fi: I) => IxState<I, I, void> =
  /*#__PURE__*/
  IxStateT.put(I.Pointed)

/**
 * @category constructors
 * @since 2.10.0
 */
export const fromState: <I, A>(fa: State<I, A>) => IxState<I, I, A> = IxStateT.fromStateF<I.URI>()

/**
 * @category constructors
 * @since 2.10.0
 */
export const get =
  /*#__PURE__*/
  IxStateT.get(I.Pointed)

/**
 * @category constructors
 * @since 2.10.0
 */
export const gets =
  /*#__PURE__*/
  IxStateT.gets(I.Pointed)

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 2.10.0
 */
export const toState: <I, A>(fa: IxState<I, I, A>) => State<I, A> = IxStateT.toStateF<I.URI>()

/**
 * @category destructors
 * @since 2.10.0
 */
export const execute =
  /*#__PURE__*/
  IxStateT.iexecute(I.Functor)

/**
 * @category destructors
 * @since 2.10.0
 */
export const evaluate =
  /*#__PURE__*/
  IxStateT.evaluate(I.Functor)

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _iof: IxPointed3<URI>['iof'] = (a) => (i) => [a, i]
const _imap: IxFunctor3<URI>['imap'] = (fa, f) => (i) => {
  const [a, o] = fa(i)
  return [f(a), o]
}
const _iap: IxApply3<URI>['iap'] = (fab, fa) => (i) => {
  const [f, o] = fab(i)
  const [a, z] = fa(o)
  return [f(a), z]
}
const _ichain: IxChain3<URI>['ichain'] = (fa, f) => (i) => {
  const [a, o] = fa(i)
  const [b, z] = f(a)(o)
  return [b, z]
}
const _of: Pointed2<URI>['of'] = _iof
const _map: Functor3<URI>['map'] = _imap
const _ap: Apply2<URI>['ap'] = _iap
const _chain: Chain2<URI>['chain'] = _ichain

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.10.0
 */
export const IxFunctor: IxFunctor3<URI> = {
  URI,
  imap: _imap
}

/**
 * @category instances
 * @since 2.10.0
 */
export const IxApply: IxApply3<URI> = {
  URI,
  imap: _imap,
  iap: _iap
}

/**
 * @category instances
 * @since 2.10.0
 */
export const IxChain: IxChain3<URI> = {
  URI,
  imap: _imap,
  iap: _iap,
  ichain: _ichain
}

/**
 * @category instances
 * @since 2.10.0
 */
export const IxPointed: IxPointed3<URI> = {
  URI,
  iof: _iof
}

/**
 * @category instances
 * @since 2.10.0
 */
export const IxApplicative: IxApplicative3<URI> = {
  URI,
  iof: _iof,
  imap: _imap,
  iap: _iap
}

/**
 * @category instances
 * @since 2.10.0
 */
export const IxMonad: IxMonad3<URI> = {
  URI,
  iof: _iof,
  imap: _imap,
  iap: _iap,
  ichain: _ichain
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Pointed: Pointed2<URI> = { URI, of: _of }

/**
 * @category instances
 * @since 2.10.0
 */
export const Functor: Functor3<URI> = {
  URI,
  map: _imap
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Apply: Apply2<URI> = {
  URI,
  map: _map,
  ap: _ap
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain
}
/**
 * @category instances
 * @since 2.10.0
 */
export const Monad: Monad2<URI> = {
  URI,
  of: _of,
  map: _map,
  ap: _ap,
  chain: _chain
}

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * @category IxPointed
 * @since 2.10.0
 */
export const iof: IxPointed3<URI>['iof'] = _iof

/**
 * @category IxFunctor
 * @since 2.10.0
 */
export const imap =
  /*#__PURE__*/
  IxStateT.imap(I.Functor)

/**
 * @category IxFunctor
 * @since 2.10.0
 */
export const iflap =
  /*#__PURE__*/
  iflap_(IxFunctor)

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category IxApply
 * @since 2.10.0
 */
export const iap =
  /*#__PURE__*/
  IxStateT.iap(I.Chain)

/**
 * @category IxApply
 *
 * @since 2.10.0
 */
export const iapFirst =
  /*#__PURE__*/
  iapFirst_(IxApply)

/**
 * @category IxApply
 * @since 2.10.0
 */
export const iapSecond =
  /*#__PURE__*/
  iapSecond_(IxApply)

/**
 * @category Apply
 *
 * @since 2.10.0
 */
export const apFirst =
  /*#__PURE__*/
  apFirst_(Apply)

/**
 * @category Apply
 * @since 2.10.0
 */
export const apSecond =
  /*#__PURE__*/
  apSecond_(Apply)

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category IxChain
 *
 * @since 2.10.0
 */
export const ichain =
  /*#__PURE__*/
  IxStateT.ichain(I.Chain)

/**
 * @category IxChain
 * @since 2.10.0
 */
export const ichainFirst =
  /*#__PURE__*/
  ichainFirst_(IxChain)

/**
 * @category Pointed
 * @since 2.10.0
 */
export const of: Pointed2<URI>['of'] =
  /*#__PURE__*/
  IxStateT.of(I.Pointed)

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.10.0
 */
export const map =
  /*#__PURE__*/
  IxStateT.map(I.Functor)

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.10.0
 */
export const flap =
  /*#__PURE__*/
  flap_(Functor)

/**
 *
 * @category Apply
 * @since 2.10.0
 */
export const ap =
  /*#__PURE__*/
  IxStateT.ap(I.Chain)

/**
 *
 * @category Chain
 * @since 2.10.0
 */
export const chain =
  /*#__PURE__*/
  IxStateT.chain(I.Chain)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @category combinators
 * @since 2.10.0
 */
export const local = IxStateT.local<I.URI>()

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 2.10.0
 */
export const Do = <I>() => _iof<I, {}>({})

/**
 * @since 2.10.0
 */
export const ibind =
  /*#__PURE__*/
  ibind_(IxChain)

/**
 * @since 2.10.0
 */
export const ibindTo =
  /*#__PURE__*/
  ibindTo_(IxChain)

/**
 * @since 2.10.0
 */
export const bind =
  /*#__PURE__*/
  bind_(Chain)

/**
 * @since 2.10.0
 */
export const bindTo =
  /*#__PURE__*/
  bindTo_(Chain)

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 2.10.0
 */
export const iapS =
  /*#__PURE__*/
  iapS_(IxApply)

/**
 * @since 2.10.0
 */
export const apS =
  /*#__PURE__*/
  apS_(Apply)
