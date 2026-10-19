import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderSurface } from 'claude-code'

import type { Limit, Step, StepName, Usage } from '../types'
import { TTL_1H_MS, TTL_MS, cacheStatus, learnTtl, mmss, remindMs, shouldRemind, until } from './cache'
import type { CacheStatus } from './cache'

const PENDING = 'pending-handoff'
const PENDING_MAX_AGE_MS = 10 * 60_000
const FILL_MS = 600
const RING_PX = 20
const BAR_W = 56
const EMPTY: Usage = { at: 0, context: null, limits: [] }

const last = atom({ plugin: 'cache-watch', key: 'last' } as const, null)
const reminded = atom({ plugin: 'cache-watch', key: 'reminded' } as const, null)
const usage = atom({ plugin: 'cache-watch', key: 'usage' } as const, EMPTY)
const before = atom({ plugin: 'cache-watch', key: 'before' } as const, EMPTY)
const ttl = atom({ plugin: 'cache-watch', key: 'ttl' } as const, TTL_1H_MS)
const step = atom({ plugin: 'cache-watch', key: 'step' } as const, { name: 'idle', at: 0 })

const HANDOFF_PROMPT = `Write a handoff document so a fresh session with no memory of this conversation can continue the work with zero ambiguity. Use exactly these sections, in Markdown:

## Task
What the user asked for and the goal behind it.
## Done
What is finished and verified.
## In progress
What was mid-flight, and its exact state.
## Decisions
Choices made and why, including approaches rejected and constraints the user stated.
## Next steps
Numbered, concrete, in order; the first one is what to do immediately.
## Key files
Absolute paths, each with one line on why it matters.

Be specific: real paths, commands, names and error strings. No preamble, no closing remarks. Output only the document.`

const RESUME_PREFIX =
  'Continue this work from the handoff below. The previous conversation was cleared, so this is everything you know. Start with the first next step.'

// Apple system colors: mid-tones that hold on light and dark surfaces alike.
const GREEN = [52, 199, 89]
const AMBER = [255, 159, 10]
const GRAY = [142, 142, 147]
const BLUE = [10, 132, 255]
const RED = [255, 69, 58]
const TRACK = 'rgba(128,128,128,.22)'

const rgb = (c: number[]) => `rgb(${c.join(',')})`
const mix = (a: number[], b: number[], t: number) =>
  rgb(a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * Math.min(1, Math.max(0, t)))))

function cacheColor(cache: CacheStatus, life: number): string {
  if (cache.phase === 'warm') {
    return mix(GREEN, AMBER, 1 - (cache.leftMs - remindMs(life)) / (life - remindMs(life)))
  }

  return rgb(cache.phase === 'cooling' ? AMBER : GRAY)
}

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`

// The ring glides to where it will stand a second from now, and the pulse is
// phased off the wall clock, so a redraw each second continues both seamlessly.
function ring(cache: CacheStatus, now: number, life: number): string {
  const c = 2 * Math.PI * 18
  const off = (f: number) => (c * (1 - Math.max(0, f))).toFixed(2)
  const color = cacheColor(cache, life)
  const pulse =
    cache.phase === 'cooling'
      ? `<circle cx="22" cy="22" r="14" fill="${color}" opacity=".1"><animate attributeName="opacity" values=".05;.28;.05" dur="2.4s" begin="-${((now % 2400) / 1000).toFixed(2)}s" repeatCount="indefinite"/></circle>`
      : ''

  return svg(
    44,
    44,
    `<circle cx="22" cy="22" r="18" fill="none" stroke="${TRACK}" stroke-width="5"/>${pulse}` +
      `<circle cx="22" cy="22" r="18" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off(cache.fraction)}" transform="rotate(-90 22 22)">` +
      `<animate attributeName="stroke-dashoffset" from="${off(cache.fraction)}" to="${off(cache.fraction - 1000 / life)}" dur="1s" fill="freeze"/></circle>`,
  )
}

