import { record2State, state2Record } from './transform'

export class History {
  constructor (options = { rules: [], delay: 50, maxLength: 100 }) {
    this.rules = options.rules || []
    this.delay = options.delay || 50
    this.maxLength = options.maxLength || 100

    this.$index = -1
    this.$records = []
    this.$chunks = {}

    this.$pendingState = null
    this.$pendingPickIndex = null
    this.$pendingPromise = null
    this.$debounceTime = null
  }

  // Boolean
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

  // Boolean
  get hasUndo () {
    // Only has undo if we have records before index.
    const lowerBound = Math.max(this.$records.length - this.maxLength, 0)
    return this.$index > lowerBound
  }

  // Void => State
  get () {
    const currentTree = this.$records[this.$index]
    if (!currentTree) return null
    return record2State(currentTree, this.$chunks)
  }

  // (State, Number?) => History
  pushSync (state, pickIndex = -1) {
    const latestRecord = this.$records[this.$index] || null
    const record = state2Record(
      state, this.$chunks, this.rules, latestRecord, pickIndex
    )
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

    return this
  }

  // (State, Number?) => Promise<History>
  push (state, pickIndex = -1) {
    const currentTime = +new Date()
    if (!this.$pendingState) {
      this.$pendingState = state
      this.$pendingPickIndex = pickIndex
      this.$debounceTime = currentTime
      this.$pendingPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.pushSync(this.$pendingState, this.$pendingPickIndex)
          this.$pendingState = null
          this.$pendingPickIndex = null
          this.$debounceTime = null
          resolve(this)
          this.$pendingPromise = null
        }, this.delay)
      })
      return this.$pendingPromise
    } else if (currentTime - this.$debounceTime < this.delay) {
      this.$pendingState = state
      this.$pendingPickIndex = pickIndex
      return this.$pendingPromise
    } else return Promise.reject(new Error('Invalid push ops'))
  }

  // Void => History
  undo () {
    if (this.hasUndo) this.$index--
    return this
  }

  // Void => History
  redo () {
    if (this.hasRedo) this.$index++
    return this
  }

  // Void => History
  reset () {
    this.$index = -1
    this.$records.forEach(tree => { tree = null })
    Object.keys(this.$chunks).forEach(key => { this.$chunks[key] = null })
    this.$records = []
    this.$chunks = {}

    this.$pendingState = null
    this.$pendingPickIndex = null
    this.$pendingPromise = null
    this.$debounceTime = null
    return this
  }
}
