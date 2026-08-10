# RDSA Integration Plan

> Used by **Heally** notification/ask selection. Product context: [`heally.md`](./heally.md).

## 1. Objective

Implement a **Recovering Difference SoftMax Algorithm (RDSA)**-inspired notification recommendation system in the application.

The goal is to select the notification/template that is most likely to produce the desired user action while balancing:

- Historical notification performance
- Exploration vs. exploitation
- Notification eligibility ("sleeping arms")
- Notification freshness ("recovering arms")
- User-specific notification history
- Optional contextual factors such as language, device, and time

The source material describes the reward as binary:

- `1` = user completes the lesson/action within the target window
- `0` = user does not complete the lesson/action

For the application, the same idea can be adapted to another desired action such as opening a notification, returning to the app, completing a task, or making a purchase.

> **Important:** RDSA should be treated as a recommendation/optimization layer. It should not bypass normal notification eligibility, user consent, frequency limits, or product/business rules.

---

## 2. Core Concepts

### 2.1 Arms

Each notification/template is an **arm**.

Example:

```text
arm_001 = "You haven't completed today's goal yet."
arm_002 = "Keep your streak going!"
arm_003 = "Your daily challenge is waiting."
arm_004 = "You're almost there — finish today's goal!"
```

An arm can also include context:

```text
(notification_template, language)
(notification_template, user_segment)
(notification_template, device_type)
```

The uploaded reference describes treating notification + language as a distinct arm.

---

## 3. Notification Eligibility

Not every arm should be available in every round.

Before RDSA runs, construct an eligible-arm set:

```text
eligible_arms = getEligibleNotifications(user, context)
```

Examples of eligibility rules:

- User has the required streak.
- Notification is supported by the user's language.
- Notification has not exceeded its frequency limit.
- Notification is valid for the user's current state.
- Notification is allowed for the current time window.
- User has opted into notifications.
- The same notification was not sent too recently.

This corresponds to the **sleeping arms** problem described in the reference.

The algorithm should only score/select from the arms that are eligible for the current round.

---

## 4. Data Model

A production implementation should maintain historical interaction data.

Recommended event structure:

```text
NotificationEvent
------------------
id
user_id
arm_id
sent_at
context
reward
```

Example:

```json
{
  "user_id": "user_123",
  "arm_id": "streak_reminder",
  "sent_at": "2026-08-08T18:00:00Z",
  "context": {
    "language": "en",
    "device": "android"
  },
  "reward": 1
}
```

The reference uses a binary reward, where completion within the target period is `1` and non-completion is `0`.

---

## 5. Reward Definition

Define exactly what success means before implementing the algorithm.

Example:

```text
reward = 1
if user completes the target action within 2 hours
else
    reward = 0
```

For another application, this could be:

```text
reward = 1 -> user opens notification
reward = 1 -> user completes a task
reward = 1 -> user returns to the application
reward = 1 -> user completes checkout
```

Keep the reward definition stable during an experiment so that arm scores remain comparable.

---

## 6. Historical Scores

RDSA uses two important quantities.

### 6.1 Mu Plus

`μ+` represents the historical average reward when an arm was actually selected.

Conceptually:

```text
mu_plus =
    rewards when arm was selected
    --------------------------------
    number of times arm was selected
```

For binary rewards:

```text
mu_plus = successful_selected_rounds / selected_rounds
```

Example:

```text
Arm: streak_reminder

Selected: 1,000 times
Successful: 240

mu_plus = 240 / 1000
        = 0.24
```

---

## 7. Mu Minus

`μ-` represents the reward performance associated with an arm being eligible but not selected.

Conceptually, it answers:

> How does the outcome compare when this arm was available but another arm was selected?

The reference uses this quantity to reduce bias caused by different arms being eligible in different rounds.

A practical implementation should carefully define the observation set for `mu_minus` and avoid treating unavailable arms as negative evidence.

---

## 8. Difference Score

The historical arm score is based on the relative difference between `μ+` and `μ-`.

Conceptually:

```text
score = relative_difference(mu_plus, mu_minus)
```

The purpose is to estimate how much better an arm performs when selected compared with the relevant counterfactual baseline.

Do not replace this with simply:

```text
score = total_successes / total_attempts
```

if the goal is to reproduce the RDSA methodology described in the reference.

---

## 9. Recency Penalty

The reference introduces a **recency penalty** to address recovering arms and novelty bias.

