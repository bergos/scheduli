import EventEmitter from 'events'
import Job from './Job.js'

class Scheduler extends EventEmitter {
  constructor () {
    super()

    this.status = {
      running: false
    }

    this.jobs = []
  }

  start () {
    this.status.running = true
    this.schedule()
  }

  stop () {
    this.status.running = false
  }

  schedule () {
    if (!this.status.running) {
      return
    }

    let next = null

    do {
      next = this.jobs
        .filter(job => !job.status.running)
        .filter(job => job.status.next !== null)
        .reduce((next, job) => (!next || next.status.next > job.status.next) ? job : next, null)

      if (next && next.status.next <= Date.now()) {
        next.run()
      }
    } while (next && next.status.next <= Date.now())

    if (this.next) {
      clearTimeout(this.next)
    }

    if (!next) {
      return
    }

    const time = Math.max(0, next.status.next - Date.now())

    this.next = setTimeout(() => this.schedule(), time)
  }

  job (func, options) {
    const job = new Job(func, { ...options, scheduler: this })

    this.jobs.push(job)

    return job
  }
}

export default Scheduler
