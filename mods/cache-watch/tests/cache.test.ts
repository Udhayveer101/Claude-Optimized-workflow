import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import type { Engine } from 'claude-code/testing'

import { REMIND_MS, TTL_1H_MS, TTL_MS, cacheStatus, learnTtl, mmss, shouldRemind } from '../hooks/cache'

const STEP = { turnId: 't', index: 0, model: 'm', messageCount: 1 }

// One model request of the main loop, or of a subagent with `agentId`.
async function request($: Engine, agentId?: string) {
  for await (const _ of $.turn.step(agentId === undefined ? STEP : { ...STEP, agentId })) void _
}

// The world beneath the mod: a clock the test moves, and the ops a session answers.
// A session reports its TTL on a model switch; the mod assumes 1h until told otherwise.
const FIVE_MIN = {
  from_model: 'm',
  to_model: 'm',
  requested_model: 'm',
  source: 'command',
  context_tokens: 1,
  prompt_cache_warm: true,
  cache_ttl: '5m',
  estimated_cache_write_usd: 0,
  pricing: 'default',
} as const

function world(on: On) {
  const clock = mock.clock(on, { now: 1_000_000 })
  const toasts: string[] = []
  mock.store(on)
  on('ui.toast', (_$, e) => (toasts.push(e.text), { value: undefined }))
  on('session.usage', () => ({
    value: { startedAt: 0, context: { window: 200_000 }, rateLimits: [] },
  }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('classic.PostModelSwitch', () => ({}) as never)
  const usage = { cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }
  on('turn.step', async function* (_$, e) {
    return { turnId: e.turnId, index: e.index, answer: 'ok', toolUses: [], usage } as never
  })

  return { clock, toasts, usage }
}

test('countdown: warm, then cooling, then cold at the TTL', () => {
  expect(cacheStatus(null, 0).phase).toBe('none')
  expect(cacheStatus(0, 0)).toEqual({ phase: 'warm', leftMs: TTL_MS, fraction: 1 })
  expect(cacheStatus(0, TTL_MS - REMIND_MS - 1).phase).toBe('warm')
  expect(cacheStatus(0, TTL_MS - REMIND_MS).phase).toBe('cooling')
  expect(cacheStatus(0, TTL_MS - 1).phase).toBe('cooling')
  expect(cacheStatus(0, TTL_MS)).toEqual({ phase: 'cold', leftMs: 0, fraction: 0 })
  expect(cacheStatus(0, TTL_MS * 9).phase).toBe('cold')
  // a 1h cache warns at five minutes left
  expect(cacheStatus(0, 55 * 60_000, 3_600_000, 300_000).phase).toBe('cooling')
  expect(mmss(300_000)).toBe('5:00')
  expect(mmss(61_000)).toBe('1:01')
})

test('reminder is due once per warm period', () => {
  const cooling = TTL_MS - REMIND_MS

  expect(shouldRemind(null, null, cooling)).toBe(false)
  expect(shouldRemind(0, null, cooling - 1)).toBe(false)
  expect(shouldRemind(0, null, cooling)).toBe(true)
  expect(shouldRemind(0, 0, cooling + 1000)).toBe(false)
  expect(shouldRemind(0, null, TTL_MS)).toBe(false)
  // the next response opens a new warm period
  expect(shouldRemind(5000, 0, 5000 + cooling)).toBe(true)
})

test('the mod toasts once per warm period, and again after the next response', async ($, on) => {
  const { clock, toasts } = world(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.classic.PostModelSwitch(FIVE_MIN)
  await request($)

  await clock.advance(TTL_MS - REMIND_MS - 2000)
  expect(toasts).toHaveLength(0)

  await clock.advance(4000)
  expect(toasts).toHaveLength(1)
  expect(toasts[0]).toMatch(/^Cache cools in \d:\d\d — click Handoff above the prompt$/)

  await clock.advance(TTL_MS)
  expect(toasts).toHaveLength(1)

  await request($)
  await clock.advance(TTL_MS - REMIND_MS + 2000)
  expect(toasts).toHaveLength(2)
})

test('the band shows WARM with a countdown, then COLD, on each surface', async ($, on) => {
  const { clock } = world(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.classic.PostModelSwitch(FIVE_MIN)
  await request($)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'cache-watch',
      surface,
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 10,
        bodyColumns: 100,
        scroll: { offset: 0, bodyRows: 10 },
        view: {},
      },
    })
    expect(await ui.find({ type: 'Text', text: /^WARM$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^cold in \d:\d\d$/ })).toBeDefined()
    expect(await ui.find({ key: 'handoff' })).toBeDefined()
    await ui.unmount()
  }

  await clock.advance(TTL_MS + 1000)
  const ui = await $.ui.mount({
    plugin: 'cache-watch',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: 100,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
    },
  })
  expect(await ui.find({ type: 'Text', text: /^COLD$/ })).toBeDefined()
})

