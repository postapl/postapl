const { nodeTypes } = require('json-ast');

// Do not export this function as it provides the main traversal of the AST
function traverseAST(visitor, node) {
  switch (node.type) {
    case nodeTypes.DOCUMENT: {
      visitor.node(node);
      visitor.document(node);
      if (node.comments) {
        node.comments.forEach((commentNode) => {
          visitor.node(commentNode);
          visitor.comment(commentNode);
        });
      }
      if (node.child) {
        node.child.accept(visitor);
      }
      break;
    }
    case nodeTypes.OBJECT: {
      visitor.node(node);
      visitor.object(node);
      if (node.comments) {
        node.comments.forEach((commentNode) => {
          visitor.node(commentNode);
          visitor.comment(commentNode);
        });
      }
      if (node.properties) {
        node.properties.forEach((propNode) => { propNode.accept(visitor); });
      }
      break;
    }
    case nodeTypes.PROPERTY: {
      visitor.node(node);
      visitor.property(node);
      node.key.accept(visitor);
      node.value.accept(visitor);
      break;
    }
    case nodeTypes.KEY: {
      visitor.node(node);
      visitor.key(node);
      break;
    }
    case nodeTypes.ARRAY: {
      visitor.node(node);
      visitor.array(node);
      if (visitor.stop)
        break;
      if (node.comments) {
        node.comments.forEach((commentNode) => {
          visitor.node(commentNode);
          visitor.comment(commentNode);
        });
      }
      if (node.items) {
        node.items.forEach((itemNode) => { itemNode.accept(visitor); });
      }
      break;
    }
    case nodeTypes.STRING: {
      visitor.node(node);
      visitor.value(node);
      if (!visitor.stop)
        visitor.string(node);
      break;
    }
    case nodeTypes.NUMBER: {
      visitor.node(node);
      visitor.value(node);
      if (!visitor.stop)
        visitor.number(node);
      break;
    }
    case nodeTypes.TRUE: {
      visitor.node(node);
      visitor.value(node);
      if (!visitor.stop)
        visitor.boolean(node);
      break;
    }
    case nodeTypes.FALSE: {
      visitor.node(node);
      visitor.value(node);
      if (!visitor.stop)
        visitor.boolean(node);
      break;
    }
    case nodeTypes.NULL: {
      visitor.node(node);
      visitor.value(node);
      if (!visitor.stop)
        visitor.nil(node);
      break;
    }
    default:
      break;
  }
}

class Visitor {
  constructor() { this._stop = false; };

  set stop(_stop) { this._stop = !!_stop; }
  get stop() { return this._stop; }

  node(node) {
    //
  };

  document(docNode) {
    //
  };

  object(objectNode) {
    //
  };

  property(propertyNode) {
    //
  };

  key(keyNode) {
    //
  };

  array(arrayNode) {
    //
  };

  value(valueNode) {
    //
  };

  comment(commentNode) {
    //
  };

  string(stringNode) {
    //
  };

  number(numberNode) {
    //
  };

  boolean(booleanNode) {
    // encapsulates true | false
  };

  nil(nullNode) {
    // null
  };

  // Visit
  visit(node) {
    // call to "private" function
    if (this.stop)
      return;
    traverseAST(this, node);
  }
};

module.exports = Visitor
Visitor.default = Visitor
