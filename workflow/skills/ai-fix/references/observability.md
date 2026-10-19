# Observability and monitoring

"Don't log secrets" (privacy.md) and "a cap that only warns is not a cap" (performance.md) are
not observability. AI-built systems are usually **un-observable**: bare `print`/`console.log`, no
metrics client, no tracer. The model has no runtime, so it never feels the 3am page and never
learns the dashboard was green during the outage.

## What AI misses

- **No metrics / logs / traces choice.** Everything is a log string. Metrics (cheap aggregates),
  traces (request flow), logs (discrete events) answer different questions and don't substitute.
- **No correlation / trace ID.** Free-text logs; under concurrency one request's lines are
  un-reconstructable across a service or async boundary. Needs structured (JSON) logging + W3C
  `traceparent` propagation.
- **No RED / USE / golden signals.** No systematic latency + traffic + errors + saturation per
  service, or utilisation + saturation + errors per resource. Saturation (pool exhaustion) is
  seen only once users get errors.
- **Alerting on causes, not symptoms.** Pages fire on "CPU > 80%" not "checkout error ratio up" —
  noisy *and* blind. Page on a small set of symptom conditions tied to an SLO; everything else is
  a dashboard or a ticket. Every page has a runbook and is actionable.
- **No SLOs / error budgets / burn-rate alerts.** No target, so alerting is arbitrary thresholds.
  Multiwindow multi-burn-rate (short + long window both burning fast) is the answer.
- **Health checks conflate liveness / readiness / deep health.** `/health` returns `200`
  unconditionally → the LB keeps routing to a broken node (gray failure). Or a deep check pings
  every dependency and ejects the whole fleet on one blip. Readiness exercises critical deps with
  a timeout; use passive LB outlier ejection too.
- **High-cardinality metric labels.** `user_id` / raw path / exception string as a label →
  millions of series → monitoring OOM + a big bill. Per-request context belongs in traces.
- **Head-based trace sampling.** `TraceIdRatioBased(0.01)` decides keep/drop before the error
  exists, so error traces are dropped at 1% too. Needs tail sampling that keeps 100% of errors.
- **Nothing monitors the monitoring.** No dead-man's-switch, so a stalled telemetry pipeline is a
  silent outage ("no data" ≠ "bad data"). Needs an always-firing watchdog on independent infra
  with out-of-band delivery, plus `absent()` / `up == 0` alerts.
- **No synthetic / black-box probe.** A deploy that serves a blank page, an expired cert, broken
  DNS — found only by customers. If the app can't start, it can't report that it can't start.
- **Can't reconstruct a past incident.** Averages only, short retention, no exemplars linking a
  spike to a sample trace. Emit histograms + exemplars; keep one wide event per request (sampled);
  keep error traces at 100%.
- **Log levels wrong in prod.** `DEBUG` on → cost + the usual PII-leak vector. `ERROR`-only →
  every incident starts blind. No runtime per-logger control.
- **Scheduled jobs fail silently.** A cron that fails on day 8, overlapping runs, cron TZ/DST, a
  job that processes 0 rows and reports success. Each cron alerts on non-execution.

## Checklist

- [ ] RED metrics per service, USE metrics per resource, as histograms not averages
- [ ] Structured logs with a `trace_id` on every line; context propagated across every hop
- [ ] Page only on symptom conditions tied to an SLO; every alert has a runbook
- [ ] A watchdog / dead-man's-switch on independent infrastructure, out-of-band delivery
- [ ] At least one external synthetic probe per critical journey; cert + DNS expiry alerts
- [ ] Metric labels are bounded enums — none sourced from IDs / paths / user input
- [ ] Trace sampling keeps 100% of error traces (tail sampling), not a flat head ratio
- [ ] Histograms with exemplars; retention covers a review cycle; error traces kept at 100%
- [ ] `INFO`/`WARN` default in prod; `DEBUG` opt-in per logger at runtime; no bodies at `DEBUG`
- [ ] Every scheduled job alerts on non-execution and guards against overlapping runs

Deeper: the project research vault, "Observability and monitoring".
