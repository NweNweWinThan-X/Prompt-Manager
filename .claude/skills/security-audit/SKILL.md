---
name: security-audit
description: Security vulnerability audit skill. Scans a Spring Boot + Thymeleaf project for OWASP vulnerabilities including XSS, CSRF, broken access control, injection, cryptographic failures, insecure deserialization, SSRF, secret management and misconfiguration. Produces a report with risk levels and recommended fixes.
user-invocable: true
argument-hint: [file path or module name (scans the whole project when omitted)]
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Security Audit Skill

## Overview

This skill combines:
- **Vulnerability checks**: XSS (stored), XSS (DOM-based), cookie secure attributes, unauthorised access, leaking personal data, CSRF, clickjacking, anti-automation (login and forms), web components, default server files, character encoding, Content-Type encoding, SQL injection, cryptographic failures, insecure deserialization, SSRF, secret management, input validation strategy, security logging
- Checks specific to **Spring Boot + Thymeleaf + Spring Security + PostgreSQL**

---

## When to use

- When `/security-audit` is run
- When asked for a "security check", "vulnerability audit" or "security audit"
- Before a production release
- After adding a new controller, form or API endpoint

---

## Workflow

1. **Identify the target files**
   - With an argument → scan only the given file or module
   - Without an argument → scan the whole project

2. **Run the security checks in this order:**

```
XSS (stored) → XSS (DOM-based) → cookies / sessions
→ access control → personal data → CSRF → clickjacking
→ anti-automation → web components
→ default files → character encoding → Content-Type → SQL injection
→ cryptographic failures → insecure deserialization → SSRF
→ secret management → input validation strategy → security logging
```

3. **Assign a risk level to each item:**

| Risk | Criteria |
|------|----------|
| 🔴 HIGH | An exploitable vulnerability is present |
| 🟡 MEDIUM | The defence is incomplete or partly missing |
| 🟢 LOW | Properly protected |
| ⚪ N/A | No relevant code found |

4. **Output a report covering every item** — with risk levels and recommended fixes

---

## Security check items

---

### No.1 — XSS (stored)

**Overview:** user input is saved to the database and later rendered as HTML, so the injected script runs in the victim's browser.

**How to check:**

```
STEP 1: Identify the form fields that take user input
  → Grep: @RequestParam, @ModelAttribute, Command/Form/Request classes

STEP 2: Identify the entities those values are saved to
  → Grep: String fields on @Entity classes

STEP 3: Check how the values are rendered in the HTML templates
  → Glob: templates/**/*.html
  → th:utext found → 🔴 HIGH
  → only th:text / th:value → 🟢 LOW

STEP 4: Check input validation
  → @Pattern(regexp = "[^<>]*") missing → 🟡 MEDIUM
```

**Safe vs dangerous:**
```html
<!-- Safe — output is escaped automatically -->
<span th:text="${dto.memo}"></span>

<!-- Dangerous — outputs HTML as-is -->
<span th:utext="${dto.memo}"></span>
```

**Recommended fix:**
```java
// Add to the DTO / Command class
@Pattern(regexp = "[^<>\"'&]*", message = "HTML tags are not allowed")
@Size(max = 20)
private String memo;
```

---

### No.2 — Missing Secure attribute on the session cookie

**Overview:** without the Secure attribute, the session cookie can be stolen over a plaintext HTTP connection.

**How to check:**
```
STEP 1: Check application.properties / application.yml
  → is server.servlet.session.cookie.secure=true set?

STEP 2: Check SecurityConfig.java
  → is there a CookieSameSiteSupplier / SameSite setting?

STEP 3: Check manually created cookies
  → Grep: new Cookie(...), response.addCookie(...)
  → cookie.setSecure(true) missing → 🔴 HIGH
```

**Recommended fix:**
```properties
# application.properties
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=Lax
```

---

### No.3 — Confidential data accessible to unauthorised users

