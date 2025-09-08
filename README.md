
# Peramanathan Sathyamoorthy CV & Portfolio

A modern, responsive web application showcasing Peramanathan Sathyamoorthy's professional experience, skills, and portfolio as a Senior Software Engineer. Features PDF generation for downloadable CVs, built with Next.js 15 and React 19.

## ✨ Features

- **Responsive Portfolio**: Modern design featuring Hero section, About, Skills, Experience, and Contact
- **PDF CV Generation**: Automatic PDF generation using React PDF renderer
- **UI Components**: Beautiful shadcn/ui components with Radix UI primitives
- **Dark Mode Support**: Built-in theme switching with next-themes
- **TypeScript**: Fully typed with TypeScript for better developer experience
- **Motion Animations**: Smooth animations using Framer Motion
- **Form Handling**: Contact forms with React Hook Form
- **Data Visualization**: Charts and graphs using Recharts
- **SEO Optimized**: Server-side rendering with Next.js for better performance

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

### PDF Generation
- **@react-pdf/renderer** - Create PDF documents using React components

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Bun** - Fast JavaScript runtime for scripts

## 📋 Prerequisites

- **Node.js** 18+ (LTS version recommended)
- **npm** or **bun** package manager
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peramanathan-sathyamoorthy-cv
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
```

## 📁 Project Structure

```
/
├── public/                 # Static assets (favicon, images, PDF)
├── scripts/
│   └── generate-pdf.tsx   # PDF generation script
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   └── ...           # Feature components
│   ├── pages/            # Next.js pages (app router)
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

### Styling
- Colors and themes: `src/styles/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Individual `.tsx` files

### Adding New Sections
1. Create new component in `src/components/`
2. Import and add to `src/pages/index.tsx`
3. Update navigation in `src/components/Header.tsx`

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

**Built with ❤️ using Next.js 15 & React 19**
