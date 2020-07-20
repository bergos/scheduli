# scheduli

Simple scheduler to get rid of your setTimeout and setInterval calls.

## Usage

The package exports a `Scheduler` and a `Job` class.

### Scheduler()

Creates a new `Scheduler` instance with an empty job list and that is not running.

#### start()

Starts scheduling and running jobs.

#### stop()

Stop scheduling and running new jobs.

#### job(func, options)

Creates a new job instance attached to the scheduler instance.
See the documentation of `Job` for more details.

### Job(func, { name, scheduler })

Creates a new `Job` instance with the code in `func` attached to run when the scheduler criteria are fulfilled.
To attach it to a `Scheduler`, the `scheduler` argument must be given.
A `name` can be attached for debugging or monitoring tools.

#### Event: start

The `start` event is emitted after the `running` status was changed to `true` and before `func` is called.

#### Event: finish

The `finish` event is emitted after `func` returned, the `running` status was changed to `false` and the next call was scheduled.

#### Event: error

The `error` event is emitted whenever `func` throws and error or rejects.

#### every(time)

Schedules the job every `time` milliseconds.

#### start()

Schedules the job at `Date.now()`, so it will be queued for the next schedule run.

#### static restart(err, job)

Restarts the given `job`.
Usually used in combination with the `error` event like this:

```javascript
scheduler
  .job(() => {
    // ...
  })
  .on('error', Job.restart)
```

#### static collect(err, job)

Collects the errors emitted by the job in the `errors` property as an `Array`.
Usually used in combination with the `error` event like this:

```javascript
const job = scheduler
  .job(() => {
    // ...
  })
  .on('error', Job.collect)

if (job.errors) {
  console.log(job.errors.map(err => err.message).join(', '))
}
```

## Example

```javascript
import { Job, Scheduler } from 'scheduli'

async function main () {
  const scheduler = new Scheduler()

  scheduler
    .job(() => {
      console.log('job')
    })
    .every(1000)
    .on('error', Job.restart)

  scheduler.start()
}

main()
```
