# Changelog

### `V1.2.2` - 2018-12-14
* feat: add `history.onChange` callback.
* fix: redundant record when mixing `push` and `pushSync` calls.
* refactor: use `ruleIndex` in records for history dumping support.

### `V1.2.0` - 2018-11-26
* feat: add `onChange` callback.
* build: use ES5 bundle.

### `V1.1.0` - 2018-11-11
* feat: add `history.length` getter.
* feat: add `useChunks` API for potential immutable support.
* fix: debounce bug.
* build: migrate to rollup, bundle size reduced by ~40%.

### `V1.0.1` - 2018-11-01
* feat: basic API surface.
