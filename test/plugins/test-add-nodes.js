'use strict'

const { Visitor } = require('../../lib/index');

// plugin
module.exports = (opts = {}) => {
  // no plugin options
  return {
    postaplPlugin: 'test-check-prepare',
    async process(result) {

      const visitor = new AddNodesVisitor(result);
      result.root.accept(visitor);
    }
  }
}
module.exports.postapl = true



// visitor
class AddNodesVisitor extends Visitor {
  constructor(result) {
    super();
    this.result = result;
  }

  object(node) {
    // this.result.messages.push({
    //   type: 'log',
    //   message: `${node.type}:'${node.path}'`
    // })

    if (node.path === 'mainTemplate.items.0') {
      node.setProperty('fake', { a: 'a', b: [{ c: 'hello' }] });
    }
  }

  array(node) {
    if (node.path === 'mainTemplate.items.0.items') {
      node.addItem({ type: 'testComponent', b: [{ c: 'hello' }] });
    }
  }
};
