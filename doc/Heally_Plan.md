# Heally — PRD & Development Strategy

> Shared product + engineering brief for **mobile-sehatica** and **backend-sehatica**.  
> Notification selection details: see [`RDSA_Implementation_Plan.md`](./RDSA_Implementation_Plan.md).  
> Copy / arms library: see [`Heally_Message_Templates.md`](./Heally_Message_Templates.md) (300 templates).

---

## 1. Product summary

**Heally** is the user’s health AI companion inside Sehatica. It understands the user’s medical context *and* daily behaviour, then reaches out through the **app** and/or **WhatsApp** when a check-in, clarification, or action is needed.

Heally is not only a chat box. It is a closed loop:

```text
Observe behaviour + health context
        → Infer state / risk / opportunity
        → Decide whether to ask (and how)
        → Deliver via App push and/or WhatsApp
        → Learn from response (RDSA reward)
```

---

## 2. Goals

| Goal | Success signal |
|---|---|
| Understand user condition beyond chat text | Behaviour features available for ranking & prompts |
| Ask the right question at the right time | Higher reply / completion rate on Heally asks |
| Dual-channel reach (App + WhatsApp) | User can answer from either channel; history syncs |
| Safe & non-spammy | Consent, caps, quiet hours always beat RDSA |

Non-goals (v1):

- Full device MDM / spyware-level monitoring
- Replacing the doctor
- Sending clinical instructions without verification when `needsVerif` is true

---

## 3. User & channels

### 3.1 Personas

- **Patient (user)** — primary chat + notifications
- **Doctor partner** — verifies risky Heally answers (existing verif flow)
- **System (Heally)** — schedules asks, ranks templates, logs rewards

### 3.2 Channels

| Channel | Use |
|---|---|
| **In-app Heally chat** | Full conversation, suggestions, verif badges |
| **App push** | Soft pull back into chat when an ask is pending |
| **WhatsApp** | Same ask when user prefers / is more active on WA |

Rule: one logical **Ask** can fan out to App and/or WA, but it shares one `ask_id` so replies merge into the same thread.

---

## 4. Behaviour understanding (must exist)

Heally must build a lightweight **User Behaviour Profile** so it “knows” when and how the user engages — not only what they type.

### 4.1 Signals to collect

| Signal | Source | Purpose |
|---|---|---|
| **App open / foreground** | Mobile session lifecycle | Know when user is “present” in Sehatica |
| **Heally screen active time** | Focus time on Heally tab / chat | Depth of engagement with AI |
| **WhatsApp engagement** | WA webhook (inbound/outbound timestamps) | Prefer WA vs app for next ask |
| **Session rhythm** | Aggregated open hours | Best time-of-day windows |
| **Response latency** | Time from ask → first reply | Urgency & channel preference |
| **Action completion** | Schedule toggle, record upload, verif request | Health-task adherence |
| **Screen-time proxy (app-scoped)** | Foreground duration of Sehatica (and optionally Health-related deep links) | Fatigue / attention budget |

> **Privacy note:** Prefer **app-scoped** and **self-reported / consented** signals. Do not require OS-wide screen time APIs unless the user explicitly opts in and the store policy allows it. WhatsApp signals come only from the linked WA conversation with Heally bot.

### 4.2 Derived behavioural features

Computed on backend (batch or near-real-time):

```text
active_hours[]            // hours user usually opens app / replies
channel_affinity          // { app: 0–1, whatsapp: 0–1 }
engagement_score          // rolling 7d / 28d
silence_days              // days since last meaningful reply
heally_dwell_avg_sec      // avg focus time on Heally
wa_reply_rate             // replies / WA asks
app_reply_rate            // replies / app asks
adherence_rate            // schedule done / scheduled
risk_flags[]              // e.g. missed meds, no records, pending verif
```

### 4.3 “Condition” for Heally (prompt + policy)

When Heally plans an ask or chats, context includes:

1. **Clinical / record context** — conditions, meds, recent records, schedule (existing)
2. **Behavioural context** — features above
3. **Channel context** — last successful channel, quiet hours, consent flags

Example system hint (conceptual):

