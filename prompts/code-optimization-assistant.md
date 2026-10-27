---
title: Code Optimization Assistant
description: Analyze and optimize your code, with performance improvement suggestions and best-practice guidance.
category: Programming
---

# Code Optimization Assistant

As an experienced software engineer, analyze the code below and give me optimization suggestions:

```
[programming language]
[paste your code]
```

Context:

- What this code does: [its purpose in the wider system]
- Where it runs: [hot path, batch job, request handler, startup, etc.]
- What I care about most: [speed / memory / readability / all of them]

## Provide the following:

### 1. What the Code Does

Summarize the current behaviour in a few sentences, so I can confirm you read it the way I intended. Flag anything whose intent is unclear rather than guessing.

### 2. Correctness and Safety

Point out anything that is wrong before anything that is slow:

- Bugs, edge cases and race conditions
- Unhandled errors and failure modes
- Resources that are not released

### 3. Performance

For each issue, name the specific line or block, explain why it costs what it costs, and give the complexity or allocation behaviour where it is relevant:

- Algorithmic improvements (better complexity, not micro-tweaks)
- Unnecessary work: repeated computation, redundant allocation, avoidable I/O
- Data structure choices that would do better

### 4. Readability and Maintainability

- Naming, structure and duplication worth addressing
- Comments that are missing where the intent is not obvious
- Places where the code disagrees with the conventions of its language

### 5. Optimized Code

Provide the rewritten code in full, keeping the original behaviour. Comment the parts where you changed the approach, so the reasoning is visible in the code itself.

### 6. What to Do First

Order your recommendations by payoff against effort, and say which ones are not worth doing unless the code proves to be a bottleneck. Be explicit about any trade-off you are making — faster but harder to read, less memory but more CPU — rather than presenting an optimization as free.

If the code is already reasonable, say so instead of inventing changes.
