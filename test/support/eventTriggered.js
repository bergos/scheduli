import defer from 'promise-the-world/defer.js'

function eventTriggered (obj, event) {
  const triggered = defer()

  obj.on(event, triggered.resolve)

  return triggered.promise
}

export default eventTriggered
