import { Just, Nothing } from '../src/maybe'
import { Ok, Err } from '../src/result'
import { parseDate } from '../src/parseDate'
import { justs } from '../src/justs'
import { oks } from '../src/oks'
import { encase, encaseRes } from '../src/encase'
import { get } from './../src/get'
import { head } from './../src/head'
import { last } from './../src/last'
import { tail } from './../src/tail'

describe('utililties', () => {

  it('parseDate: should properly parse date strings and return a Maybe', done => {
    const goodDate = '2019-02-13T21:04:10.984Z'
    const badDate = '2019-02-13T21:04:1'

    parseDate(goodDate).cata({
      Just: date => expect(date.toISOString()).toBe(goodDate),
      Nothing: done.fail
    })

    parseDate(badDate).cata({
      Just: done.fail,
      Nothing: done
    })

    parseDate(null).cata({
      Just: x => expect(x).toBe(),
      Nothing: done
    })

    done()
  })

  it('justs: should filter out any non-just types in an array', () => {
    const data = [Just(19), Just('abc'), Nothing, 'hello', {}, true, false, 19, Just(-78)]
    const jsts = justs(data)
    const allJusts = jsts.map(j => j.isJust()).every(j => !!j)

    expect(jsts).toHaveLength(3)
    expect(allJusts).toBe(true)
  })

  it('oks: should filter out any non-ok types in an array', () => {
    const data = [Ok(19), Just('abc'), Nothing, 'hello', {}, Err('no bueno'), false, 19, Just(-78)]
    const ok = oks(data)
    const allOks = ok.map(o => o.isOk()).every(o => !!o)

    expect(ok).toHaveLength(1)
    expect(allOks).toBe(true)
  })

  it('encase & encaseRes: should be able to handle throwable functions properly', done => {
    const throwableFunc = () => { throw new Error('i threw') }
    const throwableFunc2 = () => JSON.parse('<>')

    encase(() => 'hello').cata({
      Just: x => expect(x).toBe('hello'),
      Nothing: done.fail
    })

    encase(throwableFunc).cata({
      Just: done.fail,
      Nothing: done
    })

    encaseRes(() => 'hello').cata({
      Ok: x => expect(x).toBe('hello'),
      Err: done.fail
    })

    encaseRes(throwableFunc).cata({
      Ok: done.fail,
      Err: x => expect(x.toString()).toBe('Error: i threw')
    })

    encaseRes(throwableFunc2).cata({
      Ok: done.fail,
      Err: x => expect(x.toString()).toBe('SyntaxError: Unexpected token < in JSON at position 0')
    })

    encaseRes(() => JSON.parse(`{"name": "jason"}`)).cata({
      Ok: x => expect(x).toEqual({name: 'jason'}),
      Err: done.fail,
    })

    done()
  })

  it('get: should safely get nested data and return a Maybe', done => {

    const data = {
      name: 'jason',
      children: [
        {
          name: 'bob'
        },
        {
          name: 'blanche',
          children: [
            {
              name: 'lera'
            }
          ]
        }
      ]
    }

    get(['children', 1, 'children', 0, 'name'])(data).cata({
      Just: name => expect(name).toBe('lera'),
      Nothing: done.fail
    })

    get(['children', 7, 'children', 0, 'name'])(data).cata({
      Just: done.fail,
      Nothing: done
    })

    done()
  })

  it('head: should get the first element on an array and return a Maybe', done => {

    const data = [5,2,3]

    head(data)
      .cata({
        Just: x => expect(x).toBe(5),
        Nothing: done.fail
      })

    head([])
      .cata({
        Just: done.fail,
        Nothing: done
      })

    done()
  })

  it('last: should get the last element on an array and return a Maybe', done => {

    const data = [5,2,3]

    last(data)
      .cata({
        Just: x => expect(x).toBe(3),
        Nothing: done.fail
      })

    last([])
      .cata({
        Just: done.fail,
        Nothing: done
      })

    done()
  })

  it('tail: should remove the first element on an array and return a Maybe', done => {

    const data = [5,2,3]

    tail(data)
      .cata({
        Just: x => expect(x).toEqual([2,3]),
        Nothing: done.fail
      })

    tail([])
      .cata({
        Just: done.fail,
        Nothing: done
      })

    done()
  })

})