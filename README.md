
# Peramanathan Sathyamoorthy CV & Portfolio

A modern, full-stack web application showcasing Peramanathan Sathyamoorthy's professional portfolio as a Senior Software Engineer. Built with Next.js 16 App Router, featuring AI-powered AMA chatbot, interactive document viewing, and automated PDF CV generation.

## ✨ Features

- **🤖 AI-Powered AMA Chat**: Ask intelligent questions about Peramanathan's background and experience
- **📄 Dynamic PDF Generation**: Server-side PDF creation with professional styling
- **👁️ Interactive Document Viewer**: Inline PDF viewing with full browser integration
- **📚 Content Hub**: Dynamic multi-page content management system
- **🎨 Modern UI/UX**: Beautiful shadcn/ui components with responsive design
- **⚡ Performance Optimized**: Fast loading with Next.js App Router and Turbopack
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **🔒 Production Ready**: Cross-platform deployment support (Vercel, Netlify, AWS)
- **📱 Mobile-First**: Responsive design optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with server-side rendering
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript

### UI & Components
- **shadcn/ui** - Modern UI components built on Radix UI
- **Radix UI** - Accessible, high-quality design system
- **Lucide React** - Beautiful & consistent icon library
- **Framer Motion** - Production-ready motion library

### AI & Document Processing
- **@react-pdf/renderer** - Create PDF documents using React components
- **react-pdf** - PDF viewer and rendering in React
- **@huggingface/transformers** - AI/ML model integration

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Bun** - Fast JavaScript runtime for scripts
- **Playwright** - End-to-end testing

## 📋 Prerequisites

- **Node.js** 18+ (LTS version recommended)
- **npm** or **bun** package manager
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devprofile
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Or using bun (recommended for faster installation)
   bun install
   ```

3. **Generate initial CV PDF** (optional, for first deployment)
   ```bash
   # Using npm
   npm run generate-pdf

   # Or using bun
   bun run scripts/generate-pdf.tsx
   ```

## 🏃 Development

1. **Start development server**
   ```bash
   # Using npm
   npm run dev

   # Or using bun
   bun run dev
   ```
   - Opens at `http://localhost:3000`
   - Hot reload enabled for development

2. **View the application**
    - Portfolio: `http://localhost:3000`
    - CV Page: `http://localhost:3000/cv`
    - Documents Viewer: `http://localhost:3000/documents`
    - CV PDF: `http://localhost:3000/cv.pdf`

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production (includes PDF generation)
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# PDF Generation
npm run generate-pdf # Generate CV PDF using Bun script

# Testing
npm run test:e2e     # Run E2E tests with Playwright
```

## 🔧 Building for Production

```bash
# Build the application (includes PDF generation)
npm run build

# Start production server
npm run start
```

## 🌐 Deployment

This project is configured for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Any Node.js hosting provider**

### Vercel Deployment
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically on push

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture, project structure, and customization guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and branching workflow
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and major updates

## 📄 License

This project is private and proprietary.

## 📞 Support

For questions or issues:
- Review the existing code and documentation
- Check `src/guidelines/` for additional project information
- Contact Peramanathan Sathyamoorthy directly

---

**Built with 💙 using Next.js 16 & React 19**
