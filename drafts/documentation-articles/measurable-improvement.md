---
status: review-draft
written: 2026-05-08
title: "If Improvement Is Not Measurable, It Is Self-Indulgence"
tags:
  - Engineering Leadership
  - Software Architecture
source_note: docs/linkedin/unmeasured-improvement-is-self-indulgence/article.md
---

# If Improvement Is Not Measurable, It Is Self-Indulgence

> Review draft. **Written:** 2026-05-08 — the first Git commit for the source note, not a later web-publication date.

One of the easiest traps in engineering is to confuse motion with progress. The calendar fills with planning meetings. Pull requests land. Dashboards appear. A migration tracker turns green. People are tired in exactly the way people are tired after doing real work. And because the effort is real, the team starts to call the result an improvement.

But effort is not evidence. Effort only proves that energy was spent. It does not prove that reality changed in a useful direction. If an improvement cannot be measured in some meaningful way, there is a good chance it is self-indulgence wearing the clothes of engineering.

That sounds harsh, but it is a useful kind of harsh. The point of engineering is not to make the people doing the work feel more sophisticated. It is to change something for users, operators, customers, the business, or the system itself. If reliability improved, incidents, alert quality, recovery time, error budgets, or blast radius should move. If developer productivity improved, build time, review latency, deployment frequency, onboarding time, or rework should move. If security improved, exposure, likelihood, privilege paths, detection gaps, or recovery risk should shrink. If performance improved, latency, throughput, capacity, cost, conversion, or user completion should change. If the only proof is that the new version feels more modern, we may not be improving the system. We may be improving our self-image.

## Trap 1: The Beautiful Rewrite

The most seductive improvement trap is the beautiful rewrite. Everyone has seen the old service that feels impossible to love. The naming is inconsistent. The abstractions are awkward. The tests are thin. Every new feature seems to require touching three places that were clearly not designed by anyone having a good day. So the team proposes a rewrite, and the proposal almost writes itself: cleaner architecture, better boundaries, modern framework, fewer bugs, happier engineers.

The problem is that "the code is ugly" is not yet an improvement claim. It is a pain signal. A rewrite only becomes an improvement when we can say what the ugliness costs. Does this service cause 40 percent of production incidents? Does it make simple changes take three weeks? Does onboarding require a month because the mental model is broken? Does the current architecture prevent a business capability that is actually needed? Without that connection, the rewrite may be technically pleasant and economically invisible.

A better rewrite proposal starts with evidence: in the last two quarters, this service caused eight Sev2 incidents, 30 percent of on-call pages, and repeated rollback failures because state transitions are spread across five modules. Or: the last four customer-requested changes took an average of 18 engineering days because the current design forces duplicate implementation in three pipelines. Now the rewrite has a job. Its success can be measured by fewer pages, faster change lead time, smaller rollback surface, or reduced duplicated logic. The rewrite may still be worth doing, but it has to earn the word "improvement."

## Trap 2: The Dashboard Nobody Uses

Dashboards are another classic form of improvement theater. A dashboard can look like maturity because it gives the organization something visible to point at. There are charts, filters, colors, and a sense that observability has arrived. But a dashboard that does not change decisions is not observability. It is decoration.

Imagine a team creates a production health dashboard with twenty charts: latency, errors, traffic, saturation, queue depth, retry rate, deployment markers, region split, dependency status, and five business counters. It looks impressive. But during the next incident, nobody opens it. The on-call engineer still jumps between logs, alarms, tribal knowledge, and Slack threads. After the incident, the dashboard is mentioned in the review only as something that "should have helped." That dashboard did not improve operations. It improved the feeling that operations had been improved.

The measurement here is not "dashboard exists." The measurement is whether decisions got faster or better. Did mean time to detection drop? Did mean time to diagnosis improve? Did the number of useless alerts decrease? Did new on-call engineers resolve known failure modes without waking a senior engineer? Did incident reviews cite the dashboard as evidence for a decision? A small dashboard with five charts that reliably answers the first three incident questions is more valuable than a beautiful wall of metrics that nobody trusts under pressure.

## Trap 3: The Strategic Migration With No Outcome

Migrations are especially good at disguising themselves as progress because they produce a long sequence of real tasks. Move service A. Update library B. Convert pipeline C. Decommission legacy D. By the end, the migration tracker is green and everyone wants to celebrate. Sometimes they should. But a migration is not automatically an improvement. It is a change in where pain lives.

Consider a platform migration sold as a developer productivity win. Six months later, the team is on the new platform, but deploy lead time is the same, local testing is slower, debugging requires a new set of experts, and incident response now depends on a platform team in another time zone. The architecture diagram became cleaner, but the experience of delivering and operating software did not improve. In some cases, it got worse.