function check(elapsedMs: number): string {
  const begin = `-${(elapsedMs / 1000).toFixed(2)}s`

  return svg(
    44,
    44,
    `<circle cx="22" cy="22" r="18" fill="none" stroke="${rgb(GREEN)}" stroke-width="5"/>` +
      `<path d="M14 22.5l5.5 5.5L30 17" fill="none" stroke="${rgb(GREEN)}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" stroke-dashoffset="0">` +
      `<animate attributeName="stroke-dashoffset" from="24" to="0" dur=".4s" begin="${begin}" fill="freeze"/></path>`,
  )
}

const gaugeColor = (pct: number) => rgb(pct >= 90 ? RED : pct >= 70 ? AMBER : BLUE)

function bar(pct: number, from: number, elapsedMs: number): string {
  const w = (p: number) => ((Math.min(100, Math.max(0, p)) / 100) * BAR_W).toFixed(1)
  const fill =
    elapsedMs < FILL_MS && from !== pct
      ? `<animate attributeName="width" from="${w(from)}" to="${w(pct)}" dur="${FILL_MS}ms" begin="-${(elapsedMs / 1000).toFixed(2)}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".2 .8 .2 1"/>`
      : ''

  return svg(
    BAR_W,
    4,
    `<rect width="${BAR_W}" height="4" rx="2" fill="${TRACK}"/><rect width="${w(pct)}" height="4" rx="2" fill="${gaugeColor(pct)}">${fill}</rect>`,
  )
}

const textBar = (pct: number, cells = 8) => {
  const on = Math.round((Math.min(100, Math.max(0, pct)) / 100) * cells)

  return '█'.repeat(on) + '░'.repeat(cells - on)
}

const PHASE_LABEL = { none: 'NO CACHE', warm: 'WARM', cooling: 'COOLING', cold: 'COLD' } as const
const PHASE_COLOR = { none: 'inactive', warm: 'success', cooling: 'warning', cold: 'inactive' } as const

let isBusy = false
let isRunning = false

const setStep = async ($: EngineInterface, name: StepName) => {
  const next: Step = { name, at: await $.clock.now() }
  await update($, step, () => next)
}

// The cache's clock starts when a request is made, not when its answer ends.
const stamp = async ($: EngineInterface, at: number | null) => {
  await update($, last, () => at)
}

const measure = async (
  $: EngineInterface,
  seen: { context: { percent?: number }; rateLimits: Limit[] },
) => {
  const was = await read($, usage)
  const now: Usage = {
    at: await $.clock.now(),
    context: seen.context.percent ?? null,
    limits: seen.rateLimits.map(l => ({
      kind: l.kind,
      percentUsed: l.percentUsed,
      ...(l.resetsAt === undefined ? {} : { resetsAt: l.resetsAt }),
    })),
  }
  await update($, before, () => was)
  await update($, usage, () => now)
}

const tick = async ($: EngineInterface) => {
  const now = await $.clock.now()
  const at = await read($, last)
  const life = await read($, ttl)

  if (!isBusy && !isRunning && shouldRemind(at, await read($, reminded), now, life)) {
    await update($, reminded, () => at)
    $.ui.toast(
      `Cache cools in ${mmss(cacheStatus(at, now, life).leftMs)} — click Handoff above the prompt`,
      { timeoutMs: 8000 },
    )
  }

  $.ui.invalidate('ui.render')
}

const copy = async ($: EngineInterface, text: string, surface?: RenderSurface) => {
  const copied = await $.ui
    .copy(surface === undefined ? { text } : { text, surface })
    .catch(() => ({ isCopied: false }))

  if (copied.isCopied) {
    return true
  }

  // ponytail: macOS-only fallback for a surface with no clipboard path; add wl-copy/clip when needed
  const ran = await $.process.run(['pbcopy'], { stdin: text }).catch(() => null)

  return ran?.exitCode === 0
}

