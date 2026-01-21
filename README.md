# 🎵 Album PMP

A collaborative album rating app where friends can share, rate, and discover music together.

## ✨ Features

- **Group Album Rotation** - Each user submits one album to the shared pool
- **Track-by-Track Rating** - Rate individual songs with a 5-star system and preview tracks
- **Statistics Dashboard** - View top albums, masterpieces (4.5+ avg), and best-rated songs
- **Album Details** - Dive into album-specific stats with ranked tracks
- **Apple Music Integration** - Search and add albums directly from Apple Music

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Backend:** Firebase (Firestore + Auth)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/GAlmeida150815/album-pmp.git

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with your Firebase config:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎮 Usage

1. **Login** - Create an account or sign in
2. **Add Album** - Search Apple Music and submit one album to the group
3. **Rate Tracks** - Click any album to rate individual songs
4. **View Stats** - Check the leaderboard for top albums and songs
5. **Delete & Resubmit** - Remove your album to choose a different one

## 📁 Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # Reusable UI components
├── context/          # User context provider
├── interfaces/       # TypeScript interfaces
└── lib/             # Firebase configuration
```

## 🧑‍💻 Made by

Created as a fun project for rating albums with friends.

---

**For fun project, created using NextJS & TypeScript supported by Firebase.**
