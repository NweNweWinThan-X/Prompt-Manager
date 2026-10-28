# Java Code Style

All rules in this document MUST be followed.

---

# 1. File Structure

Order:

package
imports
class

Rules:

- One top-level class per file
- File name MUST match class name
- Exactly one blank line between sections

---

# 2. Imports

Rules:

- Wildcard imports MUST NOT be used

Import order:

1. static imports
2. normal imports

Additional rules:

- Separate groups with one blank line
- Imports MUST be sorted in ASCII order
- Imports MUST NOT be line wrapped

---

# 3. Indentation

Rules:

- Indentation MUST use **2 spaces**
- Tabs MUST NOT be used

---

# 4. Column Limit

Maximum line length: **100 characters**

Exceptions:

- package
- imports
- URLs in comments
- text blocks

---

# 5. Braces

Rules:

- Control statements MUST use braces
- Braces MUST follow **K&R style**

Example:

if (condition) {
run();
}

---

# 6. Statements

Rules:

- Exactly one statement per line

---

# 7. Whitespace

One space MUST appear:

- after control keywords
- around binary operators
- before `{`

Example:

if (a == b) {
}

---

# 8. Naming

Package

- lowercase only

Class

- UpperCamelCase

Method

- lowerCamelCase

Field

- lowerCamelCase

Constant

- UPPER_SNAKE_CASE

---

# 9. Variable Declarations

Rules:

- One variable per declaration
- Variables SHOULD be declared near usage

---

# 10. Modifier Order

Modifier order MUST follow:

public
protected
private
abstract
default
static
final
transient
volatile
synchronized
native
strictfp

---

# 11. Annotations

Rules:

- Class annotations MUST be on separate lines
- Method annotations MAY appear on the same line

Example:

@Service
public class AccountService {
}

---

# 12. Comments

Comments MUST only appear in the following cases:

- complex logic
- business rules
- temporary workarounds
- TODO items

Comments MUST NOT describe obvious code.

Bad:

// get user id
String userId = user.getId();

---

## Method Comments

Method comments MAY appear above a method when behavior is not obvious.

Example:

// loads dashboard accounts
public AccountListResponseDto getAccounts() {
}

Do NOT repeat the method name.

Bad:

// get accounts
public AccountListResponseDto getAccounts() {
}

---

## Inline Comments

- Inline comments MAY explain non-obvious logic.

Example:

// rate from external API
return amount * rate; 

- Inline comments MUST NOT appear at the end of a line.

Bad:

return amount * rate; // rate from external API

- Inline comments MUST NOT restate the code.

Bad:

// increment i
i++;

---

## Block Comments

Block comments MUST follow this format:

/*
* comment
*/

Decorative ASCII blocks MUST NOT be used.

Forbidden:

/***************
* SECTION
  ***************/

---

## TODO Comments

TODO comments MUST follow this format:

// TODO: description

Example:

// TODO: remove after migration

Vague TODO comments MUST NOT be written.

Forbidden:

// TODO: fix later
---

# 13. Javadoc

Rules:

- Public classes MUST have Javadoc
- Public methods MUST have Javadoc

Javadoc MUST NOT repeat the method name.

Bad:

/**
* Returns user id
  */
  public String getUserId() {}

Tag order MUST follow:

@param
@return
@throws
@deprecated

---

# 14. Static Members

Static members MUST be referenced using the class name.

Example:

Math.max(a, b)

NOT:

max(a, b)

---

# 15. Exceptions

Exceptions MUST NOT be silently ignored.

Ignored exceptions MUST include a comment explaining the reason.

Example:

try {
run();
} catch (IOException e) {
// ignore: file may not exist
}

---

# 16. Finalizers

`Object.finalize()` MUST NOT be used.
