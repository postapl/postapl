const postapl = require('../lib/postapl');
const Processor = require('../lib/processor');

it('creates plugins list', () => {
  let processor = postapl();
  expect(processor instanceof Processor).toBe(true)
  expect(processor.plugins).toEqual([])
})

it('saves plugins list', () => {
  let a = () => { }
  let b = () => { }
  expect(postapl(a, b).plugins).toEqual([a, b])
})

it('saves plugins list as array', () => {
  let a = () => { }
  let b = () => { }
  expect(postapl([a, b]).plugins).toEqual([a, b])
})

it('takes plugin from other processor', () => {
  let a = () => { }
  let b = () => { }
  let c = () => { }
  let other = postapl([a, b])
  expect(postapl([other, c]).plugins).toEqual([a, b, c])
})
