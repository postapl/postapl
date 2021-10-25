'use strict'

const { Visitor } = require('../../lib/index');

// plugin
module.exports = (opts = {}) => {
  // no plugin options
  return {
    postaplPlugin: 'test-check-prepare',
    async process(result) {

      const visitor = new CheckVisitor(result);
      result.root.accept(visitor);
    }
  }
}
module.exports.postapl = true



// visitor
class CheckVisitor extends Visitor {
  constructor(result) {
    super();
    this.result = result;
  }

  node(node) {
    this.result.messages.push({
      type: 'log',
      message: `${node.type}:'${node.path}'`
    })

    if (node.parent === undefined
      || node.markDelete === undefined
      || node.error === undefined
      || node.path === undefined
      ) {
      this.result.warn('incomplete prepare', { node });
    }
  }
};