**Overview:** a user without the right permissions can view data they should not reach (broken access control).

**How to check:**
```
STEP 1: Check the authorisation annotations on the controllers
  → Grep: @PreAuthorize, @Secured, hasRole(...)

STEP 2: Check the Spring Security configuration
  → requestMatchers / antMatchers in SecurityConfig

STEP 3: Check that the service layer verifies the user id
  → Grep: findById, getById
  → confirm the id belongs to the authenticated user (horizontal privilege escalation)
```

**Recommended fix:**
```java
// Controller
@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
@GetMapping("/deposit/detail/{id}")
public String detail(@PathVariable Long id, Authentication auth) {
    depositService.findByIdAndUser(id, auth.getName());
}

// Service — verify ownership
public DepositDto findByIdAndUser(Long id, String username) {
    return repository.findByIdAndUsername(id, username)
        .orElseThrow(() -> new Gs8Exception(Gs8ErrorCode.ACCESS_DENIED));
}
```

---

### No.4 — Unnecessary personal data in output

**Overview:** responses or logs contain personal data (email, phone, address) that is not needed.

**How to check:**
```
STEP 1: Check the API response DTOs
  → Grep: Dto.java, @JsonProperty
  → is @JsonIgnore missing on fields that are not needed?

STEP 2: Check the log output
  → Grep: log.info, log.debug, logger.info
  → is personal data (name, email, address) being logged?

STEP 3: Check the Thymeleaf templates
  → are confidential fields exposed in hidden form fields?
```

**Recommended fix:**
```java
// Include only the fields the view needs — leave out email, phone and address
public record UserDto(
    Long id,
    String displayName
) {}

// Logging — use the id only, never include personal data
log.info("User login: userId={}", userId);
```

---

### No.5 — XSS (DOM-based)

**Overview:** JavaScript reads from a URL parameter or `location.hash` and writes it straight into the DOM without sanitising it.

**How to check:**
```
STEP 1: Check the JavaScript files
  → Glob: src/main/resources/static/**/*.js
  → Glob: src/main/js/**/*.js (React)

STEP 2: Search for dangerous patterns
  → Grep: innerHTML, outerHTML, document.write, eval(...)
  → Grep: location.href, location.hash, location.search used in a DOM write

STEP 3: Check Thymeleaf inline JavaScript
  → Grep: th:inline="javascript"
  → use of [[${...}]] (Thymeleaf escapes automatically — safe)
```

**Safe vs dangerous:**
```javascript
// Dangerous
document.getElementById('name').innerHTML = location.hash.substring(1);

// Safe
document.getElementById('name').textContent = location.hash.substring(1);
```

---

### No.6 — Unnecessary access to local resources

**Overview:** path traversal or a misconfigured static resource handler exposes non-public files.

**How to check:**
```
STEP 1: Check the file access code
  → Grep: new File(...), Paths.get(...), FileInputStream(...)
  → is user input used in the file path?

STEP 2: Check the static resource configuration
  → the scope of resources().permitAll() in SecurityConfig
  → the contents of src/main/resources/static/

STEP 3: Check the management endpoints
  → Grep: management.endpoints.web.exposure
  → are confidential endpoints exposed?
```

---

### No.7 — Missing CSRF protection

**Overview:** a logged-in user can be made to send a request they did not intend.

**How to check:**
```
STEP 1: Check the Spring Security CSRF configuration
  → Grep: csrf().disable() or csrf(csrf -> csrf.disable())
  → disabled → 🔴 HIGH

STEP 2: Check the CSRF tokens on the forms
  → Glob: templates/**/*.html
  → Grep: _csrf, th:action
  → with Thymeleaf alone, the CSRF token is included in th:action automatically

STEP 3: Check the scope of the CSRF exclusions
  → are the exclusions kept to the minimum necessary?
```

**Recommended fix:**
```java
// SecurityConfig — keep CSRF enabled
http.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/webhook/**") // exclude only where necessary
);
```

