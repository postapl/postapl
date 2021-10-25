const fs = require('fs');
let { postapl } = require('../lib/index');
let checkPrepare = require('./plugins/test-check-prepare')
let addNodes = require('./plugins/test-add-nodes')

async function run(plugins, input, output, opts) {
  let result = await postapl(plugins).process(input.toString(), { from: undefined })
  // expect(result.apl).toEqual(output.toString())
  expect(result.warnings()).toHaveLength(0)
}

it('all nodes should be prepared', async () => {
  const input = fs.readFileSync('./test/data/data1-input.json');
  const output = fs.readFileSync('./test/data/data1-output.json');
  await run([checkPrepare()], input, output);
})

it('added nodes should be prepared', async () => {
  const input = fs.readFileSync('./test/data/data1-input.json');
  const output = fs.readFileSync('./test/data/data1-output.json');
  await run([addNodes(), checkPrepare()], input, output);
})