```text
User usually replies on WhatsApp evenings (19–21).
App opens peak: morning. Silence: 2 days.
Pending: missed evening pill + no reply to yesterday’s check-in.
Prefer: short WA ask; escalate to app push if no reply in 2h.
```

---

## 5. Heally Ask — product unit

An **Ask** is a Heally-initiated question that expects a user action/reply.

Examples:

- “Sudah minum obat malam?”
- “Ada gejala pusing hari ini?”
- “Upload hasil lab terakhir?”
- “Mau saya buatkan jadwal olahraga minggu ini?”

### 5.1 Ask lifecycle

```text
draft → eligible → selected (RDSA) → delivered (app/wa)
      → opened / replied / ignored
      → reward recorded → stats updated
```

### 5.2 Delivery rule (required)

When Heally needs a question:

1. Create `ask` + choose **arm** (template) via RDSA eligibility + scoring  
   → see [`RDSA_Implementation_Plan.md`](./RDSA_Implementation_Plan.md)
2. Choose **channel** from behaviour (`channel_affinity`, silence, time window)
3. Deliver:
   - **App:** push + in-chat Heally bubble (same `ask_id`)
   - **WhatsApp:** WA message with same `ask_id` / deep link when possible
4. User reply on **either** channel lands in Heally history (sync)

“Langsung masuk” means: notification / WA message opens or appends into the Heally conversation without the user hunting for it.

---

## 6. Notification strategy (RDSA)

RDSA is the **arm selector** for Heally asks — not the delivery pipe.

### 6.1 Mapping Sehatica concepts → RDSA

| RDSA concept | Heally meaning |
|---|---|
| Arm | Ask template (+ optional language / intent) |
| Eligible arms | Templates valid for this user state (sleeping arms filtered out) |
| Recovering arms | Templates not over-sent recently (recency penalty) |
| Reward = 1 | User replies **or** completes target action within window (e.g. 2h) |
| Reward = 0 | No meaningful response in window |
| SoftMax | Explore vs exploit across templates |

Full math, tables, services, rollout: **`RDSA_Implementation_Plan.md`**.

### 6.2 Heally-specific eligibility (before RDSA)

Always apply product guardrails first:

- User opted into push and/or WhatsApp
- Quiet hours (local timezone)
- Daily / weekly ask caps
- No duplicate open ask of same intent
- Clinical safety: high-risk content stays `needsVerif` path, not casual nudges
- Channel available (WA linked, push token present)

### 6.3 Channel selection (after arm pick)

```text
if wa_linked AND channel_affinity.whatsapp >= channel_affinity.app
   AND now in preferred_wa_window
→ primary = whatsapp, fallback = app_push after T

else
→ primary = app_push + in_chat, optional wa mirror if silence_days high
```

Keep channel picker **simple and rule-based** in v1; do not explode RDSA arms by channel until data is dense.

### 6.4 Reward windows (Sehatica defaults)

| Outcome | Reward |
|---|---|
| Reply to ask (app or WA) within 2h | 1 |
| Completes referenced action (e.g. mark schedule done) within 2h | 1 |
| Opens notification but no reply within 2h | 0 (or soft 0.25 later — stick to binary v1) |
| No open / no reply | 0 |

---

## 7. Data contracts (shared mobile ↔ backend)

### 7.1 Behaviour events (mobile → backend)

```json
{
  "user_id": 1,
  "type": "app_foreground | app_background | heally_focus | heally_blur | session_heartbeat",
  "at": "2026-08-08T19:00:00+07:00",
  "payload": {
    "screen": "heally",
    "dwell_ms": 42000,
    "app_version": "1.0.0"
  }
}
```

Batch when possible. Heartbeat optional; prefer start/stop focus events.

### 7.2 WhatsApp events (backend / WA gateway)

```json
{
  "user_id": 1,
  "type": "wa_inbound | wa_outbound | wa_delivered | wa_read",
  "ask_id": "ask_123",
  "at": "..."
}
```

### 7.3 Ask + notification event (backend)

Align with RDSA `NotificationEvent`:

```json
{
  "ask_id": "ask_123",
  "user_id": 1,
  "arm_id": "med_check_evening",
  "channels": ["app_push", "whatsapp"],
  "sent_at": "...",
  "context": {
    "language": "id",
    "silence_days": 2,
    "channel_affinity": { "app": 0.3, "whatsapp": 0.7 }
  },
  "reward": null
}
```

