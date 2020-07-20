import { strictEqual } from 'assert'
import mocha from 'mocha'
import defer from 'promise-the-world/defer.js'
import Job from '../Job.js'

const { describe, it } = mocha

describe('Job', () => {
  describe('constructor', () => {
    it('should be a constructor', () => {
      strictEqual(typeof Job, 'function')
    })

    it('should implement the EventEmitter interface', () => {
      const job = new Job()

      strictEqual(typeof job.emit, 'function')
      strictEqual(typeof job.on, 'function')
    })

    it('should assign the given function to the func property', () => {
      const func = {}
      const job = new Job(func)

      strictEqual(job.func, func)
    })

    it('should assign the given name to the name property', () => {
      const name = 'test'
      const job = new Job(null, { name })

      strictEqual(job.name, name)
    })

    it('should assign the given scheduler to the scheduler property', () => {
      const scheduler = {}
      const job = new Job(null, { scheduler })

      strictEqual(job.scheduler, scheduler)
    })

    it('should set the running status to false', () => {
      const job = new Job()

      strictEqual(job.status.running, false)
    })

    it('should set the start time to null', () => {
      const job = new Job()

      strictEqual(job.status.start, null)
    })

    it('should set the next start time to null', () => {
      const job = new Job()

      strictEqual(job.status.next, null)
    })

    it('should set the every arg to null', () => {
      const job = new Job()

      strictEqual(job.args.every, null)
    })
  })

  describe('every', () => {
    it('should be a method', () => {
      const job = new Job()

      strictEqual(typeof job.every, 'function')
    })

    it('should set the every arg to the given value', () => {
      const job = new Job()

      job.every(1234)

      strictEqual(job.args.every, 1234)
    })

    it('should trigger schedule', () => {
      const job = new Job()

      let called = false

      job.schedule = () => {
        called = true
      }

      job.every(1234)

      strictEqual(called, true)
    })

    it('should return itself', () => {
      const job = new Job()

      const result = job.every(1234)

      strictEqual(result, job)
    })
  })

  describe('run', () => {
    it('should be a method', () => {
      const job = new Job()

      strictEqual(typeof job.run, 'function')
    })

    it('should set the start status to Date.now()', () => {
      const job = new Job(() => {})

      job.run()

      const delta = Date.now() - job.status.start

      strictEqual(delta < 10, true)
    })

    it('should set the start status to next status, if it is not null', () => {
      const job = new Job(() => {})

      job.status.next = 1234
      job.run()

      strictEqual(job.status.start, 1234)
    })

    it('should emit start event', () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      let object = null

      job.on('start', obj => {
        object = obj
      })

      job.run()

      strictEqual(object, job)
    })

    it('should call the given function', () => {
      let called = false
      const job = new Job(() => {
        called = true
      })

      job.run()

      strictEqual(called, true)
    })

    it('should change the running status to false after the function has finished', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      job.run()
      await finish.resolve()

      strictEqual(job.status.running, false)
    })

    it('should set next status to null if it is equals status start after the function has finished', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)
      job.status.next = Date.now()

      job.run()
      await finish.resolve()

      strictEqual(job.status.next, null)
    })

    it('should set start status to null after the function has finished', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      job.run()
      await finish.resolve()

      strictEqual(job.status.start, null)
    })

    it('should emit finish event after the function has finished', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      let object = null

      job.on('finish', obj => {
        object = obj
      })

      job.run()
      await finish.resolve()

      strictEqual(object, job)
    })

    it('should call schedule after the function has finished', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      let called = false

      job.schedule = () => {
        called = true
      }

      job.run()
      await finish.resolve()

      strictEqual(called, true)
    })

    it('should change the running status to false if the function finished with error', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      job
        .on('error', err => {
          if (err) {}
        })
        .run()
      await finish.reject(new Error())

      strictEqual(job.status.running, false)
    })

    it('should emit error event after the function finished with error', async () => {
      const finish = defer()
      const job = new Job(() => finish.promise)

      let error = null
      let object = null

      job.on('error', (err, obj) => {
        error = err
        object = obj
      })

      job.run()
      await finish.reject(new Error('test'))

      strictEqual(error instanceof Error, true)
      strictEqual(error.message, 'test')
      strictEqual(object, job)
    })
  })

  describe('schedule', () => {
    it('should be a method', () => {
      const job = new Job()

      strictEqual(typeof job.schedule, 'function')
    })

    it('should nothing if the job is still running', () => {
      const job = new Job()
      job.status.running = true

      job.schedule()

      strictEqual(job.status.next, null)
    })

    it('should calculate next status if every arg is not null', () => {
      const job = new Job()
      job.args.every = 1000

      job.schedule()

      const delta = Date.now() - job.status.next - 1000

      strictEqual(delta < 10, true)
    })

    it('should trigger scheduler', () => {
      let called = false

      const scheduler = {
        schedule: () => {
          called = true
        }
      }

      const job = new Job(null, { scheduler })
      job.args.every = 1000

      job.schedule()

      strictEqual(called, true)
    })
  })

  describe('start', () => {
    it('should be a method', () => {
      const job = new Job()

      strictEqual(typeof job.start, 'function')
    })

    it('should set next status to Date.now()', () => {
      const job = new Job()

      job.start()

      const delta = Date.now() - job.status.next

      strictEqual(delta < 10, true)
    })

    it('should trigger scheduler', () => {
      let called = false

      const scheduler = {
        schedule: () => {
          called = true
        }
      }

      const job = new Job(null, { scheduler })

      job.start()

      strictEqual(called, true)
    })
  })

  describe('restart', () => {
    it('should be a static method', () => {
      strictEqual(typeof Job.restart, 'function')
    })

    it('should start the given job', () => {
      let called = false

      const job = {
        start: () => {
          called = true
        }
      }

      Job.restart(null, job)

      strictEqual(called, true)
    })
  })

  describe('collect', () => {
    it('should be a static method', () => {
      strictEqual(typeof Job.collect, 'function')
    })

    it('should collect errors in .errors', () => {
      const job = {}

      Job.collect(new Error('1'), job)
      Job.collect(new Error('2'), job)

      strictEqual(Array.isArray(job.errors), true)
      strictEqual(job.errors[0].message, '1')
      strictEqual(job.errors[1].message, '2')
    })
  })
})
