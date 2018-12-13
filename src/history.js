import { record2State, state2Record } from './transform'

const noop = () => {}
export class History {
  constructor (options = {
    rules: [],
    delay: 50,
    maxLength: 100,
    onChange: noop,
    useChunks: true
  }) {
    this.rules = options.rules || []
    this.delay = options.delay || 50
    this.maxLength = options.maxLength || 100
    this.useChunks = options.useChunks === undefined ? true : options.useChunks
    this.onChange = options.onChange || noop

    this.$index = -1
    this.$records = []
    this.$chunks = {}

    this.$pending = {
      state: null, pickIndex: null, onResolves: [], timer: null
    }
    this.$debounceTime = null
  }

  // : boolean
  get hasRedo () {
    // No redo when pointing to last record.
    if (this.$index === this.$records.length - 1) return false

    // Only has redo if there're valid records after index.
    // There can be no redo even if index less than records' length,
    // when we undo multi records then push a new one.
    let hasRecordAfterIndex = false
    for (let i = this.$index + 1; i < this.$records.length; i++) {
      if (this.$records[i] !== null) hasRecordAfterIndex = true
    }
    return hasRecordAfterIndex
  }

  // : boolean
  get hasUndo () {
    // Only has undo if we have records before index.
    const lowerBound = Math.max(this.$records.length - this.maxLength, 0)
    return this.$index > lowerBound
  }

  // : number
  get length () {
    return Math.min(this.$records.length, this.maxLength)
  }

  // void => State
  get () {
    const currentRecord = this.$records[this.$index]
    let resultState
    if (!currentRecord) {
      resultState = null
    } else if (!this.useChunks) {
      resultState = currentRecord
    } else {
      resultState = record2State(currentRecord, this.$chunks)
    }
    this.onChange(resultState)
    return resultState
  }

  // (State, number?) => History
  pushSync (state, pickIndex = -1) {
    const latestRecord = this.$records[this.$index] || null
    const record = this.useChunks
      ? state2Record(state, this.$chunks, this.rules, latestRecord, pickIndex)
      : state
    this.$index++
    this.$records[this.$index] = record
    // Clear redo records.
    for (let i = this.$index + 1; i < this.$records.length; i++) {
      this.$records[i] = null
    }
    // Clear first valid record if max length reached.
    if (this.$index >= this.maxLength) {
      this.$records[this.$index - this.maxLength] = null
    }

    // Clear pending state.
    if (this.$pending.timer) {
      clearTimeout(this.$pending.timer)
      this.$pending.state = null
      this.$pending.pickIndex = null
      this.$pending.timer = null
      this.$debounceTime = null
      this.$pending.onResolves.forEach(resolve => resolve(this))
      this.$pending.onResolves = []
    }

    this.onChange(state)
    return this
  }

  // (State, number?) => Promise<History>
  push (state, pickIndex = -1) {
    const currentTime = +new Date()
    const setupPending = () => {
      this.$pending.state = state
      this.$pending.pickIndex = pickIndex
      this.$debounceTime = currentTime
      const promise = new Promise((resolve, reject) => {
        this.$pending.onResolves.push(resolve)
        this.$pending.timer = setTimeout(() => {
          this.pushSync(this.$pending.state, this.$pending.pickIndex)
        }, this.delay)
      })
      return promise
    }
    // First time called.
    if (this.$pending.timer === null) {
      return setupPending()
    } else if (currentTime - this.$debounceTime < this.delay) {
      // Has been called without resolved.
      clearTimeout(this.$pending.timer)
      this.$pending.timer = null
      return setupPending()
    } else return Promise.reject(new Error('Invalid push ops'))
  }

  // void => History
  undo () {
    if (this.hasUndo) this.$index--
    return this
  }

  // void => History
  redo () {
    if (this.hasRedo) this.$index++
    return this
  }

  // void => History
  reset () {
    this.$index = -1
    this.$records.forEach(tree => { tree = null })
    Object.keys(this.$chunks).forEach(key => { this.$chunks[key] = null })
    this.$records = []
    this.$chunks = {}
    clearTimeout(this.$pending.timer)
    this.$pending = {
      state: null, pickIndex: null, onResolves: [], timer: null
    }
    this.$debounceTime = null
    return this
  }
}
