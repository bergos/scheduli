import { strictEqual } from 'assert'
import mocha from 'mocha'
import { Job, Scheduler } from '../index.js'

const { describe, it } = mocha

describe('scheduli', () => {
  it('should export a Job class', () => {
    strictEqual(typeof Job, 'function')
  })

  it('should export a Scheduler class', () => {
    strictEqual(typeof Scheduler, 'function')
  })
})
