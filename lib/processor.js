'use strict'

const { parse, AST, nodeTypes } = require('json-ast');
const Result = require('./result');
const AplError = require('./aplError');

class Processor {
  constructor(plugins = []) {
    this.version = '0.0.1';
    this.plugins = this.normalize(plugins);
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]))
    return this
  }

  async process(apl, opts = {}) {
    if (
      this.plugins.length === 0 &&
      !opts.hideNothingWarning
    ) {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(
            'You did not set any plugins. ' +
            'Right now, PostAPL does nothing. ' +
            'Pick plugins for your case ' +
            'on ?? and use them in postapl.config.js.'
          )
        }
      }
    }

    const root = this.parse(apl);
    this.prepareTree(root);

    this.opts = opts;
    this.result = new Result(this, root, opts)

    for (const plugin of this.plugins) {
      await plugin.process(this.result);
    }

    // remove marked deleted
    this.deleteMarked(root);

    this.result.json = AST.JsonNode.toJSON(root);
    this.result.apl = JSON.stringify(this.result.json, null, 2)

    return Promise.resolve(this.result);
  }

  parse(doc) {
    return parse(doc.toString());
  }

  prepareNode(node, parent) {
    node.parent = parent;
    if (parent === null) {
      node.path = ''
    } else {
      if (parent.type === nodeTypes.ARRAY) {
        const index = parent.items.indexOf(node);
        node.path = `${parent.path}.${index}`;
      } else {
        node.path = parent.path;
      }
    }

    node.markDelete = false;
    node.error = (message, opts = {}) => {
      return new AplError(message);
    }
  }


  prepareTree(node, parent = null) {
    this.prepareNode(node, parent);
    switch (node.type) {
      case nodeTypes.DOCUMENT: {
        if (node.comments) {
          node.comments.forEach((commentNode) => {
            this.prepareNode(commentNode, node);
          });
        }
        if (node.child) {
          this.prepareTree(node.child, node);
        }
        break;
      }
      case nodeTypes.OBJECT: {
        node.hasProperty = (propName) => {
          const index = node.properties.findIndex(p => p.key.value === propName);
          return index > -1;
        }

        node.getProperty = (propName) => {
          const prop = node.properties.find(p => p.key.value === propName);
          if (prop) {
            return prop;
          }

          return null;
        }

        node.setProperty = (key, value) => {
          const temp = { [key]: value };
          const ast = this.parse(JSON.stringify(temp, null, 2));
          const prop = ast.child.properties[0];

          const index = node.properties.findIndex(p => p.key.value === key);
          if (index > -1) {
            node.properties[index] = prop;
          } else {
            node.properties.push(prop);
          }

          this.prepareTree(prop, node);
        }

        node.removeProperty = (propName) => {
          const nodeToDelete = node.getProperty(propName);
          if (nodeToDelete) {
            const index = node.properties.indexOf(nodeToDelete);
            if (index > -1) {
              node.properties.splice(index, 1);
            }
          }
        }

        node.toJSON = () => {
          return AST.JsonNode.toJSON(node);
        }

        if (node.comments) {
          node.comments.forEach((commentNode) => {
            this.prepareNode(commentNode, node);
          });
        }
        if (node.properties) {
          node.properties.forEach((propNode) => {
            this.prepareTree(propNode, node);
          });
        }
        break;
      }
      case nodeTypes.PROPERTY: {
        if (node.path) {
          node.path += '.'
        }
        node.path += node.key.value;

        this.prepareTree(node.key, node);
        this.prepareTree(node.value, node);
        break;
      }
      case nodeTypes.ARRAY: {
        node.addItem = (value) => {
          const temp = [value];
          const ast = this.parse(JSON.stringify(temp, null, 2));
          const item = ast.child.items[0];
          node.items.push(item);
          this.prepareTree(item, node);
        }

        node.removeItem = (indexToDelete) => {
          if (indexToDelete > -1 && indexToDelete < node.items.length) {
            const isLast =
            node.items.splice(indexToDelete, 1);

            // recalculate path for items after index that were affected
            for (let index = indexToDelete; index < node.items.length; index++) {
              const item = node.items[index];
              this.prepareTree(item, node);
            }
          }
        }

        node.toJSON = () => {
          return AST.JsonNode.toJSON(node);
        }

        if (node.comments) {
          node.comments.forEach((commentNode) => {
            this.prepareNode(commentNode, node);
          });
        }
        if (node.items) {
          node.items.forEach((itemNode) => {
            this.prepareTree(itemNode, node);
          });
        }
        break;
      }
      // case nodeTypes.KEY: {
      //     break;
      // }
      // case nodeTypes.STRING: {
      //     break;
      // }
      // case nodeTypes.NUMBER: {
      //     break;
      // }
      // case nodeTypes.TRUE: {
      //     break;
      // }
      // case nodeTypes.FALSE: {
      //     break;
      // }
      // case nodeTypes.NULL: {
      //     break;
      // }
      default:
        break;
    }
  }

  deleteMarked(node) {
    let marked;
    switch (node.type) {
      case nodeTypes.DOCUMENT: {
        if (node.child) {
          this.deleteMarked(node.child);
        }
        break;
      }
      case nodeTypes.OBJECT: {
        marked = node.properties.filter(n => n.markDelete);
        marked.forEach((nodeToDelete) => {
          const index = node.properties.indexOf(nodeToDelete);
          if (index > -1) {
            node.properties.splice(index, 1);
          }
        })

        if (node.properties) {
          node.properties.forEach((propNode) => {
            this.deleteMarked(propNode);
          });
        }
        break;
      }
      case nodeTypes.PROPERTY: {
        this.deleteMarked(node.key, node);
        this.deleteMarked(node.value, node);
        break;
      }
      case nodeTypes.ARRAY: {
        marked = node.items.filter(n => n.markDelete);
        marked.forEach((nodeToDelete) => {
          const index = node.items.indexOf(nodeToDelete);
          if (index > -1) {
            node.items.splice(index, 1);
          }
        })

        if (node.items) {
          node.items.forEach((itemNode) => {
            this.deleteMarked(itemNode, node);
          });
        }
        break;
      }
      // case nodeTypes.KEY: {
      //     break;
      // }
      // case nodeTypes.STRING: {
      //     break;
      // }
      // case nodeTypes.NUMBER: {
      //     break;
      // }
      // case nodeTypes.TRUE: {
      //     break;
      // }
      // case nodeTypes.FALSE: {
      //     break;
      // }
      // case nodeTypes.NULL: {
      //     break;
      // }
      default:
        break;
    }

  }

  normalize(plugins) {
    let normalized = []
    for (let i of plugins) {
      if (i.postapl === true) {
        i = i()
      } else if (i.postapl) {
        i = i.postapl
      }

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins)
      } else if (typeof i === 'object' && i.postaplPlugin) {
        normalized.push(i)
      } else if (typeof i === 'function') {
        normalized.push(i)
      } else {
        throw new Error(i + ' is not a PostAPL plugin')
      }
    }
    return normalized
  }
}

module.exports = Processor
Processor.default = Processor
