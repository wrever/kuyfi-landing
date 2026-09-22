import { describe, expect, it } from 'vitest'
import { RESULT_STATUSES, SUBSCRIBE_CODES, statusFromCode } from '../lib/subscribe'
import { siteCopy } from './siteCopy'

const { updates } = siteCopy
const strings = [
  updates.kicker,
  updates.heading,
  updates.body,
  updates.form.label,
  updates.form.submit,
  updates.form.submitting,
  updates.form.note,
  ...Object.values(updates.form.messages),
]

describe('updates copy', () => {
  it('uses the agreed label, heading and body', () => {
    expect(updates.kicker).toBe('[ 08 · UPDATES ]')
    expect(updates.heading).toBe('Follow Kuyfi development.')
    expect(updates.body).toBe(
      'Receive release notes, technical updates and new audit experiments by email.',
    )
  })

  it('is a development newsletter, not a waitlist: Kuyfi is already public', () => {
    expect(strings.join(' ')).not.toMatch(
      /waitlist|early access|coming soon|be first|join (before|the)|before launch|launch(es|ing)? soon|never miss|stay ahead|exclusive|insider|be part of|the future|movement/i,
    )
    expect(updates.body).toMatch(/release notes/)
    expect(updates.body).toMatch(/technical updates/)
    expect(updates.body).toMatch(/audit experiments/)
  })

  it('states what to expect in one factual line, with no data-handling claims', () => {
    expect(updates.form.note).toBe('Only Kuyfi development updates. Unsubscribe at any time.')
    expect(strings.join(' ')).not.toMatch(
      /never (share|sell)|will not (share|sell)|we do not (share|sell)|gdpr|encrypt|privacy policy|no tracking/i,
    )
  })

  it('has calm wording: no exclamation marks', () => {
    expect(strings.join(' ')).not.toContain('!')
  })
})

describe('the form has every state it needs', () => {
  const { messages } = updates.form

  it('has a message for loading and for each way a request can end', () => {
    expect(Object.keys(messages).sort()).toEqual(
      ['already', 'error', 'invalid', 'loading', 'rateLimited', 'success'].sort(),
    )
    for (const [state, text] of Object.entries(messages)) {
      expect(text.length, state).toBeGreaterThan(10)
    }
  })

  it('maps every server result to its own state', () => {
    expect(SUBSCRIBE_CODES.map(statusFromCode)).toEqual([...RESULT_STATUSES])
    expect(RESULT_STATUSES).toEqual(['success', 'already', 'invalid', 'rate-limited', 'error'])
  })

  it('does not say "subscribed" on success: the provider still asks for an email confirmation', () => {
    expect(messages.success).toMatch(/confirm/i)
    expect(messages.success).not.toMatch(/you're subscribed|you are subscribed|welcome/i)
    // Only the "already" state says the address is subscribed.
    expect(messages.already).toMatch(/already subscribed/)
  })

  it('has an explicit label, so nothing relies on a placeholder', () => {
    expect(updates.form.label).toBe('Email address')
    expect(updates.form.submit).toBe('Subscribe')
  })
})
