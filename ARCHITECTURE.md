# Architecture & Technical Documentation

This document provides detailed technical information about the DevProfile application architecture, project structure, and customization guidelines.

## 🏗️ Project Structure (2025 App Router)

```
/
├── public/                          # Static assets
│   ├── cv.pdf                      # Pre-generated CV PDF
│   ├── certificates/               # Professional certificates
│   └── images/                     # Static images and assets
├── scripts/
│   └── generate-pdf.tsx            # PDF generation script
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── actions.ts              # Server actions
│   │   ├── api/                    # API routes
│   │   │   ├── cv/                 # CV-related endpoints
│   │   │   │   ├── download/       # CV download API
│   │   │   │   ├── generate/       # PDF generation API
│   │   │   │   ├── qa/             # AI Q&A API
│   │   │   │   └── view/           # CV viewer API
│   │   │   └── certificates/       # Certificate verification
│   │   ├── cv/                     # CV pages
│   │   ├── documents/              # Documents viewer
│   │   ├── content-hub/            # Dynamic content system
│   │   ├── ama/                    # AI AMA chat
│   │   ├── quick-cv-actions/       # Quick actions page
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Homepage
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── content-hub/            # Content Hub components
│   │   ├── figma/                  # Figma integration
│   │   ├── ai-chat.tsx             # AI chat interface
│   │   ├── hero.tsx                # Hero section
│   │   ├── header.tsx              # Navigation
│   │   └── ...                     # Other feature components
│   ├── config/                     # Configuration
│   │   └── feature-flags.ts        # Feature toggles
│   ├── data/                       # Static data
│   │   ├── cvdata.json             # CV content
│   │   └── documents-data.ts       # Document metadata
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility libraries
│   ├── types/                      # TypeScript definitions
│   ├── utils/                      # Helper functions
│   └── styles/                     # Global styles
├── tests/                          # Playwright E2E tests
│   └── e2e/                        # Test specifications
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies & scripts
├── tailwind.config.ts             # Tailwind CSS config
└── tsconfig.json                  # TypeScript configuration
```

## 🎨 Customization

### Updating CV Data

1. **Edit content** in `src/data/cvdata.json`
2. **Modify components** in `src/components/` to match data structure
3. **Regenerate PDF** with `npm run generate-pdf`

### Managing Documents

1. **Add metadata** to `src/data/documents-data.ts`
2. **Place files** in `public/` directory
3. **Update paths** in the data file
4. **Documents appear** automatically in the viewer

### Document Viewer Features

The application includes a comprehensive document viewer with:

- **Multi-format Support**: PDFs, images, certificates
- **Interactive Controls**: Zoom, rotate, navigation
- **Responsive Design**: Desktop and mobile optimized
- **File Management**: Organized sidebar with type indicators
- **Download Support**: Direct download functionality

### Styling Configuration

- **Colors & Themes**: `src/styles/globals.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Component Styles**: Individual `.tsx` files

## ⚙️ Feature Flags

The application uses a centralized feature flag system:

- **Location**: `src/config/feature-flags.ts`
- **Purpose**: Control feature availability and development disclaimers
- **Configuration**: Simple on/off toggles
- **User Communication**: Clear messaging about feature status

### Current Development Features

- **AMA (Ask Me Anything)**: AI-powered Q&A feature
- **CV Question Answering**: AI-powered CV content analysis

## 🔧 Development Scripts

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

## 📄 API Routes

### CV Endpoints
- `GET /api/cv` - Get CV data
- `POST /api/cv/generate` - Generate PDF
- `GET /api/cv/download` - Download CV PDF
- `POST /api/cv/qa` - AI Q&A about CV
- `GET /api/cv/view` - View CV data

### Certificate Verification
- `GET /api/certificates/[id]/hash` - Verify certificate hash

## 🏗️ Adding New Features

### New Sections
1. Create component in `src/components/` (kebab-case naming)
2. Import and add to appropriate page
3. Update navigation in `src/components/header.tsx`
4. Add TypeScript types if needed

### New Document Types
1. Update `DocumentItem` interface in `src/types/documents.ts`
2. Add rendering logic to `src/components/document-viewer.tsx`
3. Update file type detection in `src/utils/file-utils.ts`
4. Add documents to `src/data/documents-data.ts`

### New API Endpoints
1. Create route in `src/app/api/`
2. Implement server actions in `src/app/actions.ts`
3. Add proper error handling and validation
4. Update TypeScript types

## 🚀 Deployment

### Supported Platforms
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Any Node.js hosting provider**

### Build Requirements
- Node.js 18+
- npm or bun
- Git for deployment

### Environment Variables
The application uses cross-platform URL construction and doesn't require environment variables for basic functionality.
