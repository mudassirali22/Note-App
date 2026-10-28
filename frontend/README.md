# NoteSpace

A responsive notes workspace built with React 19, Vite, and React Router. Account creation uses a one-time email code, and the dashboard supports searching, creating, editing, and deleting private notes.

## Features

- Responsive sign-up, sign-in, OTP verification, and password recovery screens
- Six-digit email verification code on first sign-in, followed by automatic sign-in
- Password reset with a separate OTP and one-use reset session
- Searchable notes dashboard with activity summaries and mobile navigation
- Create, edit, pin, categorize, archive, and search notes
- Sort notes by recent activity, age, or title
- Recover notes from Trash, or permanently remove them when ready
- Export the current note collection or filtered results as JSON
- Keyboard shortcuts: `/` to search and `N` to start a new note

## Requirements

- Node.js 20.19+ (or 22.12+)
- The NoteSpace backend running locally or at a reachable URL
- An email-enabled backend configuration for OTP delivery

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `frontend/.env` with the API base URL:

   ```dotenv
   VITE_PORT=http://localhost:3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Run checks before shipping:

   ```bash
   npm run lint
   npm run build
   ```

The backend needs `MONGO_URL`, `SECRET_KEY`, `FRONTEND_URL`, `MAIL_ADDRESS`, and `MAIL_PASSWORD` configured. `PORT` is optional and defaults to `3000`.

## Stack

- React 19.3
- React Router 7
- Vite 8
- Tailwind CSS 4
- Lucide icons