The application should keep notification history for a rolling period, such as 28 days.

For every eligible arm:

```text
days_since_last_sent = current_time - last_sent_time
```

Then apply an exponential decay/penalty to its score.

Conceptually:

```text
adjusted_score =
    base_score - recency_penalty(days_since_last_sent)
```

The reference describes hyperparameters:

```text
γ = 0.0017
h = 15
```

These values were determined through the experiments described in the source material.

However, for a new application, these should be treated as starting points rather than universal constants. They should be validated against application-specific data.

---

## 10. Why Recency Matters

Without a recency penalty, the algorithm can repeatedly choose the historically best notification.

Example:

```text
Day 1 -> "Keep your streak going!"
Day 2 -> "Keep your streak going!"
Day 3 -> "Keep your streak going!"
Day 4 -> "Keep your streak going!"
```

Even if this notification has a high historical score, repeated exposure can reduce its effectiveness.

RDSA therefore favors fresher alternatives when appropriate.

---

## 11. Policy Selection

After calculating the adjusted score for each eligible arm, convert the scores into a policy.

The reference uses a SoftMax policy:

```text
π(a | t) =
    exp(score_a / τ)
    -------------------------
    sum(exp(score_i / τ))
```

Where:

- `a` = candidate arm
- `t` = current round
- `τ` = exploration parameter

Higher `τ` generally means more exploration.

Lower `τ` generally means stronger exploitation.

---

## 12. Online Selection

For a real production system, use the resulting probability distribution to select an arm.

Example:

```text
eligible arms:

A -> 0.60
B -> 0.25
C -> 0.10
D -> 0.05
```

Instead of always selecting A:

```text
A is selected with probability 60%
B is selected with probability 25%
C is selected with probability 10%
D is selected with probability 5%
```

This allows the system to continue learning.

### Offline vs Online

The reference notes that its offline evaluation used `ArgMax` rather than SoftMax because exploration can reduce short-term reward during offline evaluation.

For a real online application, SoftMax or another exploration strategy is generally more appropriate because the system needs continued experimentation.

---

## 13. Complete Runtime Flow

Recommended production flow:

```text
User becomes eligible for notification
                |
                v
       Load application context
                |
                v
       Build eligible arms
                |
                v
       Load historical arm scores
                |
                v
       Calculate recency penalties
                |
                v
       Calculate adjusted scores
                |
                v
        Apply SoftMax policy
                |
                v
       Select notification arm
                |
                v
        Send notification
                |
                v
        Track user outcome
                |
                v
      Convert outcome to reward
                |
                v
       Store notification event
                |
                v
      Update historical statistics
```

---

## 14. Suggested Architecture

Keep the algorithm isolated from the notification service.

Example architecture:

```text
NotificationService
        |
        v
EligibilityService
        |
        v
RDSARecommendationService
        |
        +--> ArmScoreRepository
        |
        +--> NotificationHistoryRepository
        |
        +--> RewardRepository
        |
        v
NotificationSender
```

### Responsibilities

#### `EligibilityService`

Determines which notifications are valid.

```text
getEligibleArms(user, context)
```

#### `RDSARecommendationService`

Runs the RDSA calculation.

```text
selectArm(user, eligibleArms, context)
```

#### `ArmScoreRepository`

Stores historical arm statistics.

```text
getArmScore(armId)
updateArmStatistics(armId, reward)
```

#### `NotificationHistoryRepository`

Stores recent notification history.

```text
getLastSentAt(userId, armId)
getRecentHistory(userId, days)
```

#### `NotificationSender`

Actually delivers the notification.

```text
send(user, notification)
```

---

## 15. Recommended Database Tables

A minimal relational design could be:

### `notification_arms`

```text
id
template_key
language
enabled
created_at
updated_at
```

### `notification_events`

```text
id
user_id
arm_id
sent_at
reward
reward_recorded_at
```

### `notification_arm_statistics`

```text
arm_id
selected_count
selected_reward_sum
eligible_not_selected_count
eligible_not_selected_reward_sum
mu_plus
mu_minus
base_score
updated_at
```

### Optional: `user_notification_history`

This table can be used when recent history needs to be queried independently from the full event table.

```text
id
user_id
arm_id
sent_at
```

---

## 16. API-Level Design

A backend endpoint/service could expose:

```http
POST /internal/notifications/recommend
```

Request:

