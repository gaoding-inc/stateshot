export function safeStringify (obj, indent = 2) {
  let cache = new Set()
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === 'object' && value !== null
        ? cache.has(value)
          ? undefined // Duplicate reference found, discard key
          : cache.add(value) && value // Store value in our collection
        : value,
    indent
  )
  cache = null
  return retVal
}
