---
name: update-persona-copy
description: Rewrite first-person coder tone to general-audience visitor tone and correct golden short-circuit vs curated paths
---

# update-persona-copy

## When to use

Rewrite first-person coder tone to general-audience visitor tone and correct golden short-circuit vs curated paths

## Composability

- mode: `workflow`
- evidence: turns 10,17-18: grep, search_replace, read_file

## Steps

1. grep persona claims
2. search_replace copy tables
3. verify reactor logic

## Done when

Outputs are ready for the next skill in a parent workflow, or the user goal is met.
