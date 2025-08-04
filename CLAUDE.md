# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4 application with TypeScript that serves as an AI QA Agent Frontend for testing and evaluation purposes. The application provides different UI components and interactions to test AI agents' ability to interact with web elements.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- Next.js 15.4.1 with App Router
- React 19.1.0
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- ESLint for code quality

### Project Structure
- `/src/app/` - Next.js app directory containing all pages and components
  - `layout.tsx` - Root layout with Geist font setup
  - `page.tsx` - Home page with navigation to test routes
  - `/table/` - Table display demo
  - `/checkboxes/` - Checkbox interaction demo
  - `/visible/` - Visibility testing demo
  - `/buttons/` - Button interaction demo

### Key Patterns
- All pages follow the same structure with a back link to home
- Consistent styling using Tailwind CSS classes
- Light theme with gray color scheme
- Path aliases configured: `@/*` maps to `./src/*`

## Testing Scenarios

The application is designed to test AI agents' abilities to:
1. Navigate between pages
2. Interact with table data
3. Handle different checkbox states
4. Work with visible/hidden elements
5. Click various button types

Each demo page is self-contained and uses dummy data for testing purposes.