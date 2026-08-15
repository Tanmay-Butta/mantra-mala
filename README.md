# MantraMala

A premium digital mala for mantra recitation.

## Setup Instructions

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
4. Enable **Google Authentication** in the Firebase project.
5. Create a **Firestore** database.
6. Copy `.env.example` to `.env` and fill in your Firebase configuration values.
7. Deploy the provided Firestore security rules manually if desired: `firebase deploy --only firestore:rules`.
8. Run the application locally with `npm run dev`.

## Firestore Schema

### `users/{userId}`
- `displayName`: string
- `email`: string
- `createdAt`: timestamp
- `lastActiveAt`: timestamp

### `users/{userId}/mantras/{mantraId}`
- `count`: number
- `target`: number
- `lastRecitedAt`: timestamp
- `createdAt`: timestamp
- `updatedAt`: timestamp

*(Note: Mantras are currently loaded from mock data. For a production app, they can be migrated to a global `mantras` collection in Firestore)*

## Tech Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Three Fiber (Three.js)
- Firebase (Auth, Firestore)
- vite-plugin-pwa
