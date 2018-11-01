/* global test expect */
import { History } from './history'

const getState = () => ({
  id: 0,
  name: 'root',
  children: [
    { id: 1, name: 'a', children: [] },
    { id: 2, name: 'b', children: [] },
    {
      id: 3,
      name: 'c',
      children: [
        { id: 4, name: 'd', children: [] },
        { id: 5, name: 'e', children: [] }
      ]
    }
  ]
})

test('can init history', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  expect(history.get()).toEqual(state)
})

test('has correct undo/redo flag', () => {
  const history = new History()
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeFalsy()

  const state = getState()
  history.pushSync(state)
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeFalsy()

  history.pushSync(state)
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()

  history.undo()
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeTruthy()

  history.redo()
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()
})

test('can get state after undo', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.name = 'x'
  history.pushSync(state)
  state.name = 'y'
  history.pushSync(state)

  expect(history.get().name).toEqual('y')
  expect(history.undo().get().name).toEqual('x')
  expect(history.undo().get().name).toEqual('root')
})

test('can get state with redundant api call', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.name = 'x'
  history.pushSync(state)
  state.name = 'y'
  history.pushSync(state)

  history.undo().undo().undo().undo().undo()
  expect(history.get().name).toEqual('root')
  expect(history.hasUndo).toBeFalsy()

  history.redo().redo().redo().redo().redo()
  expect(history.get().name).toEqual('y')
  expect(history.hasRedo).toBeFalsy()
})

test('support max length', () => {
  const history = new History({ maxLength: 5 })
  const state = getState()

  for (let i = 0; i < 10; i++) {
    history.pushSync(state)
  }
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()

  for (let i = 0; i < 5; i++) {
    expect(history.$records[i]).toBeNull()
  }

  for (let i = 0; i < 5; i++) {
    history.undo()
  }
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeTruthy()
})

test('can clear redo records', () => {
  const history = new History()
  const state = getState()

  for (let i = 0; i < 10; i++) {
    history.pushSync(state)
  }
  for (let i = 0; i < 5; i++) {
    history.undo()
  }
  history.pushSync(state)

  for (let i = history.$index + 1; i < 10; i++) {
    expect(history.$records[i]).toBeNull()
  }
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()
})

test('support reset', () => {
  const history = new History()
  const state = getState()

  for (let i = 0; i < 10; i++) {
    history.pushSync(state)
  }
  expect(history.$index).toBe(9)
  expect(Object.keys(history.$chunks).length).toBeGreaterThan(0)
  expect(history.$records.length).toBeGreaterThan(0)

  history.reset()
  expect(history.$index).toBe(-1)
  expect(Object.keys(history.$chunks).length).toBe(0)
  expect(history.$records.length).toBe(0)
})

test('return promise with async push', () => {
  const history = new History({ delay: 0 })
  const state = getState()

  return history.push(state).then(h => {
    expect(h.get()).toEqual(state)
  })
})

test('may reject on async push', () => {
  const history = new History({ delay: 0 })
  const state = getState()
  history.push(state)
  history.$debounceTime = null
  return expect(history.push(state)).rejects
    .toEqual(new Error('Invalid push ops'))
})

test('support async push', () => {
  const history = new History({ delay: 5 })
  const state = getState()

  for (let i = 0; i < 100; i++) {
    history.push(state)
  }
  expect(history.get()).toBeNull()

  return new Promise(
    (resolve, reject) => setTimeout(resolve, 10)
  ).then(() => {
    expect(history.get()).toEqual(state)
  })
})

test('support pick index', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.children[0].id = 100
  history.pushSync(state, 0)
  expect(history.get()).toEqual(state)
})

test('can return wrong output when picking wrong index', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.children[0].id = 100
  history.pushSync(state, 1)
  expect(history.get()).not.toEqual(state)
})
