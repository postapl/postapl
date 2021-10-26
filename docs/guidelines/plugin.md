# PostAPL Plugin Guidelines

A PostAPL plugin is a function that receives and, usually,
transforms a APL AST from the PostAPL parser.

The rules below are *mandatory* for all PostAPL plugins.


## 1. API

### 1.1 Clear name with `postapl-` prefix

The plugin’s purpose should be clear just by reading its name.
If you wrote a plugin that removes empty values, `postapl-remove-empty`
would be a good name. If you wrote a plugin that exports custom components from the layouts section,
`postapl-export-components` would be a good name.

The prefix `postapl-` shows that the plugin is part of the PostAPL ecosystem.


### 1.2. Do one thing, and do it well

Do not create multitool plugins. Several small, one-purpose plugins are a better solution.



### 1.3. Set `plugin.postaplPlugin` with plugin name

Plugin name will be used in error messages and warnings.

```js
module.exports = opts => {
  return {
    postaplPlugin: 'postapl-name',
    async process(result) {
    }
  }
}
module.exports.postapl = true
```


## 2. Processing

### 2.1. Plugin must be tested

A CI service like [Travis] is also recommended (but not required) for testing code in
different environments. You should test in (at least) Node.js [active LTS](https://github.com/nodejs/LTS) and current stable version.

[Travis]: https://travis-ci.org/



### 2.2. Use only the public PostAPL API

PostAPL plugins must not rely on undocumented properties or methods,
which may be subject to change in any minor release.


## 3. Dependencies

### 3.1. Use messages to specify dependencies

If a plugin depends on another file, it should be specified by attaching
a `dependency` message to the `result`:

```js
result.messages.push({
  type: 'dependency',
  plugin: 'postapl-import',
  file: '/imported/file.apl',
  parent: result.opts.from
})
```

Directory dependencies should be specified using the `dir-dependency` message
type. By default all files within the directory (recursively) are considered
dependencies. An optional `glob` property can be used to indicate that only
files matching a specific glob pattern should be considered.

```js
result.messages.push({
  type: 'dir-dependency',
  plugin: 'postapl-import',
  dir: '/imported',
  glob: '**/*.apl', // optional
  parent: result.opts.from
})
```


## 4. Errors

### 4.1. Use `node.error` on APL relevant errors

If you have an error because of input APL you should use `node.error` to create an error:

```js
object(objectNode) {
  if (condition) {
    throw objectNode.error('Error x for ' + objectNode.path)
  }
}
```


### 4.2. Use `result.warn` for warnings

Do not print warnings with `console.log` or `console.warn`,
because some PostAPL runner may not allow console output.

```js
object(objectNode) {
  if (condition) {
    this.result.warn(`Some warning at path: ${objectNode.path}`, {node: objectNode});
  }
}
```

If APL input is a source of the warning, the plugin must set the `node` option.


## 5. Documentation

### 5.1. Document your plugin in English

PostAPL plugins must have their `README.md` wrote in English.

Of course, you are welcome to write documentation in other languages;
just name them appropriately (e.g. `README.ja.md`).


### 5.2. Include input and output examples

The plugin's `README.md` must contain example input and output APL.
A clear example is the best way to describe how your plugin works.

The first section of the `README.md` is a good place to put examples.
See [postapl-remove-empty](https://github.com/postapl/postapl-remove-empty) for an example.

Of course, this guideline does not apply if your plugin does not
transform the APL.


### 5.3. Maintain a changelog

PostAPL plugins must describe the changes of all their releases
in a separate file, such as `CHANGELOG.md`, `History.md`, or [GitHub Releases].
Visit [Keep A Changelog] for more information about how to write one of these.

Of course, you should be using [SemVer].

[Keep A Changelog]: https://keepachangelog.com/
[GitHub Releases]:  https://help.github.com/articles/creating-releases/
[SemVer]:           https://semver.org/


### 5.4. Include `postapl-plugin` keyword in `package.json`

PostAPL plugins written for npm must have the `postapl-plugin` keyword
in their `package.json`. This special keyword will be useful for feedback about
the PostAPL ecosystem.