```html
<!-- Thymeleaf: th:action includes the CSRF token automatically -->
<form th:action="@{/deposit/memo}" method="post">
```

---

### No.8 — Clickjacking protection headers not set

**Overview:** the page can be embedded in an iframe and the user tricked into actions they did not intend.

**How to check:**
```
STEP 1: Check the security headers in SecurityConfig
  → Grep: frameOptions, X-Frame-Options, ContentSecurityPolicy

STEP 2: Check the response headers
  → is X-Frame-Options: DENY or SAMEORIGIN set?
  → does the Content-Security-Policy include frame-ancestors?
```

**Recommended fix:**
```java
// SecurityConfig
http.headers(headers -> headers
    .frameOptions(frame -> frame.deny())
    .contentSecurityPolicy(csp -> csp
        .policyDirectives("default-src 'self'; frame-ancestors 'none';")
    )
);
```

---

### No.9 — No anti-automation on the login URL

**Overview:** with no rate limiting or account lockout, the login endpoint can be brute-forced.

**How to check:**
```
STEP 1: Check for rate limiting on the login endpoint
  → Grep: RateLimiter, Bucket4j, @RateLimited

STEP 2: Check for account lockout
  → Grep: lockoutPolicy, failedAttempts, UserDetailsService

STEP 3: Check for CAPTCHA
  → Grep: captcha, recaptcha, hcaptcha
```

**Recommended fix:**
```java
// Track failed attempts and lock the account once the threshold is passed
@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    // Lock the account after 5 failures
}
```

---

### No.10 — No anti-automation on form submission

**Overview:** registration and application forms can be abused by automated bots.

**How to check:**
```
STEP 1: Check the registration and application forms
  → Glob: templates/register/**/*.html
  → is there a CAPTCHA or a submission rate limit?

STEP 2: Check for rate limiting on the backend
  → Grep: RateLimiter, @RateLimited, throttle

STEP 3: Check for honeypot fields
  → is there a hidden field for bot detection?
```

---

### No.11 — Web components without proper security settings

**Overview:** old or vulnerable libraries expose known CVEs.

**How to check:**
```
STEP 1: Check the backend dependencies
  → Read: pom.xml or build.gradle
  → are there outdated library versions?

STEP 2: Check the frontend dependencies
  → Read: package.json
  → the equivalent of npm audit / yarn audit

STEP 3: Check the Spring Boot version
  → are there known CVEs for the version in use?
```

**Recommended fix:**
```xml
<!-- pom.xml — manage versions explicitly and keep them current -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version><!-- use the latest stable version --></version>
</parent>
```

---

### No.12 — Default server files not disabled

**Overview:** default error pages and server information headers leak implementation details to an attacker.

**How to check:**
```
STEP 1: Check the error page configuration
  → Grep: ErrorController, /error, whitelabel
  → is there a custom error page?

STEP 2: Check what server information is exposed
  → Grep: server.error.include-stacktrace
  → is server.error.include-message=never set?

STEP 3: Check which Actuator endpoints are exposed
  → Grep: management.endpoints.web.exposure.include
  → is only the health endpoint exposed?
```

**Recommended fix:**
```properties
# application.properties
server.error.include-stacktrace=never
server.error.include-message=never
server.error.include-exception=false
management.endpoints.web.exposure.include=health
```

---

### No.13 — Text responses with no character encoding declared

**Overview:** a response with no charset makes the browser guess the encoding, which can be abused for XSS.

**How to check:**
```
STEP 1: Check the @ResponseBody methods on the controllers
  → Grep: @ResponseBody, ResponseEntity
  → is charset=UTF-8 missing from produces = "text/plain"?

STEP 2: Check the produces attribute on the request mappings
  → Grep: produces = "text/
  → is there a "text/html" or "text/plain" without a charset?
```

