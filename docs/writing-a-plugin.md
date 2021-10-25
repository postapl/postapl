# Writing a PostAPL Plugin

## Links

Documentation:

* [Plugin Boilerplate](https://github.com/postapl/postapl-plugin-boilerplate)
* [Plugin Guidelines](https://github.com/postapl/postapl/blob/main/docs/guidelines/plugin.md)

Support:

* [Mark Tucker](https://twitter.com/marktucker)


## Step 1: Think of an idea

There are many reasons for writing a new PostAPL plugin:

* **Automate routine operations:** let’s computer do routine operations, free
  yourself for creative tasks.
* **Consistency:** APL documents can change over time. Keeping all files consistent can be a real challenge.
* **Reporting:** analyze APL documents to determine what components are being used.

## Step 2: Create a project

There are two ways to write a plugin:

* Create a **private** plugin. Use this way only if the plugin is related
  to specific things of projects. For instance, you want to automate a specific
  task for internal use.
* Publish a **public** plugin. It is always the recommended way. Remember that
  private front-end systems, even in Google, often became unmaintained.
  On the other hand, many popular plugins were created during the work
  on a closed source project.

For private plugin:
1. Create a new file in `postapl/` folder with the name of your plugin.
2. Copy [plugin template] from our boilerplate.

For public plugins:
1. Use the guide in [PostAPL plugin boilerplate] to create a plugin directory.
2. Create a repository on GitHub or GitLab.
3. Publish your code there.


```js
module.exports = (opts = {}) => {
  // Plugin creator to check options or prepare caches
  return {
    postaplPlugin: 'PLUGIN NAME'
    async process(result) {
      // access AST
      // OR
      // use a custom Visitor
    }
  }
}
module.exports.postapl = true
```

[PostAPL plugin boilerplate]: https://github.com/postapl/postapl-plugin-boilerplate/
[our Sharec config]: https://github.com/postapl/postapl-sharec-config
[plugin template]: https://github.com/postapl/postapl-plugin-boilerplate/blob/main/index.js

## Step 3: Learn the Basics

To create a plugin, there are some concepts you need to understand:
1. Abstract Syntax Tree (AST) nodes
2. Helper functions from pluginTools

### Abstract Syntax Tree

PostAPL parses APL to the tree of nodes (called an AST).

This tree contains the following types of nodes:

* `JsonDocument`: node at the top of the tree, which represents the APL file.

  ```js
  //JsonDocument
  type: 'document'
  parent: null
  markDelete: boolean
  child: JsonObject | JsonArray
  comments: [JsonComment]

  accept(visitor)
  error(message, opts)
  ```

* `JsonObject`: represents an object.

  ```js
  //JsonObject
  type: 'object'
  parent: JsonDocument | JsonArray | JsonProperty
  markDelete: boolean
  properties: [JsonProperty]
  comments: [JsonComment]

  accept(visitor)
  error(message, opts)
  hasProperty(propName)
  setProperty(key, value)
  ```

* `JsonArray`: represents an array.

  ```js
  //JsonArray
  type: 'array'
  parent: any
  markDelete: boolean
  items: [JsonArray | JsonObject | JsonString | JsonNumber | JsonTrue | JsonFalse | JsonNull]
  comments: [JsonComment]

  accept(visitor)
  error(message, opts)
  addItem(value)
  ```

* `JsonProperty`: represents a property.

  ```js
  //JsonProperty
  type: 'property'
  parent: any
  markDelete: boolean
  key: JsonKey
  value: JsonObject | JsonArray | JsonString | JsonNumber | JsonTrue | JsonFalse | JsonNull

  accept(visitor)
  error(message, opts)
  ```

* `JsonString`: a string value.

  ```js
  //JsonString
  type: 'string'
  parent: any
  markDelete: boolean
  value: string

  accept(visitor)
  error(message, opts)
  ```

* `JsonNumber`: a number value.

  ```js
  //JsonNumber
  type: 'number'
  parent: any
  markDelete: boolean
  value: number

  accept(visitor)
  error(message, opts)
  ```

* `JsonTrue`: a true value.

  ```js
  //JsonTrue
  type: 'true'
  parent: any
  markDelete: boolean
  value: true

  accept(visitor)
  error(message, opts)
  ```

* `JsonFalse`: a false value.

  ```js
  //JsonFalse
  type: 'false'
  parent: any
  markDelete: boolean
  value: false

  accept(visitor)
  error(message, opts)
  ```

* `JsonNull`: a null value.

  ```js
  //JsonNull
  type: 'null'
  parent: any
  markDelete: boolean
  value: null

  accept(visitor)
  error(message, opts)
  ```

* `JsonKey`: a key.

  ```js
  //JsonKey
  type: 'key'
  parent: any
  markDelete: boolean
  value: string

  accept(visitor)
  error(message, opts)
  ```

* `JsonValue`: a value.

  ```js
  //JsonValue
  type: 'value'
  parent: any
  markDelete: boolean
  value: string | number | boolean | null

  accept(visitor)
  error(message, opts)
  ```

* `JsonComment`: a comment.

  ```js
  //JsonComment
  type: 'comment'
  parent: JsonDocument | JsonObject | JsonArray
  markDelete: boolean
  value: string

  accept(visitor)
  error(message, opts)
  ```

### PluginTools
The [`pluginTools`] module has functions to help you navigate the AST or perform condition checks:

* `getNodePath(node)` - given an AST node, get the JSON path that would lead you to that object. The path is in the form of `import.0.name` which contains property names and array index numbers.

  - node - the AST node to find the path to


  NOTE: Each call to getNodePath walks the tree from parent to parent to calculate the path. Store the path in a variable if you need to access it multiple times.

* `pathStartsWith(path, searchString)` - given a JSON path, check if it starts with a string.
  - path - JSON path for the AST node
  - searchString - the string to search for

* `pathEndsWith(path, searchString)` - given a JSON path, check if it ends with a string.
  - path - JSON path for the AST node
  - searchString - the string to search for

* `pathContains(path, searchString)` - given a JSON path, check if it contains a string.
  - path - JSON path for the AST node
  - searchString - the string to search for

* `findNode(node, path)` - given a JSON path, find the AST node that matches it.
  - node - the node to start the search
  - path - the JSON Path in the form of `import.0.name`

* `isWhen(node)` - check if the node is a JsonProperty that has a key equal to 'when'.
  - node - the node to check

* `isComponent(node)` - check if the node is a JsonObject that has a 'type' property that has a path that starts with 'mainTemplate' or 'layouts'.
  - node - the node to check

* `hasDataBindingExpressions(node)` - check if the node is a JsonString that includes a Data Binding Express with the format of `'${expression}'`.
  - node - the node to check

* `getDataBindingExpressions(node)` - check if the node is a JsonString and returns an array that contains the Data Binding Expression.
  - node - the node to check

* `hasResources(node)` - check if the node is a JsonString that includes APL resource with the format of `'@resource'`.
  - node - the node to check

* `getResources(node)` - check if the node is a JsonString and returns an array that contains resources.
  - node - the node to check

[`pluginTools`]: https://github.com/postapl/postapl/blob/main/lib/pluginTools.js


## Step 4: Find nodes

Most of the PostAPL plugins do two things:
1. Find something in APL
2. Add, update, or delete nodes

### Navigate AST Nodes

The AST is a tree of nodes that have properites to navigate down and up the tree.

```js
module.exports = (opts = {}) => {
  return {
    postaplPlugin: 'PLUGIN NAME',
    async process(result) {
      const propertyNode = result.root.child.properties[1];
      const key = propertyNode.key.value;
      const value = propertyNode.value.value;
      const grandparent = propertyNode.parent.parent;

      const marked = result.root.child.properties.filter(n => n.markDelete);
    }
  }
}
module.exports.postapl = true
```


### Navigate Using JSON Path
The AST representation of a JSON document has a bigger tree with more objects than the JSON document and it can be slightly more cumbersome to navigate.

If you know the JSON path to navigate to a node, you can use that against the AST. Let's say you want to navigate to the first import in an APL document and access the name property, the path would be: `import.0.name`. This will take you to the *JsonProperty* node for the corresponding name property.

Use `pluginTools.findNode(node, path)` to find the AST node. If the path is not found, the function will return `null`.

```js
const { pluginTools } = require('postapl');

module.exports = (opts = {}) => {
  return {
    postaplPlugin: 'PLUGIN NAME',
    async process(result) {
      const propertyNode = pluginTools.findNode(result.root, 'import.0.name');

      const key = propertyNode.key.value;
      const value = propertyNode.value.value;
    }
  }
}
```

### Implement a Visitor

A Visitor is a pattern that separates traversing a tree from the actions called at each node.

For PostAPL, there is a base class that your visitor must extend and various functions that get called per node.

Here is a sample visitor that also show which nodes cause them to be called:

```js
const { Visitor } = require('postapl');

module.exports = (opts = {}) => {
  return {
    postaplPlugin: 'PLUGIN NAME',
    async process(result) {

      // pre-visitor processing

      const visitor = new MyVisitor(result, this.postaplPlugin);
      result.root.accept(visitor);

      // post-visitor processing
    }
  }
}
module.exports.postapl = true

// plugin private visitor
class MyVisitor extends Visitor {
  constructor(result, pluginName) {
    super();
    this.result = result;
    this.pluginName = pluginName;
  }

  node(node) {
    // all nodes
  }

  document(documentNode) {
    // JsonDocument
  }

  object(objectNode) {
    // JsonObject

    // stop traversing nodes after this one
    this.stop = true;
  }

  array(arrayNode) {
    // JsonArray
  }

  property(propNode) {
    // JsonProperty
  }

  key(keyNode) {
    // JsonKey
  }

  value(valueNode) {
    // JsonString, JsonNumber, JsonTrue, JsonFalse, JsonNull
  }

  string(stringNode) {
    // JsonString
  }

  number(numberNode) {
    // JsonNumber
  }

  boolean(booleanNode) {
    // JsonTrue, JsonFalse
  }

  nil(nullNode) {
    // JsonNull

    this.result.warn('message', { node: nullNode });
  }

  comment(commentNode) {
    // JsonComment

    this.result.messages.push({
      type: 'info',
      key: 'comment',
      value: commentNode.value,
      plugin: this.pluginName
    });
  }

};

```
NOTES:

- You only need to include the functions (node, document, object, array, property, key, value, string, number, boolean, nil, comment) for those nodes that you are interested in.
- If you listen for the `node()` function you won't listen for the other function as the same node will trigger each of the listeners.
- Similarly, if you listen for the `value()` function, you won't listen for string, number, boolean, nil as there will be duplicate triggers.
- The visitor will walk every node in the AST. If you don't need the remaining nodes traversed, you can set `this.stop = true`
- You can pass `result` in the constructor of the visitor so that a listener function can log a warning or another message.
- You can pass the plugin name (postaplPlugin) to the visitor to be used in messages.

### Mixed Navigation

You can use a visitor to find specific nodes based on a type and then use AST node navigation or JSON path navigation to get to a different node:

```js
const { Visitor, pluginTools } = require('postapl');

module.exports = (opts = {}) => {
  return {
    postaplPlugin: 'PLUGIN NAME',
    async process(result) {

      // pre-visitor processing

      const visitor = new MyVisitor();
      result.root.accept(visitor);

      // post-visitor processing
    }
  }
}
module.exports.postapl = true

// plugin private visitor
class MyVisitor extends Visitor {
  constructor() {
    super();
  }

  string(stringNode) {
    const parent = stringNode.parent;
    // use parent node
  }
};

```
## Step 5: Check node conditions

Part of nagivating nodes (especially when using a visitor) is to check if a node matches certain conditions.

Use `getNodePath(node)` along with `pathStartsWith(path, searchString)`, `pathEndsWith(path, searchString)`, `pathContains(path, searchString)`, or other functions from pluginTools.

This finds all resources that are colors:

```js
property(propertyNode) {
  const path = pluginTools.getNodePath(propertyNode);

  if (pluginTools.pathStartsWith(path, 'resources.colors')) {
    const key = propertyNode.key.value;
    const value = propertyNode.value.value;
    // process each color resource
  }
}
```

This finds all properties with a key of 'when' and then gets an array of any data binding expressions and resources found in the property's value:

```js
property(propertyNode) {
  if (pluginTools.isWhen(propertyNode) {
    const valueNode = propertyNode.value;

    const expressions = pluginTools.getDataBindingExpressions(valueNode);
    const resources = pluginTools.getResources(valueNode);
  }
}
```

## Step 6: Change nodes

When you find the right nodes, you will need to change them or to insert/delete
other nodes around.

There are various ways to change nodes.

### Changing a value

To change the value of a node without changing the data type:

```js
stringNode.value = 'hello';
numberNode.value = 21;
```

### Setting a property

The *JsonObject* node has a function to set a property value that will take care of creating the appropriate AST nodes for you.

Use `setProperty(key, value)` to specify the property. If the object already has a property with that key, the value is changed. If no key exists, a new property is added:

```js
objectNode.setProperty('key1', 'value1');
objectNode.setProperty('key2', 2);
objectNode.setProperty('key3', null);
objectNode.setProperty('key4', true);
objectNode.setProperty('key5', false);
objectNode.setProperty('key6', ['a', 'b', 1, true, { a: 'aa' }]);
objectNode.setProperty('key7', { a: 'aa', b: { b1:1, b2:2 } });
```

### Add an item to an array

The *JsonArray* node has a function to add items that will take care of creating the appropriate AST nodes for you.

```js
arrayNode.addItem('one');
arrayNode.addItem(2);
arrayNode.addItem(false);
arrayNode.addItem({ a:'aa', b:'bb' });
```

### Delete a node

Each AST node has a `markDelete` property that starts off set to `false`. Set it to `true` to show that you want the node deleted:

```js
propertyNode.markDelete = true;
```
After all plugins have processed the APL document, all nodes with `markDelete` are evaluated and deleted. To be more specific, all *JsonProperty* nodes and all nodes that are items of a *JsonArray* are deleted. Other nodes are ignored.

If your plugin marks nodes for deletion, it is best if you delete them by calling:

```js
result.processor.deleteMarked(result.root);
```
That way, other plugins don't need to check for deleted nodes that your plugin marked.

NOTE: Since *JsonComment* nodes never appear in the APL document created at the end of the process, they don't need to be marked deleted.


## Step 7: Keep Trying

The first time you create a plugin, you are likely to be somewaht frustrating. Please keep trying.

Start from writing tests. Plugin boilerplate has a test template
in `index.test.js`. Call `npx jest` to test your plugin.

Use Node.js debugger in your text editor or just `console.log`
to debug the code.

PostAPL community can help you since we are all experiencing the same problems.


## Step 8: Make it public

When your plugin is ready, call `npx clean-publish` in your repository.
[`clean-publish`] is a tool to remove development configs from the npm package.
We added this tool to our plugin boilerplate.

Write a tweet about your new plugin (even if it is a small one) with
[`@marktucker`] mention and `#PostAPL`.

[`clean-publish`]: https://github.com/shashkovdanil/clean-publish/
[`@marktucker`]: https://twitter.com/marktucker
