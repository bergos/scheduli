import { deepStrictEqual, strictEqual } from 'assert'
import mocha from 'mocha'
import defer from 'promise-the-world/defer.js'
import eventTriggered from './support/eventTriggered.js'
import Job from '../Job.js'
import Scheduler from '../Scheduler.js'

const { describe, it } = mocha

describe('Scheduler', () => {
  describe('constructor', () => {
    it('should be a constructor', () => {
      strictEqual(typeof Scheduler, 'function')
    })

    it('should implement the EventEmitter interface', () => {
      const scheduler = new Scheduler()

      strictEqual(typeof scheduler.emit, 'function')
      strictEqual(typeof scheduler.on, 'function')
    })

    it('should set the running status to false', () => {
      const scheduler = new Scheduler()

      strictEqual(scheduler.status.running, false)
    })

    it('should create an empty job list', () => {
      const scheduler = new Scheduler()

      strictEqual(Array.isArray(scheduler.jobs), true)
      strictEqual(scheduler.jobs.length, 0)
    })
  })

  describe('start', () => {
    it('should be a method', () => {
      const scheduler = new Scheduler()

      strictEqual(typeof scheduler.start, 'function')
    })

    it('should change the running status to true', () => {
      const scheduler = new Scheduler()

      scheduler.start()

      strictEqual(scheduler.status.running, true)
    })

    it('should trigger schedule', () => {
      const scheduler = new Scheduler()

      let called = false

      scheduler.schedule = () => {
        called = true
      }

      scheduler.start()

      strictEqual(called, true)
    })
  })

  describe('stop', () => {
    it('should be a method', () => {
      const scheduler = new Scheduler()

      strictEqual(typeof scheduler.stop, 'function')
    })

    it('should change the running status to false', () => {
      const scheduler = new Scheduler()

      scheduler.stop()

      strictEqual(scheduler.status.running, false)
    })
  })

  describe('schedule', () => {
    it('should be a method', () => {
      const scheduler = new Scheduler()

      strictEqual(typeof scheduler.schedule, 'function')
    })

    it('should do nothing if the status running is false', async () => {
      const scheduler = new Scheduler()

      let called = false

      const job = scheduler.job(() => {
        called = true
      })

      job.status.next = Date.now()

      await scheduler.schedule()

      strictEqual(called, false)
      strictEqual(job.status.start, null)
    })

    it('should run the scheduled job', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      let called = false

      const job = scheduler.job(() => {
        called = true
      })

      const finished = eventTriggered(job, 'finish')

      job.status.next = Date.now()

      await scheduler.schedule()
      await finished

      strictEqual(called, true)
    })

    it('should ignore running jobs', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      let called = false

      const job = scheduler.job(() => {
        called = true
      })

      job.status.running = true

      job.status.next = Date.now()

      await scheduler.schedule()

      strictEqual(called, false)
      strictEqual(job.status.start, null)
    })

    it('should ignore jobs without next status', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      let called = false

      const job = scheduler.job(() => {
        called = true
      })

      await scheduler.schedule()

      strictEqual(called, false)
      strictEqual(job.status.start, null)
    })

    it('should run the jobs by status next starting with the smallest one', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      const order = []

      const job1 = scheduler.job(() => {
        order.push('1')
      })

      job1.status.next = Date.now() - 1000

      const job2 = scheduler.job(() => {
        order.push('2')
      })

      job2.status.next = job1.status.next - 1000

      await scheduler.schedule()

      deepStrictEqual(order, ['2', '1'])
    })

    it('should run only the jobs with a next status smaller or equals Date.now()', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      const order = []

      const job1 = scheduler.job(() => {
        order.push('1')
      })

      job1.status.next = Date.now() + 1000

      const job2 = scheduler.job(() => {
        order.push('2')
      })

      job2.status.next = Date.now() - 1000

      await scheduler.schedule()

      deepStrictEqual(order, ['2'])
    })

    it('should run all jobs until no job is left with a next status smaller or equals Date.now()', async () => {
      const scheduler = new Scheduler()
      scheduler.start()

      const order = []

      const job1 = scheduler.job(() => {
        order.push('1')
      })

      job1.status.next = Date.now() + 1000

      const job2 = scheduler.job(() => {
        order.push('2')
      })

      job2.status.next = Date.now() - 1000

      const job3 = scheduler.job(() => {
        order.push('3')
      })

      job3.status.next = Date.now() - 2000

      await scheduler.schedule()

      deepStrictEqual(order, ['3', '2'])
    })

    it('should use next status to plan the next schedule call', async () => {
      const next = Date.now() + 100

      const scheduler = new Scheduler()
      scheduler.start()

      const job = scheduler.job(() => {})

      job.status.next = next

      await scheduler.schedule()

      const nextSchedule = defer()

      scheduler.schedule = nextSchedule.resolve

      await nextSchedule.promise

      const delta = Date.now() - next

      strictEqual(delta < 10, true)
    })
  })

  describe('job', () => {
    it('should be a method', () => {
      const scheduler = new Scheduler()

      strictEqual(typeof scheduler.job, 'function')
    })

    it('should create a new job', () => {
      const scheduler = new Scheduler()

      const job = scheduler.job()

      strictEqual(job instanceof Job, true)
    })

    it('should forward the given function', () => {
      const scheduler = new Scheduler()
      const func = () => {}

      const job = scheduler.job(func)

      strictEqual(job.func, func)
    })

    it('should forward the scheduler', () => {
      const scheduler = new Scheduler()

      const job = scheduler.job()

      strictEqual(job.scheduler, scheduler)
    })

    it('should forward the given option', () => {
      const scheduler = new Scheduler()

      const job = scheduler.job(null, { name: 'test' })

      strictEqual(job.name, 'test')
    })
  })
})
