# Caching Strategy Plan for CV-Related Paths

## Overview
The user has inquired about when and where "stale while revalidate" caching is appropriate, and how to handle cache bursting for older cached content from previous versions. This plan outlines the analysis and recommendations for implementing appropriate caching strategies for CV-related endpoints and static files.

## Stale-While-Revalidate (SWR) Analysis

### When SWR is Appropriate
Stale-while-revalidate is suitable for:
- **Dynamic content that updates periodically**: CV data may change occasionally but can serve slightly stale versions
- **High-traffic endpoints**: Reduces server load by serving cached responses
- **Non-critical freshness**: CV information doesn't require real-time accuracy
- **Expensive computations**: PDF generation is resource-intensive

### When SWR is NOT Appropriate
- **Sensitive personal data**: CV contains personal information that should be current
- **Frequently changing content**: If CV updates are frequent
- **Legal/compliance requirements**: May require always-fresh data

## Current State
All CV-related paths currently use `Cache-Control: no-store` to prevent any caching.

## Recommended Strategy

### For CV Data API (`/api/cv`, `/api/cv/data`)
- Use SWR with short max-age and longer stale-while-revalidate
- Example: `Cache-Control: max-age=300, stale-while-revalidate=3600`
- This allows 5-minute cache serving, then stale serving for 1 hour while revalidating

### For PDF Generation/Download APIs (`/api/cv/generate`, `/api/cv/download`, `/api/cv/view`)
- Use SWR with moderate cache times
- Example: `Cache-Control: max-age=600, stale-while-revalidate=7200`
- Balances performance with freshness for expensive operations

### For Static CV PDF (`/cv.pdf`)
- Use SWR with version-based cache bursting
- Implement ETags or Last-Modified headers for cache validation

### For QA API (`/api/cv/qa`)
- Keep no-cache since responses are dynamic and personalized

## Cache Bursting Implementation

### Version-Based Cache Keys
1. **Data Versioning**: Include a version hash in cache keys based on CV data content
2. **ETags**: Implement ETag headers using SHA-256 hash of CV data
3. **Last-Modified**: Use file modification time or data update timestamp

### Implementation Steps
1. Generate content hash for CV data
2. Set ETag headers in API responses
3. Handle If-None-Match requests to return 304 Not Modified
4. For static files, use Next.js's built-in hashing or custom headers

### Cache Invalidation
- **Manual**: Update version numbers when CV content changes
- **Automatic**: Use webhooks or build processes to invalidate caches
- **CDN**: If using Vercel/CDN, implement cache purging strategies

## Implementation Plan

### Phase 1: Data API Caching
- Modify `/api/cv/route.ts` and `/api/cv/data/route.ts`
- Add ETag generation based on JSON content hash
- Set SWR headers

### Phase 2: PDF API Caching
- Update PDF generation and serving routes
- Implement conditional requests with ETags
- Set appropriate SWR directives

### Phase 3: Static File Caching
- Configure Next.js headers for `/cv.pdf`
- Implement cache bursting via query parameters or ETags

### Phase 4: Cache Management
- Add cache invalidation utilities
- Implement cache versioning system
- Add monitoring for cache hit rates

## Benefits
- Improved performance and reduced server load
- Better user experience with faster responses
- Controlled freshness with automatic revalidation
- Proper cache invalidation prevents stale data issues

## Risks and Mitigations
- **Stale data serving**: Mitigated by short max-age and proper invalidation
- **Cache poisoning**: Use strong ETags and validation
- **Complexity**: Start with simple SWR, add advanced features incrementally

## Next Steps
1. Review current caching requirements with stakeholders
2. Implement basic SWR for data APIs
3. Add ETag support for cache bursting
4. Monitor and adjust cache durations based on usage patterns