**Recommended fix:**
```java
// Bad
@GetMapping(value = "/export", produces = "text/plain")

// Good
@GetMapping(value = "/export", produces = "text/plain;charset=UTF-8")
```

---

### No.14 — Missing character encoding on Content-Type

**Overview:** a Content-Type header with no charset opens the door to encoding-based XSS attacks.

**How to check:**
```
STEP 1: Check the default encoding configuration
  → Grep: CharacterEncodingFilter, spring.http.encoding
  → is server.servlet.encoding.charset=UTF-8 set in application.properties?

STEP 2: Check manually set Content-Type headers
  → Grep: response.setContentType(...)
  → is charset=UTF-8 included?

STEP 3: Check the Thymeleaf encoding configuration
  → is spring.thymeleaf.encoding=UTF-8 set?
```

**Recommended fix:**
```properties
# application.properties
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true
spring.thymeleaf.encoding=UTF-8
```

---

### No.15 — SQL injection (OWASP A03)

**Overview:** user input is embedded directly into a SQL query, letting an attacker manipulate the database.

**How to check:**
```
STEP 1: Check the native queries
  → Grep: nativeQuery = true, @Query
  → query built by string concatenation → 🔴 HIGH

STEP 2: Check the JPQL queries
  → Grep: createQuery, EntityManager
  → is named parameter binding used?
```

**Recommended fix:**
```java
// Bad — SQL injection vulnerability
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// Good — parameter binding
@Query("SELECT u FROM User u WHERE u.name = :name")
List<User> findByName(@Param("name") String name);
```

---

### No.16 — Cryptographic failures (OWASP A02)

**Overview:** weak or missing cryptography exposes confidential data — passwords stored with a weak hash, hardcoded secrets, plaintext HTTP transmission and the like.

**How to check:**
```
STEP 1: Check the password hashing
  → Grep: PasswordEncoder, BCrypt, Argon2
  → MD5, SHA1 or unsalted SHA256 found → 🔴 HIGH
  → BCryptPasswordEncoder with strength < 10 → 🟡 MEDIUM

STEP 2: Check for hardcoded secrets
  → Grep: password=, secret=, apiKey=, token= (in .java / .properties files)
  → literal credentials in the source → 🔴 HIGH

STEP 3: Check that HTTPS is enforced
  → Grep: requiresSecure, http.requiresChannel
  → is HTTP traffic redirected to HTTPS?
```

**Recommended fix:**
```java
// Good — BCrypt at strength 12
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}

// Bad — never use MD5 or plain SHA
MessageDigest.getInstance("MD5").digest(password.getBytes());
```

```properties
# application.properties — do not keep secrets in files under source control
# Use environment variables or a secret management tool
spring.datasource.password=${DB_PASSWORD}
```

---

### No.17 — Insecure deserialization (OWASP A08)

**Overview:** deserializing untrusted data opens the door to remote code execution and object injection attacks.

**How to check:**
```
STEP 1: Check for Java native serialization
  → Grep: ObjectInputStream, readObject(), Serializable
  → used with external input → 🔴 HIGH

STEP 2: Check the Jackson configuration
  → Grep: ObjectMapper, enableDefaultTyping, @JsonTypeInfo
  → enableDefaultTyping() without a type allow-list → 🔴 HIGH

STEP 3: Check the deserialization of external data
  → Grep: @RequestBody, readValue(
  → are the types strictly controlled?
```

**Recommended fix:**
```java
// Bad — vulnerable to polymorphic type attacks
objectMapper.enableDefaultTyping();

// Good — use explicit type binding only
objectMapper.activateDefaultTyping(
    LaissezFaireSubTypeValidator.instance,
    ObjectMapper.DefaultTyping.NON_FINAL,
    JsonTypeInfo.As.PROPERTY
);

// Best — avoid Java serialization entirely and use JSON/DTO mapping
```

---

### No.18 — SSRF — server-side request forgery (OWASP A10)

