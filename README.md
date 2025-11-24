# AI Code Copilot

A modern, full-stack AI-powered code generation application built with Next.js 14, TypeScript, and PostgreSQL. Generate clean, well-commented code snippets in multiple programming languages using AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)

## ✨ Features

### Core Functionality

- 🤖 **AI-Powered Code Generation** - Generate code using OpenRouter API (Google Gemini 2.5 Flash)
- 💾 **Persistent Database Storage** - All generations saved to PostgreSQL via Neon
- 📜 **Paginated History** - Browse previous generations with pagination
- 🔍 **Language Filtering** - Filter history by programming language
- 📋 **One-Click Copy** - Copy generated code to clipboard
- ⌨️ **Keyboard Shortcuts** - Press `Shift+Enter` to generate code
- 🎨 **Light/Dark Mode** - Toggle between themes with persistence
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### Supported Languages

- Python
- JavaScript
- TypeScript
- Java
- C++
- Go
- C#

### Technical Features

- ✅ RESTful API endpoints
- ✅ Type-safe database operations with Drizzle ORM
- ✅ Server-side rendering with Next.js 14 App Router
- ✅ React Query for optimized data fetching
- ✅ Zod schema validation
- ✅ Optimistic UI updates
- ✅ Error handling and user feedback
- ✅ Accessibility-first design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A [Neon](https://neon.tech) PostgreSQL database
- An [OpenRouter](https://openrouter.ai) API key

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd copilot
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database - Get from Neon Console
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# OpenRouter API - Get from OpenRouter Dashboard
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=google/gemini-2.5-flash

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Initialize the database**

```bash
# Push schema to database
npx drizzle-kit generate

npx drizzle-kit migrate
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture & Design Decisions

### Frontend Architecture

**Framework Choice: Next.js 15 App Router**

- Server-side rendering for improved SEO and performance
- App Router for modern file-based routing
- Server Components for reduced client-side JavaScript

**State Management**

- **React Query** - Server state management with automatic caching, refetching, and optimistic updates
- **React Context** - Theme state (light/dark mode)
- **Component State** - UI-specific state (modals, dropdowns)

**Styling Approach**

- **Tailwind CSS** - Utility-first CSS for rapid development
- **Shadcn/ui** - Accessible, customizable component library
- **CSS Variables** - Theme-aware color system

### Backend Architecture

**Database Design**

Two-table normalized schema with foreign key relationship:

```
┌─────────────────┐         ┌──────────────────────┐
│   languages     │         │  code_generations    │
├─────────────────┤         ├──────────────────────┤
│ id (PK)         │◄────────│ id (PK)              │
│ code (unique)   │         │ prompt               │
│ name            │         │ language_id (FK)     │
│ created_at      │         │ code                 │
└─────────────────┘         │ timestamp            │
                            └──────────────────────┘
```

**Why this design?**

- **Normalization** - Avoid storing "Python", "JavaScript" strings repeatedly
- **Data Integrity** - Foreign key ensures valid language references
- **Flexibility** - Easy to add new languages without code changes
- **Query Efficiency** - Join operations are fast with indexed foreign keys
- **Analytics Ready** - Can easily query statistics by language

**API Design**

RESTful endpoints following best practices:

- `POST /api/generate` - Idempotent code generation
- `GET /api/history` - Paginated history with filtering

**Technology Stack**

- **Neon PostgreSQL** - Serverless Postgres with auto-scaling
- **Drizzle ORM** - Type-safe SQL query builder
- **Zod** - Runtime type validation
- **OpenRouter** - Multi-model AI gateway

### Key Design Patterns

1. **Separation of Concerns**

   - API routes handle business logic
   - Components focus on presentation
   - Shared schema for type safety

2. **Optimistic UI**

   - Immediate feedback on user actions
   - Background data synchronization

3. **Error Boundaries**

   - Graceful error handling
   - User-friendly error messages

4. **Accessibility First**
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support

## 📡 API Documentation

### POST `/api/generate`

Generate code using AI.

**Request Body:**

```json
{
  "prompt": "Write a function to reverse a string",
  "language": "python"
}
```

**Response (Success):**

```json
{
  "code": "def reverse_string(s):\n    return s[::-1]\n\n# Example usage\ntext = \"Hello, World!\"\nreversed_text = reverse_string(text)\nprint(reversed_text)  # !dlroW ,olleH",
  "id": 42
}
```

**Response (Error):**

```json
{
  "error": "Failed to generate code",
  "details": "API key is invalid"
}
```

**Supported Languages:**

- `python`
- `javascript`
- `typescript`
- `java`
- `cpp`
- `go`
- `csharp`

---

### GET `/api/history`

Fetch paginated code generation history.

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10, max: 100)
- `language` (optional) - Filter by language code

**Example Requests:**

```bash
# Get first page
GET /api/history?page=1&limit=10

# Filter by Python
GET /api/history?language=python

# Get second page of JavaScript
GET /api/history?page=2&limit=5&language=javascript
```

**Response:**

```json
{
  "data": [
    {
      "id": 42,
      "prompt": "Write a function to reverse a string",
      "language": {
        "code": "python",
        "name": "Python"
      },
      "code": "def reverse_string(s):\n    return s[::-1]",
      "timestamp": "2025-11-24T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio UI
npm run db:seed      # Seed database with initial data

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🎯 Future Improvements

If I had more time, I would implement:

- **User Authentication & Personal Workspaces** - Multi-user support with individual histories, favorites, and custom settings using NextAuth.js or Clerk

- **Advanced Code Features** - Inline editing of generated code, syntax validation, code execution in sandboxed environments, and export to files (.py, .js, etc.)

- **Performance Optimizations** - Redis caching for frequent queries, database indexing for faster searches, lazy loading components, and CDN integration for static assets

- **Collaboration & Sharing** - Share code snippets via unique URLs, real-time collaborative editing, comments and annotations on saved code

- **Enhanced Search & Analytics** - Full-text search across all code generations, usage statistics dashboard, code quality metrics, and AI model comparison features

- **DevOps & Monitoring** - CI/CD pipeline with automated testing, error tracking with Sentry, database backup strategy, and load testing for production readiness

## 🔒 Environment Variables

Create a `.env.local` file with:

```env
# Required
DATABASE_URL=                    # Neon PostgreSQL connection string
OPENROUTER_API_KEY=             # OpenRouter API key

# Optional
OPENROUTER_MODEL=               # Default: google/gemini-2.5-flash
NEXT_PUBLIC_SITE_URL=           # Default: http://localhost:3000
```

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Neon](https://neon.tech) - Serverless Postgres
- [OpenRouter](https://openrouter.ai) - AI model gateway
- [Shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Utility CSS framework

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14 and TypeScript**
