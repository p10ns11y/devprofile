# Technical Context - DEVPROFILE

## Core Technology Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router architecture
  - Server-Side Rendering (SSR) for optimal SEO
  - Server Actions for secure data mutations
  - Client-side navigation with optimized routing
- **React 19**: Latest React with concurrent features
  - Server Components for server-side rendering
  - Client Components for interactive features
  - Suspense for loading states and error boundaries

### Programming Language
- **TypeScript**: Strict mode enforced across all files
  - 100% type coverage requirement
  - Comprehensive interfaces for component props and data structures
  - Utility types for complex type transformations

### Styling Architecture
- **Tailwind CSS**: Utility-first CSS framework
  - JIT compilation for optimized build size
  - Custom design system through configuration
  - Responsive design utilities built-in
- **Theme System**: OKLCH color space with Material Design tokens
  - Light and Dim theme variants with high contrast ratios
  - Perceptually uniform colors for better accessibility
  - CSS custom properties for consistent theming
- **PostCSS**: CSS processing pipeline
  - Autoprefixer for browser compatibility
  - CSS modules for scoped styling
- **shadcn/ui**: High-quality component library
  - Radix UI primitives for accessibility
  - Consistent design language
  - Theme customization capabilities

### PDF Generation & Document Handling
- **@react-pdf/renderer**: React-based PDF generation
  - Server-side PDF creation with professional styling
  - Dynamic content rendering
  - Cross-platform compatibility challenges resolved
- **react-pdf**: PDF viewer for browser integration
  - Interactive document display
  - Zoom and navigation controls
  - Error handling for unsupported formats

### Development Tooling
- **ESLint**: Code linting with strict rules
  - TypeScript-aware linting
  - Consistent code formatting enforcement
  - Custom rule implementation for project standards
- **Bun**: Fast JavaScript runtime for development
  - Package management (preferred over npm)
  - Script execution and build processes
  - Performance optimization for development workflow

### Testing Infrastructure
- **Playwright**: End-to-end testing framework
  - Cross-browser compatibility testing
  - Visual regression testing capabilities
  - CI/CD integration ready

## Development Environment Setup

### Local Development
- **Node.js 18+**: Minimum version requirement
- **Package Managers**: Bun (primary) or npm
- **Git**: Version control with standardized workflow
- **VS Code**: Preferred IDE with TypeScript integration

### Build Configuration
- **next.config.mjs**: Next.js configuration in ES modules format
- **postcss.config.mjs**: CSS processing configuration
- **tailwind.config.ts**: Tailwind CSS customization
- **tsconfig.json**: TypeScript strict configuration

## Technical Constraints & Requirements

### Performance Constraints
- **Build Time**: Target under 5 seconds for development efficiency
- **Bundle Size**: Optimized ESM imports and tree-shaking
- **Core Web Vitals**: 90+ scores required for production
- **Loading Performance**: Server-side rendering prioritized

### Compatibility Requirements
- **Browser Support**: Modern browsers with ES modules support
- **Device Support**: Mobile-first responsive design
- **Platform Support**: Vercel, Netlify, AWS Amplify deployment
- **API Compatibility**: Cross-platform server action URLs

### Security Considerations
- **Server Actions**: Secure data mutations with proper validation
- **API Routes**: Proper error handling and input sanitization
- **Environment Variables**: Sensitive configuration management
- **Content Security Policy**: XSS prevention measures

## Dependencies Architecture

### Core Dependencies
- **React & Next.js Ecosystem**: Framework and routing dependencies
- **TypeScript**: Type-checking and development experience
- **Tailwind & UI Libraries**: Styling and component ecosystem
- **PDF Libraries**: Document generation and viewing capabilities

### Development Dependencies
- **ESLint + TypeScript ESLint**: Code quality enforcement
- **PostCSS Plugins**: CSS processing utilities
- **Build Tools**: Optimization and bundling utilities
- **Testing Framework**: E2E testing capabilities

## Tool Usage Patterns

### Development Workflow
1. **Code Quality**: ESLint + TypeScript for static analysis
2. **Styling**: Tailwind utility classes with design system
3. **Component Development**: shadcn/ui for consistent UI patterns
4. **State Management**: React hooks with Server Actions for mutations

### Build Process
1. **Linting**: Pre-build ESLint execution
2. **Type Checking**: Strict TypeScript compilation
3. **Optimization**: PostCSS processing and minification
4. **PDF Generation**: Runtime CV PDF creation
5. **Deployment**: Platform-specific optimizations

### Testing Strategy
- **E2E Testing**: Playwright for critical user journeys
- **Visual Testing**: Screenshot comparisons for UI consistency
- **Performance Testing**: Lighthouse integration for metrics
- **Accessibility Testing**: Automated axe-core compliance checks

## Infrastructure Constraints

### Deployment Environment
- **Vercel (Primary)**: Optimized for Next.js with edge functions
- **Netlify**: ISR and edge function capabilities
- **AWS Amplify**: Serverless deployment with CI/CD
- **Self-hosted**: Docker containerization readiness

### Resource Optimization
- **Image Optimization**: Next.js built-in image optimization
- **Font Loading**: Performance-optimized web fonts
- **Caching Strategy**: Appropriate cache headers and strategies
- **CDN Integration**: Global content delivery optimization

## Maintenance Patterns

### Code Organization
- **Route-based Architecture**: App Router directory structure
- **Component Colocation**: Components with related logic
- **Shared Libraries**: Reusable utilities and hooks
- **Configuration as Code**: TypeScript-based configuration files

### Version Control Strategy
- **Branching Model**: Feature branches with main/dev protected branches
- **Commit Standards**: Semantic commit messages
- **Release Process**: Semantic versioning with changelogs
- **Documentation**: In-code documentation with TypeScript interfaces

This technical context ensures consistent development practices, maintainable architecture, and scalable deployment across multiple platforms while demonstrating modern web development excellence.
