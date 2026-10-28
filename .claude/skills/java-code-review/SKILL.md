---
name: java-code-review
description: Review the diff against the develop branch and output a review list in English
user-invocable: true
allowed-tools: Bash, Read, Grep, Glob
---

# Review Develop Skill

Take the diff against the `develop` branch, review it against the checklist below, and output the result in English.

---

## Workflow

### Step 1: Get the diff

```bash
git diff develop...HEAD
```

If there is no diff, report "No differences against `develop`." and end the skill.

### Step 2: Narrow down what to review

Review **only the Java files** in the diff. SQL, HTML, yml and the like are out of scope.

### Step 3: Reason about each file

For each Java file in the diff, answer the following questions in order.

- What is this class/interface responsible for? Does it hold to the single responsibility principle?
- Are the data structures right? (choice of type, redundant storage, ownership)
- Is each branch business logic, or a design flaw? Are there branches a better data structure would remove?
- Are there any convention violations? (exception handling, annotations, naming, package layout)
- Are the contracts with the outside world (APIs, interfaces) consistent?
- Is it over-engineered? Does the complexity of the solution match the complexity of the problem?
- If there is a problem: record the severity (🔴/🟡/🔵), the line number and what the problem is

### Step 4: Checklist (referenced by the reasoning in Step 3)

#### A — Data structures and ownership

- What is the core data? Are the relationships between pieces of it correct?
- Are there unnecessary copies or conversions of data?
- **Choice of type** — is a fixed set of values (a state, kind, category and so on) being represented as a `String` or an `int`? Define it as an `enum` instead
- **Redundant fields** — is a child entity duplicating a value it could reach by following a reference (FK)? If it is stored anyway, the reason (e.g. performance) must be made explicit
- **Class conventions** — do entities, DTOs, services and the rest follow the project's java-clean-code conventions

#### B — Branching and special cases

- List the `if/else` branches and decide whether each is business logic or a design flaw
- Consider whether a different data structure, or chained `Optional` calls (`map` / `filter` / `orElseGet`), would remove the branch
- Where the code queries a repository several times and then hand-branches between insert and update, consider collapsing it with `orElseGet` or similar

#### C — Complexity and conventions

- **Indentation depth** — nesting `if` more than three deep is a reason to doubt the design. Consider early returns, extracting methods, or rethinking the data structure
- **Naming** — does each class and method name state exactly one responsibility? A name containing "And", "Or", "Manager" or "Util" is a sign of too many responsibilities
- **Exception handling** — never use `IllegalArgumentException` or `RuntimeException` directly; use `Gs8Exception`. `catch` must name a specific exception type and must not swallow a bare `Exception`
- **Controller** — no injecting repositories directly, no business logic, and as a rule no `try-catch`. A `catch` whose purpose is to show an error on screen is allowed, but it must log via `log.warn` / `log.error` (no logging is a 🟡 finding)
- **Service** — read methods default to `@Transactional(readOnly = true)`, write methods to `@Transactional`
- **Entity / Repository** — N+1 problems, fetch strategy stated explicitly
- **Consistency of external client design** — check that header-based authentication and interceptor-based authentication are not mixed, and that one of the two is used throughout
- **DTO** — naming conventions (`Dto` / `Command` / `Query` / `Form`), no domain logic mixed in
- **Package layout** — follows `modules/{name}/domain, dto, repository, service, controller`
- **Magic values** — string and numeric literals pulled out into constants
- Every method and class carries a single responsibility. Where several are mixed together, consider separating them

#### D — Risk of breakage

- Does this change risk breaking existing functionality?
- Is compatibility preserved for APIs, interfaces and contracts?

#### E — Over-engineering check

- Does the complexity of the solution match the severity of the problem?
- Is this a premature abstraction, or otherwise over-engineered?

---

### Step 5: Output the review in English

Output the following single table and nothing else. No overall assessment, summary, preamble or explanation.

| Severity | File | Method | Line | Problem |
|----------|------|--------|------|---------|
| 🔴 | `path/File.java` | `methodName` | L42 | Uses `RuntimeException` directly. Use `Gs8Exception`. |
| 🟡 | `path/File.java` | `methodName` | L88 | Missing `@Transactional(readOnly = true)`. |
| 🔵 | `path/File.java` | `methodName` | L20–L60 | The method has several responsibilities. Consider separating them. |

## Output rules

- **🔴**: security violations, clear departures from the conventions, risk of data corruption
- **🟡**: violations of recommended conventions, design problems that could become bugs later
- **🔵**: too complex, too many special cases, wrong data structure
- If there is nothing to report, write only "No findings"
- Do not report on code outside the diff
- Write all output in **English**
- Do **not** output an overall assessment, a summary or a preamble
