import EventEmitter from 'events'

class Job extends EventEmitter {
  constructor (func, { name, scheduler } = {}) {
    super()

    this.func = func
    this.name = name
    this.scheduler = scheduler

    this.status = {
      running: false,
      start: null,
      next: null
    }

    this.args = {
      every: null
    }
  }

  every (time) {
    this.args.every = time
    this.schedule()

    return this
  }

  async run () {
    try {
      this.status.start = this.status.next || Date.now()
      this.status.running = true
      this.emit('start', this)

      await this.func()

      this.status.running = false

      if (this.status.next === this.status.start) {
        this.status.next = null
      }

      this.schedule()
      this.status.start = null
      this.emit('finish', this)
    } catch (err) {
      this.status.running = false
      this.emit('error', err, this)
    }
  }

  schedule () {
    if (this.status.running) {
      return
    }

    if (this.args.every !== null) {
      this.status.next = Math.max(Date.now(), (this.status.start || 0) + this.args.every)
    }

    if (this.scheduler) {
      this.scheduler.schedule()
    }
  }

  start () {
    this.status.next = Date.now()

    if (this.scheduler) {
      this.scheduler.schedule()
    }
  }

  static restart (err, job) {
    if (err) {}

    job.start()
  }

  static collect (err, job) {
    if (err) {}

    job.errors = job.errors || []
    job.errors.push(err)
  }
}

export default Job
