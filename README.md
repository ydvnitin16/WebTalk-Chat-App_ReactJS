# SendX Chat

A full-stack real-time chat application built with the MERN stack, Socket.IO, and WebRTC. SendX focuses on fast messaging, presence updates, offline-friendly UX, and one-to-one audio/video calling in a clean React interface.

## Overview

SendX is structured as a two-app repository:

- `Frontend/` contains the React + Vite client.
- `Backend/` contains the Express + MongoDB API and Socket.IO server.

The app supports:

- user signup and login
- cookie-based authentication
- real-time one-to-one messaging
- conversation history and pagination
- typing indicators
- online/offline presence
- unread message tracking
- offline message queueing on the client
- user search by username
- profile updates with avatar upload
- one-to-one audio and video calling with WebRTC
- PWA support for a more app-like experience

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Zustand
- Tailwind CSS v4
- Socket.IO Client
- WebRTC
- Vite PWA
- React Hook Form + Yup

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- Socket.IO
- JWT authentication
- Cookie-based session handling
- Multer
- Cloudinary
- bcrypt

## Key Features

### Messaging

- Real-time message delivery over Socket.IO
- Conversation timeline and paginated message loading
- Message status handling
- Conversation last-message updates
- Offline queue support for messages created while disconnected

### Presence and UX

- live online/offline status
- typing indicators
- persistent auth state on the client
- lazy-loaded routes and loading skeletons

### Calling

- one-to-one audio calls
- one-to-one video calls
- STUN support by default
- optional TURN server support through environment variables
- call history per conversation
- mic and camera toggles during a call

### Profile and Media

- search users by username
- update display name and username
- upload avatar images to Cloudinary

### Performance

The repository includes documented frontend optimization work in `Frontend/performance-notes.txt`.

Highlights from the latest notes:

- desktop Lighthouse score: `99`
- mobile Lighthouse score: `95`
- optimized production build size reduced to about `894 KB`
- blank initial screen replaced with immediate loading and skeleton UI

## Architecture

### Frontend responsibilities

- route protection
- auth persistence with Zustand
- socket connection lifecycle
- chat state management
- call state and WebRTC session handling
- offline queue storage in `localStorage`

### Backend responsibilities

- authentication and cookie issuance
- MongoDB persistence
- protected REST endpoints
- Socket.IO authentication from cookies
- real-time message and call event coordination
- Cloudinary avatar upload pipeline

## Project Structure

```text
SendX-Chat/
|-- Backend/
|   |-- configs/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- socket/
|   |-- server.js
|   `-- package.json
|-- Frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- features/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- stores/
|   |-- vite.config.js
|   |-- performance-notes.txt
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Authentication Flow

SendX uses JWT stored in an `httpOnly` cookie named `authHeader`.

- after login or signup, the backend signs a JWT
- the token is stored in a cookie
- protected API routes validate the token through middleware
- Socket.IO also reads and verifies the same cookie during connection

In production, the cookie is configured for cross-site HTTPS usage. In local development, it falls back to a more browser-friendly setup for `localhost`.

## Environment Variables

Create a `.env` file inside `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
ORIGIN=http://localhost:5173
PORT=3000

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

DEFAULT_AVATAR_URL=https://example.com/default-avatar.png
DEFAULT_AVATAR_PUBLIC_ID=sendx/default-avatar

NODE_ENV=development
```

Create a `.env` file inside `Frontend/`:

```env
VITE_SERVER_URL=http://localhost:3000

# Optional TURN configuration for WebRTC in stricter network environments
VITE_TURN_URLS=turn:your-turn-server:3478
VITE_TURN_USERNAME=your_turn_username
VITE_TURN_CREDENTIAL=your_turn_password
```

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- npm
- MongoDB database
- Cloudinary account for avatar uploads

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SendX-Chat
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

### 4. Add environment files

Create the `.env` files shown above in both app folders.

### 5. Run the backend

```bash
cd Backend
npm run dev
```

The backend starts on:

```text
http://localhost:3000
```

### 6. Run the frontend

```bash
cd Frontend
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
```

Starts the Express + Socket.IO server with Nodemon.

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Overview

### Auth and user routes

- `POST /register` - create a new user
- `POST /login` - authenticate user and set auth cookie
- `DELETE /logout` - clear auth cookie
- `GET /user/search?username=<query>` - search users by username
- `PUT /profile` - update profile details and avatar

### Conversation and messaging routes

- `GET /conversations` - get the current user's conversations
- `GET /messages/:conversationId` - get paginated messages
- `GET /timeline/:conversationId` - get conversation timeline

### Call routes

- `GET /calls/:conversationId` - get call history for a conversation

## Realtime Behavior

Socket.IO is used for:

- connecting authenticated users
- joining each user to a personal room
- delivering undelivered messages on reconnect
- message status updates
- typing events
- online/offline presence events
- call signaling events for WebRTC sessions

## WebRTC Notes

Calling is peer-to-peer and uses:

- Google STUN by default
- optional TURN servers from frontend environment variables

TURN is strongly recommended for production deployments where users may be behind NAT, firewalls, or restrictive mobile networks.

## Build and Deployment Notes

- the frontend is configured as a PWA through `vite-plugin-pwa`
- route-level code splitting is already in place through `React.lazy`
- the frontend build output is generated in `Frontend/dist/`
- the backend expects CORS `origin` to match the deployed frontend
- production cookies require HTTPS because `SameSite=None` needs `Secure=true`

## Current Repository Notes

- there is no root `package.json`; frontend and backend are managed separately
- frontend and backend each maintain their own dependencies
- the repo currently does not include automated tests


## Why This Project Stands Out

SendX is more than a basic CRUD chat clone. It combines:

- real-time chat
- authenticated sockets
- WebRTC calling
- offline-friendly messaging behavior
- avatar upload flow
- performance-focused frontend improvements

That makes it a strong portfolio project for demonstrating full-stack product thinking, not just API wiring.