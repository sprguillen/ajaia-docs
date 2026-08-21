Architecture Notes

Ajaia Docs is a lightweight project that is inspired by Google docs. Duilt with Next.js, TypeScript, TipTap, Tailwind, and Supabase.

The app uses three core tables:

* users for seeded demo users
* documents for title, TipTap JSON content, owner, and timestamps
* document_shares for shared access

I chose seeded users instead of real authentication because the assignment explicitly allows mocked users. This keep the focus on document ownership, sharing, editing, and persistence.

Document content is stored as TipTap JSON so formatting and editor structure can be restored directly without converting to and from HTML.

Autosave is debounced by roughly 750ms to reduce unnecessary database writes while still giving users quick feedback through Saving... and Saved ✓ states.

File import supports .txt and .md. Markdown is intentionally imported as plain text to avoid adding parsing complexity that was not necessary for the core assignment.

Real-time collaboration, comments, version history, role-based permissions, and production authentication were intentionally deprioritized. With more time, I would add Supabase Auth + Row Level Security first, followed by permission levels and richer collaboration features.