**Overview:** the server fetches a URL supplied by the user, letting an attacker reach internal services or cloud metadata endpoints.

**How to check:**
```
STEP 1: Check external HTTP calls that use a user-supplied URL
  → Grep: RestTemplate, WebClient, HttpURLConnection, URL(
  → does the URL value come from @RequestParam, @RequestBody or the database?

STEP 2: Check for URL allow-list validation
  → Grep: allowedHosts, allowedDomains, URI.getHost()
  → no allow-list → 🔴 HIGH

STEP 3: Check for internal IP blocking
  → are 127.0.0.1, 169.254.169.254 (cloud metadata), 10.x and 192.168.x reachable?
```

**Recommended fix:**
```java
// Validate the URL against an allow-list before making the request
private static final List<String> ALLOWED_HOSTS = List.of("api.example.com", "cdn.example.com");

public void validateUrl(String url) {
    URI uri = URI.create(url);
    if (!ALLOWED_HOSTS.contains(uri.getHost())) {
        throw new Gs8Exception(Gs8ErrorCode.INVALID_REQUEST);
    }
}
```

---

### No.19 — Secret management

**Overview:** API keys, passwords and tokens committed to source control or embedded in configuration files can leak to anyone with access to the repository.

**How to check:**
```
STEP 1: Check application.properties / application.yml
  → Grep: password=, secret=, key=, token=
  → literal credential values (not a ${ENV_VAR} reference) → 🔴 HIGH

STEP 2: Check .gitignore
  → are application-prod.properties, .env, *.jks and *.p12 excluded?

STEP 3: Check the Java source files for secrets
  → Grep: private static final String.*KEY =
  → Grep: private static final String.*SECRET =
  → hardcoded literal values → 🔴 HIGH

STEP 4: Check the use of environment variables
  → is a ${...} placeholder used for every credential?
```

**Recommended fix:**
```properties
# Good — reference environment variables
spring.datasource.password=${DB_PASSWORD}
cloud.api.secret=${CLOUD_API_SECRET}
```

```
# .gitignore — always exclude
application-prod.properties
application-local.properties
.env
*.jks
*.p12
```

---

### No.20 — Input validation strategy (allow-list vs block-list)

**Overview:** block-list validation (blocking known-bad patterns) is easy to get around. Allow-list validation (permitting only known-good patterns) is the correct approach.

**How to check:**
```
STEP 1: Check the bean validation annotations on the DTO / Command classes
  → Grep: @Pattern, @Size, @NotBlank, @Email
  → a block-list regex (e.g. [^<>]) → 🟡 MEDIUM
  → an allow-list regex (e.g. [a-zA-Z0-9]) → 🟢 LOW
  → no validation at all → 🔴 HIGH

STEP 2: Check the custom validators
  → Grep: implements ConstraintValidator
  → is the logic allow-list based?

STEP 3: Check the controller entry points
  → Grep: @Valid, @Validated on @RequestBody / @ModelAttribute
  → @Valid missing → 🔴 HIGH
```

**Safe vs dangerous:**
```java
// Block-list — discouraged, because it can be bypassed
@Pattern(regexp = "[^<>\"']*")

// Allow-list — recommended, because only safe characters are permitted
@Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.,@]+$", message = "Contains characters that are not allowed")
@Size(max = 100)
private String companyName;
```

```java
// Always trigger validation at the controller boundary
@PostMapping("/apply")
public String apply(@Valid @ModelAttribute ApplicationCommand cmd, BindingResult result) { }
```

---

### No.21 — Security logging

**Overview:** missing or incomplete logging of security events makes it impossible to detect attacks or investigate incidents. Logging personal data or credentials creates a data leak risk of its own.

