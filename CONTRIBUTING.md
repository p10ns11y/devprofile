# Contributing to DevProfile

Thank you for your interest in contributing to Peramanathan Sathyamoorthy's portfolio project! This document provides guidelines for contributing to this project.

## 🤝 How to Contribute

1. **Fork the repository**
2. **Create a feature branch** from `dev` branch (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 🌳 Branching Workflow

We follow a structured Git branching strategy to maintain code quality and enable smooth development workflows:

### Branch Types

- **`main`**: Production-ready code, deployed to production
- **`dev`**: Integration branch, synced with `main` after every release or hotfix
- **`canary`**: Experimental branch for early production testing with limited users
- **`feature/*`**: Short-lived branches for developing new features (created from `dev`)
- **`release/*`**: Prepares a specific version for production (branched from `dev`)
- **`hotfix/*`**: Urgent fixes for production issues (branched from `main`, synced to `dev`)

### Branching Guidelines

- Always create `feature/*`, `release/*`, and `canary` branches from the latest `dev`
- Use descriptive branch names (e.g., `feature/ai-chat-enhancement`, `hotfix/pdf-generation-bug`)
- Keep branches short-lived and focused on single features or fixes
- Delete branches after successful merge

### Sync Process

After `main` updates, sync your branches:
```bash
git checkout main
git pull --rebase
git checkout dev
git rebase main
git push origin dev
```

## 📋 Development Guidelines

### Code Quality
- Follow TypeScript strict mode practices
- Use kebab-case for component and file naming
- Ensure proper error boundaries and error handling
- Write clear, descriptive commit messages
- Add appropriate TypeScript types and interfaces

### Testing
- Write E2E tests for new features using Playwright
- Ensure all tests pass before submitting PR
- Test on multiple browsers and devices

### Feature Flags
- Use the feature flag system in `src/config/feature-flags.ts` for new features
- Add development disclaimers for features under development
- Communicate feature status clearly to users

## 🔧 Development Setup

1. **Clone and setup** (see README.md)
2. **Create feature branch** from `dev`
3. **Make changes** following the guidelines above
4. **Test thoroughly** - build, lint, and run tests
5. **Submit PR** with clear description of changes

## 📞 Support

For questions or issues:
- Review existing code and documentation
- Check `src/guidelines/` for additional project information
- Contact Peramanathan Sathyamoorthy directly

## 📄 License

This project is private and proprietary.
