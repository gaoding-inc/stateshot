import { hashFunc } from './hash'

const defaultRule = {
  // StateNode => { Chunks, Children }
  toRecord: node => ({
    chunks: [{ ...node, children: undefined }], children: node.children
  }),
  // { Chunks, Children } => StateNode
  fromRecord: ({ chunks, children }) => ({ ...chunks[0], children })
}

export const state2Record = (
  stateNode, chunkPool, rules = [], prevRecord = null, pickIndex = -1
) => {
  const rule = rules.find(({ match }) => match(stateNode)) || defaultRule
  const { toRecord } = rule

  const { chunks, children } = toRecord(stateNode)
  const recordChildren = children
  const hashes = []
  for (let i = 0; i < chunks.length; i++) {
    const chunkStr = JSON.stringify(chunks[i])
    const hashKey = hashFunc(chunkStr)
    hashes.push(hashKey)
    chunkPool[hashKey] = chunkStr
  }

  if (pickIndex !== -1 && Array.isArray(prevRecord && prevRecord.children)) {
    const childrenCopy = [...prevRecord.children]
    childrenCopy[pickIndex] = state2Record(
      recordChildren[pickIndex], chunkPool, rules
    )
    return { hashes, rule, children: childrenCopy }
  } else {
    return {
      hashes,
      rule,
      children: children &&
        children.map(node => state2Record(node, chunkPool, rules))
    }
  }
}

export const record2State = (recordNode, chunkPool) => {
  const { hashes, rule: { fromRecord }, children } = recordNode
  const chunks = hashes.map(hash => JSON.parse(chunkPool[hash]))
  return fromRecord({
    chunks,
    children: children && children.map(node => record2State(node, chunkPool))
  })
}
