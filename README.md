# SolePrompt

**The Marketplace for Premium AI Prompts**

A premium marketplace where users can buy and sell AI prompts. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Phase 1 — Landing Page

This phase includes the foundation and marketing landing page only. No authentication, database, payments, or marketplace logic yet.

### Features

- Responsive navigation with dark mode toggle
- Animated hero with search bar
- Featured prompt cards
- Category grid
- Become a Seller section
- Animated statistics
- Testimonials
- FAQ accordion
- Footer

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Theming:** next-themes
- **Icons:** Lucide React
- **Linting:** ESLint + Prettier

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Production build         |
| `npm run start`    | Start production server  |
| `npm run lint`     | Run ESLint               |
| `npm run format`   | Format with Prettier     |

## Project Structure

```
src/
├── app/                  # App Router pages & layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Reusable UI primitives
│   ├── layout/           # Navbar, Footer, ThemeProvider
│   └── landing/          # Landing page sections
├── lib/                  # Utilities & constants
└── types/                # TypeScript interfaces
```

## Brand

| Token         | Value     |
| ------------- | --------- |
| Electric Blue | `#0066FF` |
| Purple        | `#7C3AED` |
| Black         | `#000000` |
| White         | `#FFFFFF` |

## License

Private — SolePrompt © 2026
