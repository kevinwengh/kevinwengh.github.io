---
status: review-draft
written: 2026-05-08
title: "Security Cannot Be Self-Indulgent"
tags:
  - Security
  - Engineering Leadership
source_note: docs/linkedin/security-cannot-be-self-indulgent/article.md
---

# Security Cannot Be Self-Indulgent

> Review draft. **Written:** 2026-05-08 — the first Git commit for the source note, not a later web-publication date.

Security has a special weakness: it can look serious even when it is not reducing much risk. A long checklist, a severe-sounding policy, a dashboard full of red, a mandatory review meeting, a new scanning tool, or a pile of tickets can all create the feeling of progress. But security is not supposed to make us feel serious. Security is supposed to reduce real risk.

That distinction matters because self-indulgent security is easy to justify. Nobody wants to be the person who argues against security work. If a control sounds strict, it feels responsible. If a process creates friction, it feels like discipline. If a tool reports many findings, it feels useful. But a security program can be busy, loud, and expensive while still failing to protect what matters most.

## Trap 1: Measuring Ticket Volume Instead Of Risk

A scanner produces 800 findings. The dashboard turns red. Leadership asks for weekly updates. Engineering teams are assigned remediation quotas. Everyone is now doing security work. But what changed? If most findings are low-context dependency issues in internal tools with no exploit path, the organization may spend months reducing ticket count while leaving the highest-risk path untouched.

Ticket volume is not risk. Risk has a path: an asset, an actor, an exposure, a likelihood, and an impact. A good security program can explain which path it is reducing. Did we close a privilege escalation route? Did we eliminate public access to sensitive endpoints? Did we remove long-lived credentials? Did we reduce time to patch a critical class of vulnerabilities? Did we improve detection for the abuse case we actually fear? Without that connection, security work becomes a ticket factory.

## Trap 2: Policy As Performance

Policies can be necessary. But policies can also become performance. A team writes a strict rule, announces it broadly, and feels safer because the rule exists. The problem is that a policy does not protect anything unless it changes behavior in a way that reduces meaningful risk.

For example, banning a broad category of tools may sound strong, but if teams need those tools to operate, they may route around the process. Now the organization has both the original risk and a shadow workflow. A better policy starts from the threat model: what data can leak, what action can be abused, what approval is needed, what logging is required, and what safer path lets people do legitimate work without hiding it.

## Trap 3: Security Reviews That Arrive Too Late

Another common trap is the late security review. A system is already designed, implemented, and near launch. Security enters at the end, finds architectural issues, and becomes the team that says no. Everyone gets frustrated. Security feels ignored. Engineering feels blocked. The business feels delayed.

The problem is not that security reviewed the system. The problem is that security was treated as a gate instead of a design partner. Real risk reduction happens earlier, when data classification, identity boundaries, permissions, audit trails, abuse cases, and failure modes are still cheap to change. A late review can catch bugs. An early review can shape the system so entire bug classes are less likely to exist.

## Trap 4: Anxiety Reduction Disguised As Risk Reduction

Some security work mainly reduces anxiety. More approvals. More meetings. More dashboards. More attestations. People feel safer because more ceremony surrounds the system. But ceremony is not automatically control. A process that slows every low-risk change while missing the one dangerous path is not mature. It is expensive theater.

The mature question is: which exposure, likelihood, blast radius, or recovery gap became smaller because of this work? If a process cannot answer that, it may still have compliance value, but we should not confuse compliance evidence with security impact.

## What Good Security Looks Like

Good security is specific. It names the asset, the threat, the path, and the control. It prioritizes honestly. It distinguishes a theoretical issue from an exploitable issue in this environment. It helps engineers make safer decisions without burying them in undifferentiated fear. It creates paved roads so the secure path is easier than the unsafe workaround.

The best security teams do not create the most fear or the most tickets. They help the organization understand risk clearly, choose the most important reductions, and verify that reality changed. Security cannot be self-indulgent because trust is too important and attention is too scarce. Security is not theater. It is measured risk reduction.
