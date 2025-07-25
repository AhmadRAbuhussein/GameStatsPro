# GameStats - Gaming Analytics Platform

## Overview

GameStats is a full-stack web application that provides comprehensive analytics for gaming performance across multiple platforms including League of Legends, Steam, Valorant, Counter-Strike 2, Dota 2, and Clash Royale. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming theme variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL (via Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema pushing
- **Fallback Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
The application uses three main entities:
1. **Players**: Stores player profiles with game-specific identifiers, usernames, regions, ranks, and profile metadata
2. **Matches**: Records individual match data including results, duration, champions, KDA, and match-specific statistics
3. **Game Stats**: Aggregated statistics like win rates, average KDA, total playtime, and current LP

### Frontend Components
- **Game Selection**: Interactive grid for choosing gaming platforms
- **Player Input**: Form component with game-specific validation and region selection
- **Analytics Dashboard**: Comprehensive statistics display with charts and performance metrics
- **UI Components**: Reusable Shadcn/ui components for consistent design

### Backend Services
- **Storage Interface**: Abstracted storage layer supporting both PostgreSQL and in-memory implementations
- **Route Handlers**: RESTful endpoints for player data retrieval and analytics
- **External API Integration**: Placeholder structure for fetching data from gaming APIs

## Data Flow

1. **User Journey**: Users select a game platform → enter player credentials → view comprehensive analytics
2. **Data Fetching**: Frontend requests player data → Backend checks database → Falls back to external API if needed → Returns aggregated analytics
3. **Real-time Updates**: TanStack Query handles caching and background data synchronization
4. **Error Handling**: Graceful error states with user-friendly messaging

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### Frontend Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI/UX**: Radix UI primitives, Tailwind CSS, Lucide React icons
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight routing

### Backend Libraries
- **Core**: Express.js, TypeScript
- **Database**: Drizzle ORM, connect-pg-simple for sessions
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, esbuild for bundling

### Gaming APIs (Planned Integration)
- Riot Games API (League of Legends, Valorant)
- Steam Web API (Steam games, CS2, Dota 2)
- Supercell API (Clash Royale)
- Platform-specific authentication and rate limiting

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: tsx with automatic TypeScript compilation and hot reload
- **Database**: Development connection to Neon Database with schema pushing

### Production Build
- **Frontend**: Vite production build with optimized bundling and asset compression
- **Backend**: esbuild bundling for Node.js deployment with external package handling
- **Database**: Drizzle migrations for schema management in production

### Environment Configuration
- **Database**: Environment-based connection strings via DATABASE_URL
- **API Keys**: Secure storage of gaming platform API credentials
- **Session Management**: PostgreSQL-backed sessions for scalability

### Replit Integration
- **Development Tools**: Replit-specific plugins for enhanced development experience
- **Runtime Error Handling**: Integrated error overlay for debugging
- **Asset Management**: Optimized asset serving and caching strategies

The application follows modern full-stack practices with type safety throughout, comprehensive error handling, and a scalable architecture that can accommodate multiple gaming platforms and growing user bases.