# Chatra Frontend

Nuxt 3 + Vue 3 + Pinia frontend for the Chatra education platform.

## Quick start

### 1. Configure environment

The `.env` file is already set up for local development:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
NUXT_PUBLIC_WS_BASE=ws://localhost:8000
```

Change these to your production URLs when deploying.

### 2. Install and run

```bash
npm install
npm run dev
```

App: http://localhost:3000

## Notes

- **No API keys on the frontend.** All AI calls go through the backend (`POST /ai/chat`).
- The backend must be running and `OPENAI_API_KEY` must be set there.