```json
{
  "userId": "user_123",
  "context": {
    "language": "en",
    "device": "android",
    "localTime": "20:00"
  }
}
```

Response:

```json
{
  "armId": "streak_reminder",
  "probability": 0.62,
  "score": 0.31
}
```

The actual notification delivery should preferably happen through a separate service/process so recommendation and delivery remain independently testable.

---

## 17. Pseudocode

```text
function selectNotification(user, context):

    eligibleArms = eligibilityService.getEligibleArms(user, context)

    if eligibleArms is empty:
        return NONE

    candidates = []

    for arm in eligibleArms:

        statistics = repository.getStatistics(arm.id)

        baseScore = calculateDifferenceScore(
            statistics.muPlus,
            statistics.muMinus
        )

        lastSentAt = history.getLastSentAt(
            user.id,
            arm.id
        )

        daysSinceLastSent = calculateDaysSince(lastSentAt)

        recencyPenalty = calculateRecencyPenalty(
            daysSinceLastSent
        )

        adjustedScore = baseScore - recencyPenalty

        candidates.append({
            arm: arm,
            score: adjustedScore
        })

    policy = softmax(candidates, temperature)

    selectedArm = sample(policy)

    return selectedArm
```

---

## 18. Updating the Model After a Notification

When the user outcome becomes known:

```text
notification sent
       |
       v
wait for reward window
       |
       v
did user perform target action?
       |
     /   \
   yes    no
    |      |
 reward=1 reward=0
    \     /
     v   v
update statistics
```

Example:

```text
Arm A
Selected 100 times
Successful 25 times

mu_plus = 0.25
```

The statistics should be updated incrementally rather than recalculating the entire dataset on every event.

---

## 19. Cold Start Problem

A new arm has little or no historical data.

Example:

```text
new_arm
selected_count = 0
reward_count = 0
```

Directly calculating:

```text
reward_count / selected_count
```

causes a division-by-zero problem and produces unreliable estimates.

Possible solutions:

1. Minimum exploration quota
2. Bayesian smoothing
3. Prior reward estimates
4. Minimum number of observations before exploitation
5. Empirical Bayes estimation

The reference explicitly notes that its offline implementation did not require empirical Bayes estimation, while the original online experiments used techniques for controlling small sample sizes.

---

## 20. Exploration Strategy

A production implementation should define an exploration policy.

Possible approaches:

### SoftMax

Good fit with the RDSA description.

```text
P(arm) ∝ exp(score / temperature)
```

### Epsilon-Greedy

```text
with probability ε:
    choose random eligible arm

otherwise:
    choose highest-scoring arm
```

### ArgMax

Always choose the highest score.

This is useful for certain offline evaluations but can stop learning effectively in production.

---

## 21. Guardrails

The algorithm should never be allowed to bypass product constraints.

Apply these rules before RDSA:

```text
user opted in?
    |
    +-- no --> do not send

frequency limit exceeded?
    |
    +-- yes --> do not send

outside allowed time?
    |
    +-- yes --> wait

no eligible templates?
    |
    +-- yes --> do not send

otherwise
    |
    v
run RDSA
```

Recommended guardrails:

- Daily notification limit
- Per-template cooldown
- Quiet hours
- User opt-out
- Regional/legal restrictions
- Notification priority
- Emergency/system notifications excluded from RDSA
- Maximum number of notifications per campaign

---

## 22. Metrics to Track

Do not evaluate the algorithm using only reward.

Track:

### Primary

```text
Reward rate
Conversion rate
Incremental lift
```

### Secondary

```text
Notification open rate
App return rate
Task completion rate
Opt-out rate
Notification disable rate
Uninstall rate
```

### Algorithm health

```text
Arm selection distribution
Exploration rate
Cold-start arms selected
Average recency
Score distribution
Eligible-arm count
```

This helps detect cases where the algorithm technically increases reward while creating a poor user experience.

---

## 23. Offline Evaluation

Before production deployment, evaluate the policy using historical notification data.

The reference describes **weighted importance sampling** for estimating how a new policy would have performed using logged data.

Conceptually:

```text
estimated reward =
    average(
        new_policy_probability / behavior_policy_probability
        * observed_reward
    )
```

This is useful because historical data only contains the reward for the notification that was actually selected.

### Important limitation

Offline evaluation cannot directly observe what would have happened if another notification had been sent.

Therefore:

- Use sufficiently randomized historical data.
- Ensure the logging policy has non-zero probability for candidate actions.
- Monitor high-variance estimates.
- Validate with an online experiment before fully deploying.

