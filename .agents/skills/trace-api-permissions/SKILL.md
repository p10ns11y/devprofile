---
name: trace-api-permissions
description: Use grep + web_fetch + read_file to map endpoint ACLs and key scopes when 403 appears on /documents/search
---

# trace-api-permissions

## When to use

Use grep + web_fetch + read_file to map endpoint ACLs and key scopes when 403 appears on /documents/search

## Composability

- mode: `workflow`
- evidence: turns 4-5: grep, memory_search, read_file, web_fetch, run_terminal_command

## Steps

1. grep for endpoint usage
2. web_fetch xAI docs
3. compare key scopes in .envrc

## Done when

Outputs are ready for the next skill in a parent workflow, or the user goal is met.