The useful question is: what was the migration supposed to buy? If the answer is cost reduction, show the cost curve. If the answer is reliability, show incident frequency, recovery time, or dependency failure isolation. If the answer is developer speed, show cycle time, deploy frequency, setup time, or rollback confidence. If the answer is risk reduction, show the retiring of an unsupported runtime, a compliance gap, or a real operational dependency. "We are on the new platform" is a completion statement. It is not an impact statement.

## Trap 4: Security Work That Reduces Anxiety, Not Risk

Security has its own version of self-indulgence because security activity is hard to criticize. A scanner produces 600 findings. A process requires more approvals. A policy bans a broad class of tools. A dashboard turns red. Everyone feels the seriousness of the work, and seriousness starts to feel like safety.

But security improvement is not measured by how many tickets exist or how much fear the process creates. It is measured by whether meaningful risk changed. Did we close the privilege escalation path that could actually expose customer data? Did we reduce the number of public endpoints with weak authorization? Did we shorten the time from vulnerability disclosure to patched production? Did we remove long-lived credentials? Did we improve detection for the abuse path we actually worry about?

Without that discipline, security can become a machine that manufactures guilt for engineering teams while leaving the most important risk untouched. A hundred low-context tickets can create more process heat than one carefully chosen fix. The mature security question is not "did we do security work?" It is "which exposure, likelihood, blast radius, or recovery gap became smaller because of this work?"

## Trap 5: AI Productivity Theater

AI makes this topic more urgent because AI makes activity easier to produce. Engineers can generate code faster, write documents faster, summarize meetings faster, create tests faster, and explore unfamiliar systems faster. All of that can be valuable. But faster production of artifacts is not the same as faster production of outcomes.

A team may adopt an AI coding assistant and feel instantly more productive because every engineer is producing more code. But the real question starts after the generation step. Did cycle time shrink after review and rework? Did escaped defects increase? Did senior engineers spend more time reviewing plausible but shallow changes? Did test quality improve, or did the team add more tests that mostly assert the implementation? Did the team ship more useful customer value, or simply more diff volume? Did AI help solve the right business problem, or did it make wrong assumptions cheaper to implement?

The measurement of AI productivity should include the whole delivery loop, not just the moment of generation. Time saved at the keyboard can be lost in review, debugging, rollback, security analysis, or production cleanup. If AI reduces the time to a first draft by 70 percent but increases review burden and defect risk, the team may feel faster while the system becomes slower. In the AI era, measurement is not less important. It is the only way to separate leverage from noise.

## What Measurement Really Means

Measurement does not mean every valuable thing must become one perfect number. Some improvements are qualitative, especially in design, architecture, documentation, leadership, and team process. But qualitative does not mean invisible. Better documentation should reduce repeated questions or shorten onboarding. Better architecture should make a future change easier to explain, safer to implement, or cheaper to operate. Better incident process should reduce time to diagnosis or improve the quality of follow-up actions. Better product design should reduce confusion, increase completion, or produce clearer customer feedback.

I like to think of measurement as a pre-commitment against self-deception. Before doing the work, write down the sentence: "We believe this change will improve X for Y, and we will know because Z will move." That sentence is uncomfortable because it removes the fog. It forces the team to say whether the goal is customer impact, cost reduction, risk reduction, developer speed, operational clarity, or simply aesthetic preference.

Aesthetic preference is not always wrong. Sometimes cleaning up a painful area is worth doing because the team lives there every day. But we should be honest about what kind of work it is. There is a big difference between "this cleanup will reduce incident recovery time" and "this cleanup makes us happier to work in the code." Both may be valid. Only one is an externally meaningful improvement claim.

## The Smallest Useful Bet

Clear measurement also protects teams from oversized solutions. If the real goal is to reduce deploy failures, maybe you do not need a six-month platform rewrite; maybe you need better pre-deploy validation and clearer rollback ownership. If the goal is to reduce customer confusion, maybe you do not need a new product architecture; maybe you need to remove three ambiguous states from the flow. If the goal is to improve security posture, maybe you do not need another dashboard; maybe you need to close the one privilege escalation path that would actually matter.

Once the measurement is clear, the smallest useful change often becomes visible. Without measurement, we tend to choose the change that best matches our taste, status, or preferred technology. With measurement, we can make a smaller bet, check reality, and then decide whether to expand. That is not bureaucracy. That is how engineering stays honest.

Unmeasured improvement is self-indulgence because it lets us award ourselves credit for intention, effort, and taste. Measured improvement is humbler. It says: we may be wrong, our preferences may be expensive, our beautiful solution may not matter, and the system does not owe us validation. That humility is not a constraint on creativity. It is engineering maturity.
