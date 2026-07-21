---
title: The Stateless LLM Is the Big Problem
description: The Stateless LLM Is the Big Problem — an essay by Kevin Wen.
summary: The hard AI-system problem is not a model call—it is owning durable, governed state around it.
date: 2026-05-08
tags: [ai-systems, software-architecture]
order: 9
---

The biggest practical problem with LLM systems is not only model intelligence. It is state. The model can produce impressive reasoning, write useful code, summarize complex material, and coordinate tool calls, but the model itself is fundamentally stateless. Each interaction has to reconstruct the world again. State lives somewhere else: in the user, the harness, retrieved documents, tool outputs, memory stores, summaries, scratchpads, or a growing context window that gets sent again and again.

This design works well enough to create impressive products, but it is expensive and awkward. We keep paying to resend information the system should already understand. We stuff more history into the prompt, summarize old turns, retrieve fragments, trim context, and hope the right facts survive. A lot of agent engineering is really memory engineering around a model that wakes up fresh every time.

## Trap 1: Confusing Context With State

The industry often celebrates larger context windows as if they solve the problem. They help, but they do not eliminate it. A huge context window can become a bigger closet, not a better memory. If the system does not know what matters, when it matters, how long it matters, and how to update it safely, more tokens only move the mess into a larger room.

Context is what you send now. State is what the system reliably maintains, updates, forgets, protects, and reasons from over time. A customer preference, a temporary task constraint, a policy rule, a project decision, and a speculative model note should not all have the same status just because they appeared in the conversation. A mature system needs state semantics, not just more context length.

## Trap 2: Re-Sending The World

Many systems handle state by resending everything. The full chat history, the latest tool output, retrieved documents, user metadata, instructions, examples, and prior summaries all go back into the model. It feels simple because the model receives the information. But it is also wasteful, slow, and sometimes confusing.

Imagine an AI coding agent that reads the same repository summary every turn, re-ingests the same design notes, repeats the same test output, and carries forward old assumptions that stopped being true after the last patch. The token bill grows, latency grows, and the model still may attend to the wrong detail. The problem is not that the model lacks intelligence. The problem is that the system has no disciplined state layer.

## Trap 3: Fragmented Ownership

There is also no clean coordination standard between the model creator, the agent framework creator, the reasoning engine, the memory layer, and the application developer. Each layer solves a piece of the state problem. The model provider offers context windows and tool-call formats. The framework offers memory abstractions. The application stores user data. Retrieval systems bring documents. The reasoning layer summarizes intermediate steps. But no one fully owns the lifecycle of state.

This fragmentation creates strange failures. A fact may exist in memory but not be retrieved. A retrieved document may override a newer user instruction. A summary may preserve the wrong conclusion. A tool may return current truth, but the model may continue using stale conversational context. When state is scattered, correctness becomes a negotiation between components that do not share a common contract.

## Trap 4: Memory Without Governance

A naive answer is to give the AI persistent memory. But memory without governance creates a new problem. What should be remembered? Who can inspect it? When should it expire? What if the remembered fact is wrong? What if it contains sensitive information? What if a user changes their mind? What if a business policy changes and the model keeps using the old version?

State is not just storage. State has authority, scope, privacy, freshness, and lifecycle. User preference is different from business truth. Business truth is different from temporary task state. Evidence is different from speculation. Policy is different from example. A serious AI system needs to separate those categories, or its memory becomes another source of confident confusion.

## The Real Competition

The winners may not be the teams that consume the most compute. They may be the teams that use compute most effectively. Sending one million tokens to solve a problem is sometimes useful, but often it is a symptom of poor state design. The real advantage will come from knowing what to keep, what to retrieve, what to compress, what to verify, what to forget, and what should never be trusted just because it appeared earlier in the conversation.

The stateless LLM is not a small implementation detail. It is one of the central design constraints of AI systems. Until we solve it better, much of agent engineering will remain an elaborate effort to rebuild memory around a model that starts every turn with no native continuity. The model is powerful. The state around it is still the hard part.
