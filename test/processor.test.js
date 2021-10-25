// const postapl = require('../lib/postapl');
const Processor = require('../lib/processor');

it('adds new plugins', () => {
  let a = () => { }
  let processor = new Processor()
  processor.use(a)
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object', () => {
  let a = () => { }
  let processor = new Processor()
  processor.use({ postapl: a })
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object-function', () => {
  let a = () => { }
  let obj = () => { }
  obj.postapl = a
  let processor = new Processor()
  processor.use(obj)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors of another postapl instance', () => {
  let a = () => { }
  let processor = new Processor()
  let other = new Processor([a])
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors from object', () => {
  let a = () => { }
  let processor = new Processor()
  let other = new Processor([a])
  processor.use({ postapl: other })
  expect(processor.plugins).toEqual([a])
})

it('returns itself', () => {
  let a = () => { }
  let b = () => { }
  let processor = new Processor()
  expect(processor.use(a).use(b).plugins).toEqual([a, b])
})

it.skip('processes APL', () => {
  let processor = new Processor()
  let result = processor.process('{"type": "APL", "version": "1.7"}', { hideNothingWarning: true });
  expect(result.apl).toEqual('{\n  "type": "APL",\n  "version": "1.7"\n}')
})

it.skip('send result to plugins', () => {
  expect.assertions(4)
  let processor = new Processor([() => { }])
  return processor
    .use((css, result) => {
      expect(result instanceof Result).toBe(true)
      expect(result.processor).toEqual(processor)
      expect(result.opts).toEqual({ map: true })
      expect(result.root).toEqual(css)
    })
    .process('a {}', { map: true, from: undefined })
})
