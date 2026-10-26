# Parikshan API

Backend API for **Parikshan**, a university student-records and achievement-verification platform. It is built on [Strapi 5](https://strapi.io/) (a headless CMS/backend framework) and exposes content APIs for universities, students, academic semesters, campus events, and verified achievements. It likely pairs with a separate Parikshan frontend.

## Features

- **University management** — university profiles with contact info, departments, courses offered, and student capacity.
- **Student records** — student profiles linked to a university and to the built-in Users & Permissions plugin for authentication.
- **Semester tracking** — per-student semester records with GPA, total credits, course lists, and current-semester flag.
- **Event management** — campus events (hackathons, cultural events, workshops, coding contests) with relations to attendees, registrants, and winners.
- **Achievement verification** — achievement records that store an IPFS hash/URL, a score, and an "authentic score," suggesting tamper-evident verification of student achievements.
- **Role-based auth** — extends Strapi's Users & Permissions plugin with a custom `user-validation` middleware.
- **Auto-generated REST/GraphQL-ready content APIs** and an admin panel, courtesy of Strapi.

## Tech Stack

- **Strapi 5** (Node.js headless CMS/backend framework) with **TypeScript**
- **PostgreSQL** (`pg` driver) as the database
- **React** (for the Strapi admin panel customizations)
- pnpm as the package manager

## Getting Started

### Prerequisites

- Node.js `>=18.0.0 <=22.x.x`
- npm `>=6.0.0` (or pnpm, which the project is configured to use)
- A PostgreSQL database

### Installation

```bash
git clone https://github.com/daivikawasthi01/parikshan-api.git
cd parikshan-api
npm install   # or: pnpm install
```

Copy `.env.example` to `.env` and fill in the required secrets (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`) plus your database connection details.

### Usage

```bash
npm run develop   # start Strapi with autoReload and open the admin panel
npm run start     # start Strapi in production mode
npm run build     # build the admin panel
```

The admin panel is available at `http://localhost:1337/admin` once the server is running.
