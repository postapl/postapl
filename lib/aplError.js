'use strict'

class AplError extends Error {

  constructor(message, line, column, file, plugin) {
    super(message)
    this.name = 'AplError'
    this.reason = message

    if (file) {
      this.file = file
    }
    if (plugin) {
      this.plugin = plugin
    }
    if (typeof line !== 'undefined' && typeof column !== 'undefined') {
      this.line = line
      this.column = column
    }

    this.setMessage()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AplError)
    }
  }

  setMessage() {
    this.message = this.plugin ? this.plugin + ': ' : ''
    this.message += this.file ? this.file : '<apl input>'
    if (typeof this.line !== 'undefined') {
      this.message += ':' + this.line + ':' + this.column
    }
    this.message += ': ' + this.reason
  }

}

module.exports = AplError
AplError.default = AplError
