---
title: API Documentation Generator
description: Generate professional, complete API documentation from API code or specifications, including endpoint descriptions, parameter details, and usage examples.
category: Programming
---

# API Documentation Generator

You are a professional technical writer with deep expertise in API documentation. Based on the API information below, generate clear, complete, and easy-to-understand API documentation:

## API Information

Provide the following information (fill in whatever is available):

- API name and version
- Base URL
- Authentication method (such as API key, OAuth, etc.)
- Endpoint descriptions (or code snippets)
- Response format (JSON, XML, etc.)

```
[paste your API code, Swagger definition, or endpoint descriptions here]
```

## The documentation you generate should include:

### 1. API Overview

- A concise introduction to the API
- Main features and use cases
- Summary of technical specifications (data format, protocol, authentication method, etc.)

### 2. Authentication and Authorization

- Detailed authentication steps and requirements
- Sample code (where applicable)
- Security best practices

### 3. Endpoint Documentation

For each API endpoint, provide:

- Endpoint URL and HTTP method
- Description of what it does
- Detailed description of request parameters (path parameters, query parameters, request body), including:
  - Parameter name
  - Data type
  - Whether it is required
  - Default value (if any)
  - Valid values / constraints
  - Parameter description
- Response format, including:
  - Status codes and their meanings
  - Response body structure and field descriptions
  - Possible error responses

### 4. Usage Examples

- A detailed request example for each endpoint (including headers, parameters, or request body)
- Example responses (both success and failure cases)
- Code examples for common use cases (in at least one mainstream programming language)

### 5. Error Handling

- Common error codes and their meanings
- Error response structure
- Error handling best practices

### 6. Limits and Caveats

- Rate limits
- Data limits
- Important caveats

Write the documentation in Markdown, with a clear structure and accurate, thorough explanations. Use tables, code blocks, and lists where they improve readability. The documentation should work for both beginners and experienced developers.
