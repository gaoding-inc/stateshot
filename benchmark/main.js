/* global performance */
import { History } from '../src'
import { hashFunc } from '../src/hash'
import sha1 from './sha1'
import json from './test.json'

let longStr = ''
for (let i = 0; i < 2 * 10e5; i++) {
  longStr += String(i % 10)
}

const hashSpeedBenchmark = () => {
  const sha1BeginTime = performance.now()
  sha1(longStr)
  const sha1Duration = performance.now() - sha1BeginTime

  const murmurBeginTime = performance.now()
  hashFunc(longStr, 0)
  const murmurDuration = performance.now() - murmurBeginTime
  document.write(`
    <h2>Hash Time</h2>
    <p>Sha1 ${sha1Duration.toFixed(2)}ms</p>
    <p>Murmur2: ${murmurDuration.toFixed(2)}ms</p>`
  )
}

const throughputBenchmark = () => {
  const history = new History()
  const pushBeginTime = performance.now()
  history.pushSync(json)
  const pushDuration = performance.now() - pushBeginTime

  const retrieveBeginTime = performance.now()
  history.get()
  const retrieveDuration = performance.now() - retrieveBeginTime

  document.write(`
    <h2>Throughput</h2>
    <p>Pushing 31KB JSON cost ${pushDuration.toFixed(2)}ms</p>
    <p>Getting from hash cost ${retrieveDuration.toFixed(2)}ms</p>
  `)
}

const main = () => {
  hashSpeedBenchmark()
  throughputBenchmark()
}

document.getElementById('run').onclick = main
