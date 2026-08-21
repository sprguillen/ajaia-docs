# Ajaia Docs Project

This is an AI-Native Full Stack Developer Assignment. The goal is to build a lightweight collaborative document editor inspired by Google docs.

**Live Demo:**  

https://ajaia-docs-6wq7mrco7-sprguillens-projects.vercel.app/

**Source Code:**  

https://github.com/sprguillen/ajaia-docs

---

## Features

### Core functionalities
- Dashboard allows switching between seeded users
- Create new documents
- Rename documents
- Autosaves every time the user types in a new document
- Persistent storage using Supabase

### Rich Text Editing
- Bold
- Italic
- Underline
- H1 / H2
- Unordered lists
- Ordered/Numbered lists

### File Support
- `.txt`
- `.md`

The user's imported files can now be edited. For now, Markdown files are imported as plain text only.

### Sharing feature
- Can share documents with another user
- Can remove shared access
- Separate panel for the user's owned documents and documents shared with them by other users.
- Shared users can edit documents

# Tech Stack

- Next.js
- React
- TypeScript
- TailwindCSS
- TipTap
- Supabase
- Vitest
- Vercel

---

#Project Setup

## Install dependencies

```bash

npm install

```

## Configure environment variables

Create your own `.env.local` copy the contents from the `.env.example` file

## Start development server

```bash

npm run dev

```

Open http://localhost:3000

## Run tests

```bash

npm test

```