### 7.4 Suggested tables (backend)

Minimal set (extend existing schema rather than inventing parallel systems):

- `behaviour_events`
- `behaviour_profiles` (materialized features)
- `heally_asks`
- `notification_arms` / `notification_events` / `notification_arm_statistics`  
  → as in RDSA plan
- reuse `chat_messages` with `ask_id` / `fromWhatsApp` linkage

---

## 8. Architecture (cross-repo)

```text
mobile-sehatica
  ├── BehaviourTracker (lifecycle + Heally focus)
  ├── Push handler → open Heally thread (ask_id)
  └── Heally chat UI (templates as normal bubbles)

backend-sehatica
  ├── BehaviourIngest API
  ├── BehaviourProfile job
  ├── HeallyAskPlanner (rules + LLM draft optional)
  ├── EligibilityService
  ├── RDSARecommendationService   ← RDSA_Implementation_Plan.md
  ├── ChannelRouter (app / WA)
  ├── NotificationSender + WhatsAppSender
  └── RewardResolver (reply / action within window)
```

Isolation rule from RDSA plan still applies: **recommendation ≠ delivery**.

---

## 9. Development phases

### Phase 0 — Foundations (now → next)

- [ ] Document arms list (ID copy for ID locale)
- [ ] Behaviour event ingest + profile fields
- [ ] Ask entity + deliver to **in-app chat** first
- [ ] Wire push deep link → Heally

### Phase 1 — Dual channel

- [ ] WhatsApp link + outbound ask + inbound sync into chat
- [ ] Channel affinity from reply rates
- [ ] Quiet hours + daily caps

### Phase 2 — RDSA online

- [ ] Implement eligibility + `μ+` / `μ-` + recency + SoftMax  
      (follow RDSA plan DoD checklist)
- [ ] Shadow mode vs current heuristic
- [ ] Feature flag kill switch

### Phase 3 — Smarter condition

- [ ] Use behaviour profile in chat system prompt
- [ ] Risk-triggered asks (missed meds, empty records)
- [ ] Doctor-partner aware asks (defer if verif pending)

---

## 10. Mobile UX rules (Heally)

- Template / suggestion prompts use **normal chat bubbles** (not empty chip rows)
- Push / WA “ask” opens the same thread; bubble appears as Heally message
- Never spam: if an ask is open, show it in-thread instead of stacking duplicates
- WhatsApp tab remains status + sync explanation; primary conversation lives in Chat

---

## 11. Privacy, consent, safety

- Explicit opt-in for push and WhatsApp
- User can pause Heally asks without deleting medical data
- Behaviour data retention: rolling window (e.g. 28–90 days raw; aggregates longer)
- Clinical safety: RDSA never overrides `needsVerif` / doctor verification
- No medical claims in notification copy beyond check-in / reminder tone

---

## 12. Metrics

| Metric | Why |
|---|---|
| Ask reply rate (app / WA / overall) | Core RDSA reward proxy |
| Time-to-reply | Channel & timing quality |
| 7d retention / Heally opens | Habit |
| Schedule adherence delta after asks | Health outcome proxy |
| Opt-out / mute rate | Spam / trust |
| Verif escalation rate | Safety load |

---

## 13. Open decisions

1. Exact reward window (2h vs same-day) for Sehatica habits  
2. Whether channel is part of the arm key or a separate router (prefer **separate** in v1)  
3. OS screen-time permission vs app-scoped dwell only (prefer **app-scoped** first)  
4. WA provider (Meta Cloud API vs BSP)

---

## 14. References

- [`RDSA_Implementation_Plan.md`](./RDSA_Implementation_Plan.md) — bandit / SoftMax / sleeping & recovering arms / rollout
- Existing product surfaces: Heally chat, WhatsApp tab, schedule, records, doctor partners (QR)

---

## 15. One-liner for the team

**Heally watches how the user lives in the app and WhatsApp, then uses RDSA to pick the next useful question and deliver it straight into chat — on the channel they’re most likely to answer.**
