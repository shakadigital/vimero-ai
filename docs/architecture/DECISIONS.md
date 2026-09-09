# Architectural Decisions (ADR)

## ADR-001: Next.js and Supabase as Core Architecture
- **Context:** Need a robust foundation for a mobile-first PWA digital business command center.
- **Decision:** Use Next.js (App Router, Server Components) and Supabase (PostgreSQL, Auth, Storage).
- **Reason:** Next.js allows full-stack TypeScript with server components for data-fetching and security. Supabase provides PostgreSQL with pgvector, scalable Auth, and Row Level Security, fitting our strict database and security rules.
- **Alternatives:** MERN stack, tRPC + Prisma + external DB.
- **Consequences:** Tightly couples backend logic to Next.js API routes/server actions and Supabase client libraries. Requires disciplined server-side security.
