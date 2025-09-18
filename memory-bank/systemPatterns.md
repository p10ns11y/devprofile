# System Architecture Patterns - DEVPROFILE

## Core Architectural Patterns

### App Router Architecture
```
/
├── app/                    # Next.js 15 App Router directory
│   ├── layout.tsx         # Root layout with metadata & providers
│   ├── page.tsx           # Homepage with component orchestration
│   ├── api/               # API routes directory
│   │   ├── cv/           # CV-related API endpoints
│   │   ├── content-hub/  # Content management endpoints
│   │   └── [...]/        # Dynamic API routes
│   ├── (routes)/         # Route groups for organization
│   └── globals.css       # Global styles with Tailwind
```

### Component Architecture Patterns

#### 1. Atomic Design Principle
- **Atoms**: Basic UI components (Button, Input, Icon)
- **Molecules**: Composite components (Card, FormField, Navigation)
- **Organisms**: Complex sections (Header, Hero, ContactForm)
- **Templates**: Page layouts combining organisms
- **Pages**: Route-specific implementations

#### 2. Component-Co-Location Pattern
```
src/components/
├── ui/           # Reusable UI primitives (shadcn/ui)
├── [feature]/    # Feature-specific components
└── shared/       # Cross-cutting concerns
```

### State Management Patterns

#### Server State Management
- **Server Actions**: Next.js 15 server mutations for data operations
- **API Routes**: RESTful endpoints for external data fetching
- **Feature Flags**: Runtime configuration without redeploy

#### Client State Management
- **React Hooks**: Local component state with useState/useEffect
- **Context API**: Shared state across component tree
- **URL State**: Query parameters for bookmarkable state

### Data Flow Patterns

#### 1. Server-to-Client Data Flow
```
Server Action → Database/API → Server Component → Client Hydration
                    ↓
                Static Generation
```

#### 2. Client-to-Server Data Flow
```
User Input → Form Validation → Server Action → Data Processing → Response
```

#### 3. PDF Generation Flow
```
User Request → Server Action → @react-pdf/renderer → Static File → Download
```

### Error Handling Patterns

#### 1. Client-Side Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
</ErrorBoundary>
```

#### 2. Server Error Handling
- Try-catch blocks in Server Actions
- Proper error responses with status codes
- Graceful degradation for failed operations

#### 3. API Error Patterns
```typescript
try {
  const result = await serverAction()
  return { success: true, data: result }
} catch (error) {
  return { success: false, error: error.message }
}
```

### Performance Optimization Patterns

#### 1. Code Splitting Patterns
- **Dynamic Imports**: `React.lazy()` for route-based splitting
- **Component Lazy Loading**: Heavy components loaded on demand
- **Bundle Analysis**: Size monitoring with build tools

#### 2. Image Optimization
- **Next.js Image Optimization**: Automatic format conversion and sizing
- **Responsive Images**: Tailwind responsive utilities
- **Preloading**: Critical images preloaded for LCP

#### 3. Caching Strategies
- **Static Generation**: ISR for frequently changing content
- **Client Cache**: browser caching for assets
- **Server Cache**: Redis/memory for API responses

### Accessibility Patterns (WCAG AA)

#### 1. Semantic HTML Structure
```typescript
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li><a href="#main" aria-label="Skip to main content">Skip to content</a></li>
    </ul>
  </nav>
</header>

<main id="main">
  {/* Primary content */}
</main>
```

#### 2. Keyboard Navigation
- Tab order management (tabindex)
- Focus management (focus-visible)
- Keyboard event handlers
- Screen reader announcements

#### 3. ARIA Patterns
- Proper ARIA labels and descriptions
- Live regions for dynamic content
- Error announcements for forms
- Status updates for user actions

### Testing Patterns

#### E2E Testing Strategy
```typescript
// Playwright patterns
test('complete user journey', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="cv-download"]');
  await expect(page).toHaveURL(/.*cv\.pdf$/);
});
```

#### Component Testing
```typescript
// Testing Library patterns
test('renders with correct props', () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
});
```

### Deployment Patterns

#### Platform-Specific Configurations
- **Vercel**: Edge functions and analytics integration
- **Netlify**: ISR and form handling
- **AWS**: Lambda functions and CloudFront
- **Self-hosted**: Docker containers and Nginx

#### CI/CD Pipeline
```yaml
# Build pipeline pattern
- Lint → Type Check → Build → Test → Deploy
- PDF Pre-generation during build
- Environment-specific configurations
- Rollback strategies for failures
```

### Security Patterns

#### 1. Input Validation
- Server-side validation for all inputs
- Sanitization of user-generated content
- SQL injection prevention with parameterized queries

#### 2. Authentication & Authorization
- JWT tokens for API authentication
- Role-based access control
- Secure session management

#### 3. Content Security Policy
```typescript
// CSP headers pattern
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

### Development Workflow Patterns

#### Git Workflow
```
main (production) ← dev (integration) ← feature/* (development)
                       ↓
                 release/* (staging)
                       ↓
                    hotfix/* (emergency)
```

#### Code Review Standards
- Automated linting and type checking
- Manual review for business logic
- Automated testing before merge
- Performance regression checks

This system architecture ensures maintainability, scalability, and alignment with modern web development best practices while providing a solid foundation for future enhancements.
