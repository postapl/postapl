'use strict'

const { nodeTypes } = require('json-ast');

function getNodePath(node) {
  if (!node.parent) {
    return '';
  }
  let path = getNodePath(node.parent);
  if (node.parent.type === nodeTypes.PROPERTY) {
    const key = node.parent.key.value;
    path = appendPath(path, key);
  } else if (node.parent.type === nodeTypes.ARRAY) {
    const index = node.parent.items.indexOf(node);
    if (index !== -1) {
      path = appendPath(path, index);
    }
  }
  return path;
}

function appendPath(path, value) {
  if (path) {
    path += '.' + value;
  } else {
    path += value;
  }

  return path
}

function findNode(node, path) {
  let found = null;

  if (path) {
    const segments = path.split('.');
    found = findNodeBySegment(node, segments);
  } else {
    if (node.type === nodeTypes.DOCUMENT) {
      found = node.child;
    }
  }

  return found;
}

function findNodeBySegment(node, segments) {
  if (node && segments.length > 0) {

    if (node.type === nodeTypes.DOCUMENT) {
      if (node.child) {
        return findNodeBySegment(node.child, segments);
      }
    }

    if (node.type === nodeTypes.PROPERTY) {
      if (node.value) {
        return findNodeBySegment(node.value, segments);
      }
    }

    if (node.type === nodeTypes.OBJECT) {
      if (node.properties) {
        const index = node.properties.findIndex(p => p.key.value === segments[0]);
        if (index > -1) {
          segments.shift();
          return findNodeBySegment(node.properties[index], segments);
        } else {
          return null;
        }
      }
    }

    if (node.type === nodeTypes.ARRAY) {
      if (node.items) {
        const index = segments[0];
        if (!isNaN(index)) {
          if (index > -1 && index < node.items.length) {
            segments.shift();
            return findNodeBySegment(node.items[index], segments);
          } else {
            return null
          }
        }
      }
    }
  }

  return node;
}

function isWhen(node) {
  return (node.type === nodeTypes.PROPERTY &&
    node.key.value === 'when');
}

function getDataBindingExpressions(node) {
  let result = [];

  if (node.type === nodeTypes.STRING) {
    const dataBindingExpressionRegex = /\${.+?}/gm
    result = Array.from(node.value.matchAll(dataBindingExpressionRegex), e => e[0]);
  }

  return result;
}

function hasDataBindingExpressions(node) {
  return getDataBindingExpressions(node).length > 0;
}

function getResources(node) {
  let result = [];

  if (node.type === nodeTypes.STRING) {
    const resourceRegex = /@\w+/gm
    result = Array.from(node.value.matchAll(resourceRegex), r => r[0]);
  }

  return result;
}

function hasResources(node) {
  return getResources(node).length > 0;
}

function pathStartsWith(path, searchString) {
  let result = false;

  if (path) {
    result = path.startsWith(searchString)
  }

  return result;
}


function pathEndsWith(path, searchString) {
  let result = false;

  if (path) {
    result = path.endsWith(searchString)
  }

  return result;
}


function pathContains(path, searchString) {
  let result = false;

  if (path) {
    result = path.includes(searchString)
  }

  return result;
}

function isComponent(node) {
  let result = false;

  if (node.type === nodeTypes.OBJECT) {
    const path = getNodePath(node);

    return ((path.startsWith('mainTemplate') || path.startsWith('layouts'))
      && (node.hasProperty('type')))
  }

  return result;
}

module.exports = {
  getNodePath,
  findNode,
  isWhen,
  isComponent,
  getDataBindingExpressions,
  hasDataBindingExpressions,
  getResources,
  hasResources,
  pathStartsWith,
  pathEndsWith,
  pathContains,
};
