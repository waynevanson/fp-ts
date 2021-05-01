import { ixState as M } from '../src'
import { constVoid, pipe } from '../src/function'
import { deepStrictEqual, double } from './util'
import * as State from '../src/State'

describe('IxState', () => {
  it('put', () => {
    deepStrictEqual(M.put(9)(8), [constVoid(), 9])
  })

  it('toState', () => {
    const state = M.of<number, number>(4)
    deepStrictEqual(pipe(state, M.toState)(42), state(42))
  })

  it('fromState', () => {
    const state = State.of<number, number>(4)
    deepStrictEqual(pipe(state, M.fromState)(42), state(42))
  })

  describe('do notation', () => {
    it('Do', () => {
      deepStrictEqual(M.Do()(4), [{}, 4])
    })

    it('ibind', () => {
      deepStrictEqual(
        pipe(
          M.Do(),
          M.ibind('answer', () => M.of(42))
        )(constVoid()),
        [{ answer: 42 }, constVoid()]
      )
    })

    test('ibindTo', () => {
      deepStrictEqual(pipe(M.of(42), M.ibindTo('answer'))(constVoid()), [{ answer: 42 }, constVoid()])
    })

    it('bind', () => {
      deepStrictEqual(
        pipe(
          M.Do<number>(),
          M.bind('a', () => M.of(42)),
          M.bind('b', ({ a }) => M.of(a + 5))
        )(0),
        [{ a: 42, b: 47 }, 0]
      )
    })

    test('bindTo', () => {
      deepStrictEqual(pipe(M.of<number, number>(42), M.bindTo('answer'))(0), [{ answer: 42 }, 0])
    })
  })

  test('evaluate', () => {
    deepStrictEqual(pipe(M.of(42), M.evaluate(6)), 42)
  })

  test('execute', () => {
    deepStrictEqual(pipe(M.imodify(double), M.execute(42)), 84)
  })

  test('get', () => {
    deepStrictEqual(M.get<number>()(42), [42, 42])
  })

  test('gets', () => {
    deepStrictEqual(M.gets<number, string>(String)(42), ['42', 42])
  })

  test('imodify', () => {
    deepStrictEqual(M.imodify(String)(42), [constVoid(), '42'])
  })

  it('map', () => {
    deepStrictEqual(pipe(M.of(4), M.map(double))(9), [8, 9])
  })
  it('imap', () => {
    deepStrictEqual(pipe(M.of(4), M.imap(double))(9), [8, 9])
  })

  it('flap', () => {
    deepStrictEqual(
      pipe(
        M.of((x: number) => `${x}`),
        M.flap(1)
      )(100),
      [`${1}`, 100]
    )
  })

  it('iflap', () => {
    deepStrictEqual(
      pipe(
        M.of((x: number) => `${x}`),
        M.iflap(1)
      )(100),
      [`${1}`, 100]
    )
  })

  test('ichain', () => {
    deepStrictEqual(
      pipe(
        M.of<number, void>(constVoid()),
        M.ichain(() => M.imodify<number, string>(String)),
        M.ichain(() => M.imodify<string, Array<string>>((a) => a.split('')))
      )(42),
      [constVoid(), ['4', '2']]
    )
  })

  test('chain', () => {
    deepStrictEqual(
      pipe(
        M.of<number, number>(1),
        M.chain((x) => M.imodify((y) => x + y)),
        M.chain(() => M.imodify((y) => y - 2))
      )(42),
      [constVoid(), 41]
    )
  })

  it('ichainFirst', () => {
    deepStrictEqual(
      pipe(
        M.of<number, string>('answer'),
        M.ichainFirst(() => M.imodify(String))
      )(42),
      ['answer', '42']
    )
  })

  test('of', () => {
    deepStrictEqual(M.of<number, string>('The Answer')(42), ['The Answer', 42])
  })
  test('iof', () => {
    deepStrictEqual(M.iof<number, string>('The Answer')(42), ['The Answer', 42])
  })

  test('iap', () => {
    deepStrictEqual(
      pipe(
        M.of<string, (a: number) => number>(double),
        M.iap(
          pipe(
            M.of<string, number>(42),
            M.ichainFirst(() => M.imodify((a) => a.split(', ')))
          )
        )
      )('Hello, World!'),
      [84, ['Hello', 'World!']]
    )
  })

  test('ap', () => {
    deepStrictEqual(
      pipe(
        M.of<string, (a: string) => string>((x) => x.concat(x)),
        M.ap(
          pipe(
            M.of<string, string>('42'),
            M.ichainFirst(() => M.imodify((a) => a.replace(', ', '')))
          )
        )
      )('Hello, World!'),
      ['4242', 'HelloWorld!']
    )
  })

  test('iapFirst', () => {
    deepStrictEqual(
      pipe(
        M.of<number, number>(4),
        M.iapFirst(
          pipe(
            M.of<number, number>(2),
            M.ichainFirst(() => M.imodify<number, string>(String))
          )
        )
      )(42),
      [4, '42']
    )
  })

  test('iapSecond', () => {
    deepStrictEqual(
      pipe(
        M.of<number, number>(4),
        M.iapSecond(
          pipe(
            M.of<number, number>(2),
            M.ichainFirst(() => M.imodify<number, string>(String))
          )
        )
      )(42),
      [2, '42']
    )
  })

  test('apFirst', () => {
    deepStrictEqual(
      pipe(
        M.of<string, string>('Hello, World!'),
        M.apFirst(
          pipe(
            M.of<string, string>('42'),
            M.ichainFirst(() => M.imodify((a) => a.replace(', ', '')))
          )
        )
      )('Hello, World!'),
      ['Hello, World!', 'HelloWorld!']
    )
  })

  test('apSecond', () => {
    deepStrictEqual(
      pipe(
        M.of<string, string>('Hello, World!'),
        M.apSecond(
          pipe(
            M.of<string, string>('42'),
            M.ichainFirst(() => M.imodify((a) => a.replace(', ', '')))
          )
        )
      )('Hello, World!'),
      ['42', 'HelloWorld!']
    )
  })

  test('iapS', () => {
    deepStrictEqual(pipe(M.Do(), M.iapS('answer', M.of(42)))(constVoid()), [{ answer: 42 }, constVoid()])
  })

  test('local', () => {
    deepStrictEqual(
      pipe(
        M.of<number, void>(constVoid()),
        M.local<number, string>(Number),
        M.ichain(() => M.imodify(double))
      )('42'),
      [constVoid(), 84]
    )
  })
})
