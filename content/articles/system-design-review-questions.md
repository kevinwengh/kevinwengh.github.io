---
title: Seven Questions a System Design Review Must Force
description: Seven Questions a System Design Review Must Force — an essay by Kevin Wen.
summary: Seven questions that turn an architecture review from a diagram walkthrough into an explicit trade-off discussion.
date: 2026-04-07
tags: [software-architecture, distributed-systems]
order: 15
---

Architecture reviews often fail for a polite reason: everyone can see the diagram, so everyone assumes the hard thinking has happened.

A diagram is useful. It can show ownership, dependencies, and the direction of data. But it cannot answer whether the design will remain correct when a dependency is slow, a message is delivered twice, a region is unavailable, or a business rule changes six months after launch. Those are the questions that decide whether an architecture is merely plausible or actually durable.

The goal of a review is not to reward the prettiest diagram. It is to make the consequential trade-offs explicit while there is still time to change them.

## 1. What changes when this succeeds?

Every design should name the outcome it is trying to improve: customer latency, error rate, recovery time, cost, delivery speed, compliance exposure, or a business capability. “Modernize the service” is not an outcome. “Reduce the time to safely add a new integration from three weeks to three days” is.

This question prevents architecture from becoming self-referential. A cleaner boundary may be valuable, but the review still needs to connect it to a real capability, risk, or cost.

## 2. Where is the source of truth, and who is allowed to change it?

Many distributed-system failures are not availability failures. They are ownership failures.

If two services can update the same fact, or if one service writes a database while another emits an event that represents the same change, the system has created a coordination problem. “We will keep them in sync” is not a design. It is a promise that needs a protocol, a reconciliation path, and evidence that drift is detectable.

Ask which component owns each state transition, what downstream systems may derive from it, and what happens when a write is retried or partially succeeds.

## 3. What does the failure look like to the customer?

Failure handling should not stop at a retry policy. Retries without idempotency can duplicate work. Retries without backoff can turn one dependency outage into a self-inflicted denial of service. A timeout may mean “try again,” “surface uncertainty,” or “stop immediately,” depending on the operation.

The review should walk through at least one dependency failure, one partial write, one stale read, and one overloaded path. The point is not to predict every incident. It is to identify which failures are acceptable, which must be visible, and which require a safe stop.

## 4. Which path is hot, and which path only feels important?

Teams often optimize the code they can see rather than the work the system actually does. The hot path may be a database query, a serialization boundary, a network hop, a queue backlog, or an authorization call. It is rarely improved by a generic “performance project.”

Ask for expected request volume, data size, fan-out, latency budget, and the measurement that will prove the bottleneck. Warm caches can hide bad queries; a successful benchmark can hide a cold-start or recovery problem.

## 5. Which trade-off is being bought, and what does it cost?

Every system chooses between competing properties. Replication can improve read scale and availability, but it introduces lag and conflict. Partitioning can improve write scale, but it changes query shape and operational complexity. Serverless can remove infrastructure work, but it can reduce control over latency and runtime behavior.

The strongest designs do not pretend these choices are free. They state the benefit, the cost, the constraint that made the trade-off necessary, and the condition under which the choice should be revisited.

## 6. How will an operator know what is happening?

Observability is not a dashboard count. A useful system lets an operator answer a small number of urgent questions quickly: What changed? Which customers or regions are affected? Where is the request spending time? Is the system recovering or getting worse? What is safe to do next?

Metrics, traces, logs, audit events, deployment markers, and kill switches should be designed around those decisions. A control that cannot be used quickly under pressure is a knob, not a lever.

## 7. What must remain true after the first production surprise?

No design survives first contact with production unchanged. That is not a failure of design; it is a reason to design for change.

The review should identify the invariants that must survive: data cannot be lost, an action cannot run twice, a user cannot see another tenant’s data, a rollback must be possible, or a region can fail without corrupting the global state. Then ask which parts are intentionally flexible and how a future team will understand the difference.

The uncomfortable questions are the real output of an architecture review. They reveal where a system needs an owner, a measurement, an explicit failure policy, or a more honest trade-off. The diagram is only the map. The review is where the engineering judgment happens.
