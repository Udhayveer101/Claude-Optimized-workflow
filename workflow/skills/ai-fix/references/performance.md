# 09 — Performance and resource leaks

AI writes code that is correct for n=10 and catastrophic for n=100,000, because it never sees
production scale.

## Algorithmic / data
- N+1 queries: a query inside a loop over results of another query. The most common AI perf bug.
- O(n²) scans where a dict/set lookup would do; repeated `array.includes` inside a loop.
- Loading whole tables/files into memory instead of streaming or paginating.
- No pagination on list endpoints and list UIs; no `LIMIT`; `SELECT *`.
- Missing indexes for the query patterns the code actually issues.
- Re-computing derived values on every render/tick instead of caching once.
- Sorting/filtering client-side over a full dataset that should be filtered server-side.

## Memory and resource leaks
- Unbounded caches / dictionaries / arrays that only ever grow (classic AI "add a cache" fix).
- Unbounded queues and buffers; unbounded log files.
- Retain cycles: closures capturing `self` strongly (Swift), listeners/observers/timers/
  subscriptions never removed, `NotificationCenter` tokens never released.
- `useEffect`/lifecycle subscriptions with no cleanup; event listeners added on every render.
- File handles, sockets, DB connections, `FileHandle`, `DispatchSource` never closed.
- No connection pooling, or a new client constructed per request.
- Background timers that keep running (and keep waking the device) after the view closes.
- Large images/decoded bitmaps held in memory; no downsampling; no thumbnail cache eviction.
- Recursive directory walks with no depth limit, no symlink loop guard, no exclusion of
  system/network volumes — memory and time blow-ups on real machines.

## Responsiveness
- Heavy work on the main/UI thread: file I/O, hashing, JSON parsing, crypto, scanning.
- Synchronous network calls; blocking sleeps.
- No progress reporting or cancellation on long operations.
- Excessive re-renders / missing memoisation / new object literals in props each render.
- No debounce/throttle on search-as-you-type, resize, scroll handlers.
- No virtualisation for long lists.
- Startup work done eagerly that should be lazy — slow cold start.

## Cost and consumption
- No rate limiting → someone else's bot runs up your bill.
- No caps on LLM/API usage per user; no cache of identical requests.
- **Agent/LLM loop with no max-iteration guard** — a ReAct/tool-calling loop that fails to parse
  a response re-queries the model forever. Reported: ≈$3,700 of compute in 3h; one dev's $250
  self-set cap became a $10,138 overnight bill with no alert (2026).
- **Budget "cap" that only warns.** A ceiling that doesn't terminate the workload is not a cap.
- **Retry storms without backoff+jitter** multiply spend on every provider hiccup.
- **Serverless pay-per-request** turns any of the above into an unbounded invoice with no
  steady-state baseline to alarm against.
- Polling loops where an event/webhook would do; polling with a 1s interval "for responsiveness".
- Chatty logging to a paid log sink; verbose logs left on in release builds.
- Battery: no coalescing of background work, wake-locks held, high-frequency timers.

## Rules
1. State the expected n for every loop and query, and confirm the code holds at 100× that.
2. Every agent/LLM loop has a hard max-iteration and max-wallclock bound and a spend ceiling that
   terminates (not just alerts); per-user token/request quota on anything that costs money.
3. Every cache is bounded (LRU + max size + TTL) or it is a leak.
4. Every subscription, observer, timer, and handle has a paired teardown in the same file.
5. Measure before optimising; but *bound* everything without needing a measurement.
