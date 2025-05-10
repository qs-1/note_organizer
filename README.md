# Notes Organizer

A Next.js project for organizing and managing notes with features for document processing and management.

## Development Setup

### Prerequisites
- Node.js (v20+)
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/notes-organizer.git
cd notes-organizer
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

### Project Structure
```
notes-organizer/
├── src/
│   ├── app/          # Next.js app router and pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions and helpers
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── ...               # Configuration files
```

### Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

### Notable Dependencies
- React 19
- Next.js 15.3.2
- PDF processing: pdf-lib, pdfjs-dist, @react-pdf/renderer
- Document processing: mammoth, tesseract.js
- UI: tailwindcss, react-beautiful-dnd, react-resizable-panels
