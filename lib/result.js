'use strict'

const Warning = require('./warning')

class Result {
  constructor(processor, root, opts) {
    this.processor = processor
    this.messages = []
    this.root = root
    this.opts = opts
    this.apl = undefined
    this.json = undefined
  }

  toString() {
    return this.apl
  }

  warn(text, opts = {}) {
    let warning = new Warning(text, opts);
    this.messages.push(warning);

    return warning
  }

  warnings() {
    return this.messages.filter(i => i.type === 'warning')
  }

  get content() {
    return this.apl
  }
}

module.exports = Result
Result.default = Result
