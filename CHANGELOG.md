# Changelog

### `V1.3.5` - 2022-12-11
* perf: optimize chunk data structure
* perf: optimize chunk JSON size

### `V1.3.4` - 2022-01-28
* fix: support circular JSON structure @boomyao

### `V1.3.3` - 2020-08-20
* type: improved TypeScript support.

### `V1.3.2` - 2020-08-20
* feat: add `initialState` support.

### `V1.2.2` - 2018-12-14
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