**How to check:**
```
STEP 1: Check that authentication events are logged
  → Grep: AuthenticationSuccessHandler, AuthenticationFailureHandler
  → are login successes and failures logged with a userId and a timestamp?

STEP 2: Check that authorisation failures are logged
  → Grep: AccessDeniedException, @ControllerAdvice
  → are 403 responses logged with a userId and the request path?

STEP 3: Check for PII / credential leakage into the logs
  → Grep: log.info, log.debug, log.error
  → email, password, phone, address or token in a log string → 🔴 HIGH

STEP 4: Check the log level configuration
  → Grep: logging.level in application.properties
  → DEBUG level enabled in production → 🟡 MEDIUM
```

**Recommended fix:**
```java
// Good — log security events with the id only
log.warn("Login failed: userId={}, ip={}", userId, clientIp);
log.info("Access denied: userId={}, path={}", userId, requestPath);

// Bad — never log personal data or credentials
log.info("Login attempt: email={}, password={}", email, password); // 🔴
```

```properties
# application-prod.properties
logging.level.root=WARN
logging.level.com.example.security=INFO
```

---

## Report output format

After the scan, output a report in this format:

```
## Security audit report
Date: YYYY-MM-DD
Scope: [file name or "whole project"]

| No. | Vulnerability | Risk | File | Details |
|-----|---------------|------|------|---------|
| 1   | XSS (stored)              | 🟢 LOW    | templates/deposit/...  | Uses th:text — safe |
| 2   | Cookie secure attribute   | 🟡 MEDIUM | application.properties | secure=true not set |
| 3   | Unauthorised access       | 🟢 LOW    | SecurityConfig.java    | @PreAuthorize is in place |
| 4   | Unnecessary personal data | ...       | ...                    | ... |
| 5   | XSS (DOM-based)           | ...       | ...                    | ... |
| 6   | Local resource exposure   | ...       | ...                    | ... |
| 7   | CSRF protection           | ...       | ...                    | ... |
| 8   | Clickjacking              | ...       | ...                    | ... |
| 9   | Login anti-automation     | ...       | ...                    | ... |
| 10  | Form anti-automation      | ...       | ...                    | ... |
| 11  | Web components            | ...       | ...                    | ... |
| 12  | Default server files      | ...       | ...                    | ... |
| 13  | Character encoding        | ...       | ...                    | ... |
| 14  | Content-Type encoding     | ...       | ...                    | ... |
| 15  | SQL injection             | ...       | ...                    | ... |
| 16  | Cryptographic failures    | ...       | ...                    | ... |
| 17  | Insecure deserialization  | ...       | ...                    | ... |
| 18  | SSRF                      | ...       | ...                    | ... |
| 19  | Secret management         | ...       | ...                    | ... |
| 20  | Input validation strategy | ...       | ...                    | ... |
| 21  | Security logging          | ...       | ...                    | ... |

## Recommended fixes
List the 🔴 HIGH items in priority order, with code examples.
```

---

## Project-specific checkpoints

| Layer | What to check |
|-------|---------------|
| **Thymeleaf** | No `th:utext`; `th:action` includes the CSRF token automatically |
| **Spring Security** | No `csrf().disable()`; `frameOptions` configured; BCrypt strength ≥ 12 |
| **Spring Data JPA** | Native queries use named parameter binding; no string concatenation in JPQL |
| **application.properties** | Encoding, error, cookie and Actuator settings; no hardcoded credentials |
| **React (Vite)** | No `dangerouslySetInnerHTML`; no raw `innerHTML` writes |
| **Bean validation** | `@Pattern` (allow-list), `@Size` and `@Valid` applied at every user input entry point |
| **ObjectMapper / Jackson** | No `enableDefaultTyping()`; explicit type binding only |
| **External HTTP calls** | A URL allow-list is applied; no user-controlled URL passed to RestTemplate/WebClient |
| **Secrets** | Every credential goes through `${ENV_VAR}`; confidential files are in `.gitignore` |
| **Logging** | Authentication and authorisation events are logged; zero PII or credentials in log strings |
