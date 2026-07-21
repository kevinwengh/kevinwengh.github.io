---
status: review-draft
written: 2026-07-20
title: "Goals and Tasks Are Different State Machines"
tags:
  - AI Systems
  - Agentic Engineering
  - Software Architecture
source_note: docs/designs/hermes-goal-and-kanban-task-implementation.md
---

# Goals and Tasks Are Different State Machines

> Review draft. **Written:** 2026-07-20 — the source-inspection date recorded in the note.

“Break this goal into tasks and keep working until it is done” sounds like one feature. In an agent system, it is usually two.

One state machine manages a standing objective inside a conversation. Another manages durable work items that can be claimed, blocked, retried, delegated, and related to one another. Conflating them produces systems that look capable in a demo and become confusing as soon as work crosses a session boundary.

## A goal is a conversation control loop

A session-scoped goal answers questions like: What objective is active? Has the agent produced enough evidence to call it complete? Should another turn be scheduled? Is the system waiting for a process or for a person?

The state is compact: objective, status, turn budget, optional completion contract, wait barrier, and judge diagnostics. It belongs close to the session because its purpose is to guide the next conversation turn.

This loop should not assume that every objective naturally decomposes into a durable task graph. Sometimes the agent needs only a second turn to inspect another file, run a test, or explain a result. Persisting that as project work would create noise rather than clarity.

## A task is a durable work record

A Kanban card or durable task answers different questions: Who owns this work? What depends on it? Is it ready to claim? Which worker attempted it? What was the outcome? What should a later human or worker know before resuming?

That system needs its own database records: cards, parent-child links, attempts, leases, events, structured summaries, and explicit blocked or completed states. It can survive beyond a conversation, coordinate multiple workers, and create a reviewable history.

The task system is not just a more detailed prompt. It is a project-management control plane.

## Reuse policy, not identity

The two systems can share useful policy. A goal-completion judge may also evaluate a task running in a goal-oriented mode. Both can use the same tools, approval rules, evidence contracts, and observability conventions.

What they should not share is identity. A goal should not become a task merely because it lasted more than one turn. A task should not disappear because a conversation compacted its context. The boundary makes failure modes understandable.

## A practical decision rule

Use a goal when the unit of work is “keep this conversation moving until a bounded objective reaches a clear state.” Use a task when the unit of work needs ownership, dependencies, scheduling, or a durable handoff.

If the work needs both, connect the two explicitly: a task can start a worker session with a goal contract, and the worker can return a structured completion or block result to the task record. That gives autonomy a place to run and durable work a place to live.

The distinction is simple, but it removes a surprising amount of ambiguity. Goals manage intent through turns. Tasks manage work through time.