const handoff = async ($: EngineInterface, surface?: RenderSurface) => {
  if (isRunning) {
    return
  }

  if (isBusy) {
    $.ui.toast('Wait for the turn to finish, then hand off')

    return
  }

  isRunning = true
  let isCopied = false

  try {
    await setStep($, 'generating')
    const asked = await $.clock.now()
    const reply = await $.model.fork({ prompt: HANDOFF_PROMPT })

    if (!reply.isAnswered || reply.text.trim() === '') {
      throw new Error(reply.isAnswered ? 'the handoff came back empty' : `no handoff (${reply.reason})`)
    }

    // the fork read the conversation from the cache, which restarts its clock
    await stamp($, asked)
    const text = `${RESUME_PREFIX}\n\n${reply.text.trim()}`
    isCopied = await copy($, text, surface)

    if (!isCopied) {
      throw new Error('could not copy the handoff, so the chat was not cleared')
    }

    await setStep($, 'copied')
    // Kept across the clear: if this module is reloaded before the submit, session.start sends it.
    await $.store.set(PENDING, { text, at: await $.clock.now() })

    try {
      await $.command.run({ command: 'clear' })
    } catch (error) {
      await $.store.delete(PENDING)
      throw error
    }

    await setStep($, 'cleared')
    await $.prompt.submit({ text, asUser: true })
    await $.store.delete(PENDING)
    await setStep($, 'resumed')
    $.clock.after(2500, () => void setStep($, 'idle'))
  } catch (error) {
    await setStep($, 'failed')
    $.ui.toast(
      `Handoff stopped: ${error instanceof Error ? error.message : String(error)}${isCopied ? ' — it is on your clipboard' : ''}`,
      { timeoutMs: 10000 },
    )
  } finally {
    isRunning = false
  }
}

