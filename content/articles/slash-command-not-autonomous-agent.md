---
title: A Slash Command Is Not an Autonomous Agent
description: A Slash Command Is Not an Autonomous Agent — an essay by Kevin Wen.
summary: A command starts an interaction. Persistent goals, evaluation, and safety budgets are what make a system autonomous.
date: 2026-07-20
tags: [ai-systems, agentic-engineering, software-architecture]
order: 3
---

It is easy to make an agent interface look autonomous. Add a command named `/goal`, expand it into “keep working until complete,” and the interaction feels like a persistent objective.

But a name is not a control plane.

In a source-based comparison of OpenCode, OpenHarness, and Hermes Agent, the important difference was not whether a command parser could recognize `/goal`. All three systems can parse slash-prefixed input or be extended to do so. The difference was whether the system could own the lifecycle after the first model turn ended.

## A command is an entry point

In OpenCode, a configured slash command expands into prompt content. In OpenHarness, a registry resolves a command name and invokes a handler. Both are useful extension mechanisms. Neither, by itself, creates a durable objective.

A genuine goal needs state that survives the model’s first answer: the objective, status, turn budget, evidence required for completion, wait conditions, and diagnostics when something fails. It needs a post-turn hook that decides whether to stop, wait, or schedule another normal agent turn. It needs a real-user message to preempt a stale continuation. It needs a bounded failure policy rather than an invitation to retry forever.

Without those pieces, “continue until complete” is just an instruction the model may or may not follow inside one ordinary turn.

## Completion is a decision, not a feeling

The difficult part of autonomous work is deciding what “done” means. A system can treat the last assistant message as evidence, but it needs a completion contract: verification criteria, constraints, stop conditions, and perhaps subgoals. It needs to recognize a genuine block or request for user input as terminal rather than blindly producing another continuation.

Hermes makes this explicit. Its `/goal` creates persisted session state, runs a normal first turn, evaluates completed turns with an auxiliary judge, and then marks the goal done, parks it behind a wait barrier, or enqueues a synthetic continuation. That is harness-level behavior. The interface is a command; the feature is the loop around the command.

## Autonomy needs a safety budget

Persistent loops amplify both progress and mistakes. A practical design sets a turn budget, pauses rather than declaring success when the budget is exhausted, limits malformed-judge retries, and makes waiting an explicit state instead of burning turns while a process is still running.

These rules are not bureaucratic decoration. They make the system inspectable. An operator can answer: What objective is active? Why did it continue? What evidence made it stop? Is it waiting for a process, or is it stuck? Can a user safely replace the objective?

## The design test

When someone says a product has autonomous goals, ask four questions:

1\. Where is the objective persisted? 2. Who evaluates completion after a turn? 3. How is the next turn scheduled, paused, or preempted? 4. What stops an incorrect loop from continuing indefinitely?

If the answer is only “the prompt tells the model to continue,” the product has a command, not an autonomous goal engine.
