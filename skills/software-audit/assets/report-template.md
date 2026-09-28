# Audit report: <Product name>

<Date> · <Auditor> · Version / commit audited: <sha or deployment>

## Summary

<Two or three sentences: overall state, and whether it's ready for what the owner wants (launch, scale, sale).>

**Fix first**
1. <F-01 in one line, and why>
2. <F-02>
3. <F-03>

## Scope and method

- **In scope:** <repos, URLs, environments, roles>
- **Out of scope:** <what wasn't tested and why>
- **Test accounts:** <roles used; accounts created, to be deleted>
- **How:** repo map, crawl of <N> pages on desktop and phone as <roles>, access matrix (<N> checks), header check, project tests, manual review of <journeys>, database advisors.
- **Limits:** <e.g. production read-only, no load tests, no source for the mobile app>

## Scorecard

| Area | Status | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| UX and journeys | good / needs work / at risk | 0 | 0 | 0 | 0 |
| Visual design | | | | | |
| Accessibility | | | | | |
| Performance | | | | | |
| Business logic | | | | | |
| Access control | | | | | |
| Security | | | | | |
| Operations and data | | | | | |

## Findings

### F-01 [SEVERITY] <Title stating the problem>
**Area:** <area> · **Where:** `<file:line>` / `<URL>` · **Found by:** <tool or manual>

**Impact.** <Who is affected, how, how often.>

**Evidence.** <Steps or request/response, screenshot path, failing test. Redacted.>

**Fix.** <Concrete change; test to add.>

**Status.** Open / Fixed in <commit> / Accepted risk (<reason>)

<repeat>

## What's working

- <Specific strength worth keeping>

## Appendix

- Access matrix: `audit/access/access-matrix.md`
- Crawl: `audit/screens/report.md` (screenshots in the same folder)
- Headers: <output>
- Project checks: typecheck <ok>, lint <ok>, unit <n passed>, E2E <n passed>, dependency audit <summary>
- Tools and versions: <node, playwright, axe-core, browser>