const resume = async ($: EngineInterface) => {
  const pending = (await $.store.get(PENDING)) as { text?: string; at?: number } | undefined

  if (pending === undefined) {
    return
  }

  await $.store.delete(PENDING)

  if (typeof pending.text === 'string' && (await $.clock.now()) - (pending.at ?? 0) < PENDING_MAX_AGE_MS) {
    await $.prompt.submit({ text: pending.text, asUser: true })
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.session.usage().then(seen => measure($, seen), () => undefined)
    $.clock.every(1000, () => void tick($))
    void resume($).catch(() => undefined)

    return next(e)
  })

  on('turn.start', ($, e, next) => {
    isBusy = true

    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      isBusy = false
    }

    return next(e)
  })

  // Every request of the main loop reads the conversation from the cache and
  // writes its new tail, so each one restarts the clock. A subagent has a
  // prefix of its own and leaves the main one alone.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) {
      return yield* next(e)
    }

    const was = await read($, last)
    const asked = await $.clock.now()
    await stamp($, asked)
    const result = yield* next(e)
    const learned = learnTtl(asked - (was ?? asked), result.usage)

    if (learned !== null) {
      await update($, ttl, () => learned)
    }

    return result
  })

  // Another mod's fork reads the same cached conversation.
  on('model.fork', async ($, e, next) => {
    const asked = await $.clock.now()
    const reply = await next(e)

    if (reply.value?.isAnswered) {
      await stamp($, asked)
    }

    return reply
  })

  // A compaction replaces the conversation, so nothing cached matches it any more.
  on('session.compact', async ($, e, next) => {
    const done = await next(e)

    if (!('skip' in done && done.skip)) {
      await stamp($, null)
    }

    return done
  })

  // The cache is per model: a switch forfeits it, and reports the TTL in force.
  on('classic.PostModelSwitch', async ($, e, next) => {
    await update($, ttl, () => (e.cache_ttl === '1h' ? TTL_1H_MS : TTL_MS))

    if (e.from_model !== e.to_model) {
      await stamp($, null)
    }

    return next(e)
  })

  // A resumed conversation's cache has been cooling since its last response.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.seconds_since_last_response !== undefined) {
      await stamp($, (await $.clock.now()) - e.seconds_since_last_response * 1000)
    }

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await measure($, e)

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await stamp($, null)
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    // Another mod (savvy-progress) may draw in this band too: draw ours first and whatever is beneath (savvy-progress) under it, whichever loads first.
    const above = await next(e)
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const Svg = 'Svg' in ui ? ui.Svg : null
    const now = await $.clock.now()
    const life = await read($, ttl)
    const cache = cacheStatus(await read($, last), now, life)
    const seen = await read($, usage)
    const was = await read($, before)
    const at = await read($, step)
    const isDone = at.name === 'resumed'
    const isIdle = at.name === 'idle' || at.name === 'failed' || isDone

    const limit = (kind: string, label: string) => {
      const found = seen.limits.find(l => l.kind === kind)

      return {
        label,
        pct: found?.percentUsed ?? null,
        from: was.limits.find(l => l.kind === kind)?.percentUsed ?? 0,
        note: until(found?.resetsAt, now),
      }
    }
    const gauges = [
      limit('five_hour', '5h'),
      limit('seven_day', 'Week'),
      { label: 'Context', pct: seen.context, from: was.context ?? 0, note: '' },
    ]
    const headline = isDone
      ? 'continuing in a fresh chat'
      : at.name === 'failed'
        ? 'handoff stopped — see the toast'
        : !isIdle
          ? `handoff: ${at.name}…`
          : cache.phase === 'warm' || cache.phase === 'cooling'
            ? `cold in ${mmss(cache.leftMs)}`
            : cache.phase === 'cold'
              ? 'next response re-caches'
              : 'waiting for a response'

    const mine = (
      <Box key="cache-watch-row" columnGap={3} rowGap={0} paddingX={1} alignItems="center" flexWrap="wrap">
        <Box gap={1} alignItems="center">
          {Svg ? (
            <Svg
              source={isDone ? check(now - at.at) : ring(cache, now, life)}
              alt={`Cache ${PHASE_LABEL[cache.phase]}`}
              width={RING_PX}
              height={RING_PX}
            />
          ) : (
            <Text color={PHASE_COLOR[cache.phase]}>●</Text>
          )}
          <Text bold color={isDone ? 'success' : PHASE_COLOR[cache.phase]}>
            {isDone ? 'HANDED OFF' : PHASE_LABEL[cache.phase]}
          </Text>
          <Text dimColor={at.name !== 'failed'} color={at.name === 'failed' ? 'error' : undefined}>
            {headline}
          </Text>
        </Box>

        {gauges.map(g => (
          <Box gap={1} alignItems="center">
            <Text dimColor>{g.label}</Text>
            {Svg ? (
              <Svg
                source={bar(g.pct ?? 0, g.from, now - seen.at)}
                alt={`${g.label} ${g.pct ?? 0}% used`}
                width={BAR_W}
                height={4}
              />
            ) : (
              <Text color={(g.pct ?? 0) >= 90 ? 'error' : (g.pct ?? 0) >= 70 ? 'warning' : 'suggestion'}>
                {textBar(g.pct ?? 0)}
              </Text>
            )}
            <Text bold>{g.pct === null ? '—' : `${Math.round(g.pct)}%`}</Text>
            {g.note !== '' && <Text dimColor>{g.note}</Text>}
          </Box>
        ))}

        <Box flexGrow={1} justifyContent="flex-end">
          <Button
            key="handoff"
            hotkey="h"
            variant="primary"
            label={isIdle ? 'Handoff' : 'Handing off…'}
            onPress={press => void handoff($, press.surface)}
          />
        </Box>
      </Box>
    )

    return above ? <Box flexDirection="column">{mine}{above}</Box> : mine
  })
}