---

## 24. A/B Testing Plan

Recommended rollout:

### Phase 1 — Shadow Mode

RDSA recommends notifications but does not control delivery.

Log:

```text
user
eligible arms
selected RDSA arm
score
probability
actual delivered arm
reward
```

Compare recommendations with the existing policy.

### Phase 2 — Small Experiment

Example:

```text
Control: 95%
RDSA:      5%
```

### Phase 3 — Gradual Rollout

```text
10%
25%
50%
75%
100%
```

Increase traffic only if:

- Reward improves.
- User engagement remains healthy.
- Opt-outs do not increase significantly.
- No notification-frequency regressions occur.

---

## 25. Observability

Every recommendation should be traceable.

Example log:

```json
{
  "userId": "user_123",
  "requestId": "req_456",
  "eligibleArms": [
    "arm_a",
    "arm_b",
    "arm_c"
  ],
  "selectedArm": "arm_b",
  "scores": {
    "arm_a": 0.12,
    "arm_b": 0.31,
    "arm_c": 0.20
  },
  "policy": {
    "arm_a": 0.18,
    "arm_b": 0.57,
    "arm_c": 0.25
  }
}
```

Avoid logging sensitive user information unnecessarily.

---

## 26. Performance Considerations

Do not calculate historical statistics by scanning the entire notification-event table for every user request.

Instead:

```text
Offline / async processing
        |
        v
Precompute arm statistics
        |
        v
Store statistics
        |
        v
Online recommendation
        |
        v
Only calculate user-specific recency
```

This separates expensive historical computation from low-latency recommendation.

For a large application:

- Cache arm statistics.
- Index `user_id + arm_id + sent_at`.
- Store aggregate statistics.
- Process rewards asynchronously.
- Avoid loading a user's entire notification history.
- Use a bounded history window.
- Batch statistics updates where possible.

---

## 27. Suggested Implementation Modules

Example project structure:

```text
src/
├── notification/
│   ├── NotificationService
│   ├── NotificationSender
│   └── EligibilityService
│
├── rdsa/
│   ├── RdsaService
│   ├── ArmScoreCalculator
│   ├── RecencyPenaltyCalculator
│   ├── SoftmaxPolicy
│   ├── RewardUpdater
│   └── models/
│       ├── Arm
│       ├── ArmStatistics
│       └── NotificationContext
│
├── repositories/
│   ├── ArmRepository
│   ├── NotificationEventRepository
│   └── ArmStatisticsRepository
│
└── analytics/
    └── NotificationMetrics
```

---

## 28. Unit Tests

At minimum, test:

### Eligibility

```text
should exclude disabled arm
should exclude unsupported language
should exclude recently sent arm when cooldown applies
should return empty when no arm is eligible
```

### Mu Plus

```text
should calculate selected reward rate
should handle zero observations
```

### Mu Minus

```text
should calculate eligible-but-not-selected reward statistics
should ignore unavailable arms
```

### Recency

```text
new arm should have minimal/no recency penalty
recently used arm should receive stronger penalty
older arm should receive weaker penalty
```

### SoftMax

```text
probabilities should sum approximately to 1
higher score should normally receive higher probability
temperature should affect exploration
```

### Selection

```text
should only select eligible arms
should never select disabled arms
should respect cooldowns
```

### Reward updates

```text
reward=1 updates success statistics
reward=0 updates observation statistics
duplicate reward events are handled safely
```

---

## 29. Recommended Implementation Order

Do not implement the complete system at once.

### Step 1 — Notification event tracking

Build reliable logging for:

```text
user_id
arm_id
sent_at
reward
context
```

### Step 2 — Eligibility engine

Implement deterministic eligibility rules.

### Step 3 — Baseline policy

Implement the existing/random policy first.

### Step 4 — Historical statistics

Implement:

```text
mu_plus
mu_minus
difference score
```

### Step 5 — Recency penalty

Add user-specific history and score adjustment.

### Step 6 — SoftMax

Convert adjusted scores into probabilities.

### Step 7 — RDSA service

Combine all components into one recommendation service.

### Step 8 — Offline evaluation

Compare RDSA against the existing policy.

### Step 9 — Shadow mode

Generate recommendations without affecting users.

### Step 10 — Controlled online experiment

Run a small A/B test.

### Step 11 — Gradual rollout

