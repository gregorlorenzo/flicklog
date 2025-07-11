# Flicklog 🎬

Flicklog is a social platform built around the shared experience of watching movies and TV shows. It provides a beautiful, dedicated home for your viewing history, transforming fleeting opinions and scattered chat messages into a permanent, interactive scrapbook for you and your friends.

This project is built with the T3 Stack philosophy in mind, focusing on simplicity, modularity, and full-stack type safety.

## ✨ Core Features

- **Personal & Shared Spaces:** Keep a private movie diary or create shared "scrapbooks" with friends and family.
- **Effortless Logging:** Quickly find any movie or TV show via the TMDB API and log it with a rating, comments, and tags.
- **Collaborative Experience:** In shared spaces, when one person logs a film, other members are notified to add their own rating.
- **Visual Library:** View your logged entries in a beautiful, filterable grid of movie posters.
- **Stats Dashboard:** Get fun insights into your group's viewing habits, including who the "Toughest Critic" is and which movies were the most divisive.
- **Discord Integration:** Automatically post new reviews as rich embeds to a designated Discord channel.
- **"Backlog Blitz" Onboarding:** A unique 3-step onboarding process to instantly populate a new user's library and establish their rating scale.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Realtime)
- **ORM:** [Prisma](https://www.prisma.io/)
- **UI Components:** [ShadCN/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) (for a local PostgreSQL instance)
- A [Supabase](https://supabase.io/) account (for production keys and auth)
- A [TMDB API Key](https://www.themoviedb.org/settings/api)

### Local Development Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/flicklog.git
    cd flicklog
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Set up environment variables:**
    - Copy the example environment file: `cp .env.example .env`
    - You will need to create a project on Supabase to get your project URL and keys.
    - `DATABASE_URL`: This should be the **Session Pooler** connection string from your Supabase project settings (port `5432`). It's used for migrations.
    - `DIRECT_URL`: This is the same as `DATABASE_URL` for this project's setup.
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project `anon` key.
    - `TMDB_API_KEY`: Your API key from The Movie Database.

4. **Set up the local database (for local development only):**
    - We use a separate `.env.local` for running the dev server against a local Docker container. This is optional but recommended for isolated development.
    - Copy the example: `cp .env.example .env.local`
    - Update the `DATABASE_URL` in `.env.local` to point to your local database (e.g., `postgresql://user:password@localhost:5432/flicklog`).

5. **Run database migrations:**
    - This command will apply all existing migrations to the database specified in your `.env` file.

    ```bash
    pnpm prisma migrate deploy
    ```

    - Then, apply the custom functions and RLS policies:

    ```bash
    dotenv -- bash -c 'psql "$DIRECT_URL" -f prisma/setup.sql'
    ```

6. **Run the development server:**

    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.
