/**
 * A tiny in-memory "database" for the prototype.
 *
 * It only exists so a pledge made in one section is still reflected when a
 * component refetches. In production this file is deleted — the server owns
 * state and `request()` becomes `fetch()`.
 */
const store = new Map()

export function readMock(key, seed) {
  if (!store.has(key)) store.set(key, seed)
  return store.get(key)
}

readMock.set = (key, value) => store.set(key, value)
readMock.reset = () => store.clear()

export default readMock
