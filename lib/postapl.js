'use strict'

const Processor = require('./processor');

function postapl(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0]
  }
  return new Processor(plugins)
}

module.exports = postapl
postapl.default = postapl
