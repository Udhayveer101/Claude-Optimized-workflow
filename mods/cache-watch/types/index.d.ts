export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Usage = { at: number; context: number | null; limits: Limit[] }

export type StepName = 'idle' | 'generating' | 'copied' | 'cleared' | 'resumed' | 'failed'

export type Step = { name: StepName; at: number }

declare module 'claude-code' {
  interface PluginState {
    'cache-watch': {
      last: number | null
      ttl: number
      reminded: number | null
      usage: Usage
      before: Usage
      step: Step
    }
  }
}
