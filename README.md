
# Peramanathan Sathyamoorthy CV & Portfolio

A modern, responsive web application showcasing Peramanathan Sathyamoorthy's professional experience, skills, and portfolio as a Senior Software Engineer. Features PDF generation for downloadable CVs, built with Next.js 15 and React 19.

## ✨ Features

- **Responsive Portfolio**: Modern design featuring Hero section, About, Skills, Experience, and Contact
- **Document Viewer**: Interactive document viewer supporting PDF, images, and other file types
- **PDF CV Generation**: Automatic PDF generation using React PDF renderer
- **UI Components**: Beautiful shadcn/ui components with Radix UI primitives
- **Navigation**: Seamless navigation with home button and document sidebar
- **Dark Mode Support**: Built-in theme switching with next-themes
- **TypeScript**: Fully typed with TypeScript for better developer experience
- **Motion Animations**: Smooth animations using Framer Motion
- **Form Handling**: Contact forms with React Hook Form
- **Data Visualization**: Charts and graphs using Recharts
- **SEO Optimized**: Server-side rendering with Next.js for better performance
- **Kebab-case Convention**: Consistent file naming following kebab-case convention

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### UI & Components
- **shadcn/ui** - Modern UI components built on Radix UI
- **Radix UI** - Accessible, high-quality design system
- **Lucide React** - Beautiful & consistent icon library
- **Framer Motion** - Production-ready motion library

### PDF Generation & Document Viewing
- **@react-pdf/renderer** - Create PDF documents using React components
- **react-pdf** - PDF viewer and rendering in React

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Bun** - Fast JavaScript runtime for scripts
- **TypeScript** - Type-safe development with custom types and interfaces

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

# PDF Generation
npm run generate-pdf # Generate CV PDF using Bun script

# File Management
npm run scripts/generate-pdf.tsx  # Direct PDF generation script
```

## 📄 Document Viewer

The application includes a comprehensive document viewer with the following features:

- **Multi-format Support**: View PDFs, images, and other document types
- **Interactive Controls**: Zoom, rotate, and navigate through documents
- **Responsive Design**: Optimized for desktop and mobile viewing
- **File Management**: Organized sidebar with file type indicators
- **Download Support**: Direct download functionality for all documents

### Document Types Supported:
- **PDF Documents**: Full PDF rendering with page navigation
- **Images**: JPEG, PNG, and other image formats with zoom controls
- **Certificates**: Professional certificate display and management

## ⚙️ Feature Flags

The application uses a centralized feature flag system to control feature availability and display development disclaimers:

- **Feature Flags**: Located in `src/config/feature-flags.ts`
- **Development Warnings**: Automatic disclaimers for features under development
- **Easy Configuration**: Simple on/off toggles for features
- **User Communication**: Clear messaging about feature status

### Current Development Features:
- **AMA (Ask Me Anything)**: AI-powered Q&A feature
- **CV Question Answering**: AI-powered CV content analysis

## 📁 Project Structure

```
/
├── public/                 # Static assets (favicon, images, certificates, PDFs)
├── scripts/
│   └── generate-pdf.tsx   # PDF generation script
├── src/
│   ├── components/        # React components (kebab-case naming)
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── figma/        # Figma-related components
│   │   └── ...           # Feature components
│   ├── pages/            # Next.js pages (app router)
│   ├── data/             # Static data files
│   │   ├── cvdata.json   # CV data
│   │   └── documents-data.ts # Document metadata
│   ├── types/            # TypeScript type definitions
│   │   └── documents.ts  # Document-related interfaces
│   ├── utils/            # Utility functions
│   │   └── file-utils.ts # File handling utilities
│   ├── config/           # Configuration files
│   │   └── feature-flags.ts # Feature flag settings
│   ├── styles/           # CSS and Tailwind config
│   └── guidelines/       # Project documentation
├── package.json          # Project dependencies and scripts
└── README.md            # This file
```

## 🎨 Customization

### Updating CV Data
1. Edit content in `src/data/cvdata.json`
2. Modify components in `src/components/` to match data structure
3. Regenerate PDF with `npm run generate-pdf`

### Managing Documents
1. Add document metadata to `src/data/documents-data.ts`
2. Place document files in `public/` directory
3. Update file paths in the data file
4. Documents will automatically appear in the viewer

### Styling
- Colors and themes: `src/styles/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Individual `.tsx` files

### Adding New Sections
1. Create new component in `src/components/` (use kebab-case naming)
2. Import and add to `src/pages/index.tsx`
3. Update navigation in `src/components/header.tsx`
4. Add TypeScript types in `src/types/` if needed

### Adding New Document Types
1. Update `DocumentItem` interface in `src/types/documents.ts`
2. Add rendering logic to `src/components/document-viewer.tsx`
3. Update file type detection in `src/utils/file-utils.ts`
4. Add new documents to `src/data/documents-data.ts`

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
- **Any Node.js hosting provider**

### Vercel Deployment
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For questions or issues:
- Review the existing code and documentation
- Check `src/guidelines/` for additional project information
- Contact Peramanathan Sathyamoorthy directly

---

## 🆕 Recent Updates

- **Document Viewer**: Interactive document viewing with PDF and image support
- **Kebab-case Convention**: Consistent file naming across the entire project
- **Enhanced Navigation**: Improved user experience with home buttons and sidebar
- **Type Safety**: Comprehensive TypeScript interfaces and utilities
- **Modular Architecture**: Clean separation of concerns with types, utils, and data

**Built with ❤️ using Next.js 15 & React 19**