Increase traffic after monitoring the metrics.

---

## 30. Configuration

Keep algorithm parameters configurable rather than hard-coded.

Example:

```yaml
rdsa:
  enabled: true

  softmax:
    temperature: 0.5

  recency:
    gamma: 0.0017
    half_life_days: 15
    history_days: 28

  reward:
    window_minutes: 120

  exploration:
    enabled: true

  rollout:
    percentage: 5
```

The exact values should be validated using the application's own data.

---

## 31. Practical MVP

If the application is small, start with a simplified version.

### MVP

```text
1. Define 5-20 notification arms.
2. Track every notification event.
3. Define binary reward.
4. Calculate historical success rate.
5. Apply recency penalty.
6. Use SoftMax to select an arm.
7. Store the outcome.
8. Update statistics asynchronously.
9. Compare against a random/control policy.
```

Once this works reliably, add:

```text
language
device
time-of-day
user segments
Bayesian smoothing
hierarchical models
more sophisticated contextual policies
```

---

## 32. Example End-to-End Scenario

Suppose the application has three eligible notifications:

```text
A = "Continue your daily goal!"
B = "You're one step away from finishing!"
C = "Your daily challenge is waiting!"
```

Historical scores:

```text
A = 0.30
B = 0.22
C = 0.18
```

But A was sent recently:

```text
A -> sent 1 day ago
B -> sent 7 days ago
C -> never sent
```

After applying recency:

```text
A -> 0.17
B -> 0.21
C -> 0.18
```

SoftMax might produce:

```text
A -> 0.30
B -> 0.39
C -> 0.31
```

The algorithm therefore does not blindly select the historically strongest notification.

Instead, it considers:

```text
historical effectiveness
+
recency
+
exploration
+
current eligibility
```

---

## 33. Important Design Decision: Arm Granularity

Choose the arm definition carefully.

Too broad:

```text
"reminder"
```

Too specific:

```text
("reminder", user_123, android, 20:03, Tuesday)
```

A practical starting point is:

```text
(template, language)
```

Then introduce context only when enough data exists.

The reference specifically describes experimenting with notification + language as separate arms.

---

## 34. Recommended Initial Scope

For the first production implementation, keep the system simple:

```text
Arm
  |
  +-- template
  +-- language

Eligibility
  |
  +-- product rules
  +-- cooldown
  +-- user consent

Score
  |
  +-- mu_plus
  +-- mu_minus
  +-- difference score
  +-- recency penalty

Policy
  |
  +-- SoftMax

Feedback
  |
  +-- reward
  +-- statistics update
```

Avoid adding device, demographic, time, and many other contextual dimensions immediately. These can dramatically increase the number of arms and create sparse-data problems.

---

## 35. Definition of Done

The RDSA implementation can be considered ready for an initial production experiment when:

- [ ] Notification arms are defined.
- [ ] Eligibility rules are deterministic.
- [ ] User notification history is recorded.
- [ ] Reward events are reliably recorded.
- [ ] `mu_plus` is implemented.
- [ ] `mu_minus` is implemented.
- [ ] Difference scores are implemented.
- [ ] Recency penalty is implemented.
- [ ] SoftMax policy is implemented.
- [ ] Cold-start behavior is defined.
- [ ] Frequency/consent guardrails are enforced.
- [ ] Metrics and logs are available.
- [ ] Unit tests cover core calculations.
- [ ] Offline evaluation has been performed.
- [ ] Shadow mode has been tested.
- [ ] A/B experiment infrastructure exists.
- [ ] Rollout can be disabled with a feature flag.

---

## 36. Reference Basis

This implementation plan is based primarily on the supplied RDSA implementation article, which describes:

- Multi-armed bandits
- Sleeping arms
- Recovering arms
- Difference scores using `μ+` and `μ-`
- Recency penalties
- SoftMax policy selection
- Offline evaluation with weighted importance sampling
- Notification + language as an arm
- Production/online considerations and empirical Bayes estimation

The source also describes an offline experiment that reported a relative reward improvement after applying the bandit policy and recency penalty. That result should **not** be assumed to transfer directly to a different application; the new application needs its own offline and online evaluation.

Source: supplied RDSA implementation article.

---

## Keamanan & privasi LLM

Lihat [Heally_Privacy_Security.md](./Heally_Privacy_Security.md) untuk kebijakan de-identifikasi data sebelum dikirim ke provider LLM cloud.
