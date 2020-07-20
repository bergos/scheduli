import delay from 'promise-the-world/delay.js'
import { Job, Scheduler } from '../index.js'

function log (message) {
  console.log(`[${(new Date()).toISOString()}] ${message}`)
}

async function main () {
  const scheduler = new Scheduler()

  scheduler.on('error', err => {
    console.error(err)
  })

  scheduler
    .job(() => {
      log('job1')

      if (Math.random() > 0.5) {
        throw new Error('random error')
      }
    })
    .every(1000)
    .on('error', Job.restart)

  scheduler
    .job(() => {
      log('job2')
    })
    .every(2000)

  scheduler.start()
  await delay(30000)
  scheduler.stop()
}

main()
