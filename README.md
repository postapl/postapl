# PostAPL

PostAPL is a tool for transforming Alexa Presentation Language (APL) documents with JS plugins.
These plugins can add, remove, and modify APL nodes and bring consistency to all the APL docs in a project.

PostAPL takes an APL file (JSON with or without comments) and provides an API to analyze and modify its nodes
(by transforming them into an [Abstract Syntax Tree]).
This API can then be used by [plugins] to do a lot of useful things,
e.g., remove properties with empty or null values, report on mainTemplate structure.

For PostAPL commercial support (consulting, PostAPL plugins), contact [Mark Tucker](https://twitter.com/marktucker).

[Abstract Syntax Tree]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[plugins]:              https://github.com/postapl/postapl#plugins


## Plugins

PostAPL is just getting started and we are open to plugin suggestions. You can find all of the plugins
in the [plugins list]. Below is a list
of our favorite plugins — the best demonstrations of what can be built
on top of PostAPL.

If you have any new ideas, [PostAPL plugin development] is really easy.

[plugins list]:       https://github.com/postapl/postapl/blob/main/docs/plugins.md


### General

* [postapl-remove-empty](https://github.com/postapl/postapl-remove-empty) finds properties whose values are null, empty string, empty array, or empty object and removes them.

[PostAPL plugin development]:   https://github.com/postapl/postapl/blob/main/docs/writing-a-plugin.md


### Reporters

* [postapl-mermaid-graph] creates graph data for [Mermaid Live Editor] of the Component tree of your APL or of the AST.

[Mermaid Live Editor]: https://mermaid.live
[postapl-mermaid-graph]: https://github.com/postapl/postapl-mermaid-graph/


## Usage

You can start using PostAPL in just two steps:

1. Find and add PostAPL extensions for your build tool.
2. [Select plugins] and add them to your PostAPL process.

[Select plugins]: https://github.com/postapl/postapl#plugins

### JS API

For other environments, you can use the JS API:

```js
const { postapl } = require('postapl');
const removeEmpty = require('postapl-removeempty');
const fs = require('fs');

fs.readFile('src/screen.json', (err, apl) => {
  postapl([removeEmpty])
    .process(apl, { from: 'src/screen.json', to: 'dest/screen.json' })
    .then(result => {
      fs.writeFile(result.opts.to, result.apl, () => true)
    })
});
```

Read the [PostAPL API documentation] for more details about the JS API.


### Options

Most PostAPL runners accept two parameters:

* An array of plugins.
* An object of options.

Common options:

* `from`: the input file name.
* `to`: the output file name.

