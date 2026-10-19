# Distributed systems and caching

`reliability.md` covers **single-process** concurrency. This is what breaks once there is a
replica, a cache, or a network in the path. AI reasons about steady state, not feedback loops,
hysteresis, or partial failure — none of which are visible in a diff.

## Systemic failure dynamics

- **Retry amplification.** Every tier retries 3× → 27× at the top; a brownout becomes mostly
  retries and can't recover. Retry at *one* tier; a token-bucket **retry budget** (~10% of
  requests); a circuit breaker.
- **Metastable failure.** A brief trigger (deploy, blip, cache flush) latches the system into a
  degraded state a sustaining effect (retries, backlog, cache misses) keeps alive after the
  trigger is gone. A rollback doesn't fix it — you must shed load hard. Weaken sustaining
  effects; keep a capacity buffer above the knee; have a load-shed lever.
- **No load shedding / admission control.** At overload every request slows and goodput
  collapses instead of the server rejecting excess fast (503 + `Retry-After`). Bounded /
  adaptive concurrency; shed retry + health traffic first; LIFO under load.
- **Fallback that makes it worse.** A cold, unprovisioned alternate path triggered fleet-wide at
  once, sharing the primary's failure domain. Prefer degrading in-path (serve stale/partial). If
  a fallback must exist, keep it continuously warm and capacity-proven.
- **Queue backlog that never drains.** A 5-min blip builds millions of now-stale messages;
  consumers work on garbage forever. Drop-if-older-than-X on dequeue; backpressure to producers
  (429); separate old/new lanes; autoscale on queue *age*.
- **No deadline propagation.** Each hop has its own fixed timeout; downstream keeps working on
  requests the caller already abandoned. Propagate an absolute deadline; each hop uses
  `min(default, remaining)` and wires cancellation.

## Failure detection and consistency

- **Gray / partial failure.** `/health` green (process up) while the node fails real requests.
  Readiness must exercise critical deps; use LB outlier ejection on observed 5xx/latency.
- **Read-after-write / monotonic-read violations.** A read replica or cache added "for scale" and
  read unconditionally → the user saves and the next page shows the old value. Route a user's
  reads to the primary briefly after their write; or write-through; or version/LSN-aware reads.
- **Dual-write inconsistency.** Write DB then Elasticsearch / Redis / a queue; the second write
  fails or the process dies between them → the stores disagree forever. Use a **transactional
  outbox** + a reconciliation sweep. No reconciliation job = the tell.
- **Clock skew.** Wall-clock compared across machines for TTL, lease expiry, or ordering; NTP
  steps it backward. Monotonic clock for elapsed time; the lease *grantor* enforces expiry;
  logical clocks / sequence numbers for ordering.
- **Distributed lock used for correctness.** `SETNX` / Redlock around a write; a GC pause expires
  the lease and a second holder writes. A lock with an expiry needs a **fencing token** the
  resource checks. Prefer idempotency / a unique constraint / a conditional write; treat Redis
  locks as efficiency only.
- **Idempotency present but racy.** The key is checked before processing (two concurrent retries
  both charge), or the stored result isn't replayed, or it isn't scoped to the request body, or
  the key table grows forever. Insert the idempotency row in the *same transaction* as the
  effect, guarded by a unique constraint; fingerprint the body; expire keys.

## Caching

- **Stampede / thundering herd.** One constant TTL, no single-flight → a hot-key expiry sends
  thousands of concurrent misses at the origin, which then can't refill. Single-flight / request
  coalescing; TTL jitter; stale-while-revalidate; leases.
- **Cache-aside write race.** Reader loads `v1`; writer sets `v2` + invalidates; reader writes
  stale `v1` back with a full TTL. Lease tokens, or delete-on-write after commit + a hold-down,
  or versioned writes.
- **Cache penetration.** Misses aren't cached, so a flood of non-existent keys hits the DB.
  Short-TTL negative caching; per-client miss-rate limit.
- **Key missing a dimension.** Tenant / locale / auth scope not in the key → one user served
  another's data. Authenticated responses are `private`/`no-store` unless the key includes
  identity.

## Checklist

- [ ] Retries at one tier only, with a retry budget + circuit breaker
- [ ] Request handlers have a concurrency cap; overload sheds fast instead of slowing everything
- [ ] Readiness checks exercise critical dependencies; LB does outlier ejection
- [ ] A user's reads after a write are read-your-writes consistent
- [ ] Multi-store writes go through an outbox or a projection; a reconciliation sweep exists
- [ ] No distributed lock used for correctness without a fencing token
- [ ] Idempotency: atomic insert in the effect's transaction, response replayed, body fingerprinted, keys expired
- [ ] Cache fills use single-flight / a lease; TTLs are jittered; negative results cached
- [ ] Cache keys include tenant / locale / auth; authenticated content not cached at a shared layer
- [ ] Queues drop stale work on dequeue and apply backpressure to producers

Deeper: the project research vault, "Distributed systems failure modes" and "Caching correctness".