test('handoff never clears the chat when the handoff cannot be generated', async ($, on) => {
  const { toasts } = world(on)
  const ran: string[] = []
  on('model.fork', () => ({ value: { isAnswered: false, reason: 'nothing-to-fork' } }))
  on('command.run', (_$, e) => (ran.push(e.command), { text: '' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({
    plugin: 'cache-watch',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: 100,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
    },
  })
  await ui.press({ key: 'handoff' })

  expect(ran).toEqual([])
  expect(toasts.at(-1)).toMatch(/^Handoff stopped: no handoff \(nothing-to-fork\)/)
})

test('handoff copies, clears, then submits the handoff, in that order', async ($, on) => {
  world(on)
  const order: string[] = []
  on('model.fork', () => ({
    value: { isAnswered: true, text: '## Task\nship it', usage: {} } as never,
  }))
  on('ui.copy', () => (order.push('copy'), { value: { isCopied: true } }))
  on('command.run', (_$, e) => (order.push(`/${e.command}`), { text: '' }))
  on('prompt.submit', (_$, e) => (order.push(`submit:${e.text.includes('## Task')}`), { text: e.text }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({
    plugin: 'cache-watch',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: 100,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
    },
  })
  await ui.press({ key: 'handoff' })

  expect(order).toEqual(['copy', '/clear', 'submit:true'])
})

test('each model request of the main loop restarts the countdown, a subagent request does not', async ($, on) => {
  const { clock, toasts } = world(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.classic.PostModelSwitch(FIVE_MIN)
  await request($)

  // a request just before the reminder is due pushes it a whole period out
  await clock.advance(TTL_MS - REMIND_MS - 2000)
  await request($)
  await clock.advance(4000)
  expect(toasts).toHaveLength(0)

  // a subagent's request leaves the main cache's countdown alone
  await clock.advance(TTL_MS - REMIND_MS - 8000)
  await request($, 'sub')
  await clock.advance(6000)
  expect(toasts).toHaveLength(1)
})

test('the TTL is learned from a request that only a 1h cache could have served', () => {
  const served = { cache_read_input_tokens: 90_000, cache_creation_input_tokens: 500 }
  const rewritten = { cache_read_input_tokens: 0, cache_creation_input_tokens: 90_000 }

  expect(learnTtl(20 * 60_000, served)).toBe(TTL_1H_MS)
  expect(learnTtl(20 * 60_000, rewritten)).toBe(TTL_MS)
  // inside five minutes, or past the hour, a request says nothing about the TTL
  expect(learnTtl(60_000, served)).toBe(null)
  expect(learnTtl(2 * TTL_1H_MS, rewritten)).toBe(null)
  expect(learnTtl(20 * 60_000, null)).toBe(null)
})

test('a 1h cache, once seen, stretches the countdown; a compaction or model switch empties it', async ($, on) => {
  const { clock, usage } = world(on)
  const KEPT = [{ role: 'user', text: 'summary', toolUses: [] }]
  on('session.compact', () => ({ messages: KEPT }) as never)
  const PANE = {
    plugin: 'cache-watch',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: 100,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
    },
  } as const
  const shows = async (text: RegExp) => {
    const ui = await $.ui.mount(PANE)
    const found = await ui.find({ type: 'Text', text })
    await ui.unmount()

    return found !== undefined
  }
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.classic.PostModelSwitch(FIVE_MIN)
  await request($)

  // twenty minutes on, the next request is served from cache: the TTL is 1h
  await clock.advance(20 * 60_000)
  expect(await shows(/^COLD$/)).toBe(true)
  usage.cache_read_input_tokens = 90_000
  await request($)
  await clock.advance(30 * 60_000)
  expect(await shows(/^WARM$/)).toBe(true)
  expect(await shows(/^cold in 30:00$/)).toBe(true)

  await $.session.compact({ trigger: 'manual', messages: KEPT } as never)
  expect(await shows(/^NO CACHE$/)).toBe(true)

  await request($)
  expect(await shows(/^WARM$/)).toBe(true)
  await $.classic.PostModelSwitch({
    from_model: 'a',
    to_model: 'b',
    requested_model: 'b',
    source: 'command',
    context_tokens: 1,
    prompt_cache_warm: true,
    cache_ttl: '5m',
    estimated_cache_write_usd: 0,
    pricing: 'default',
  })
  expect(await shows(/^NO CACHE$/)).toBe(true)
})

test('a session is assumed to run on a 1h cache until it says otherwise', async ($, on) => {
  const { clock } = world(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await request($)
  await clock.advance(TTL_MS + 1000)

  const ui = await $.ui.mount({
    plugin: 'cache-watch',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  })
  expect(await ui.find({ type: 'Text', text: /^WARM$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^cold in 54:\d\d$/ })).toBeDefined()
})
