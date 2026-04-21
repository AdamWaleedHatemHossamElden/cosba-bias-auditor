# CoS-BA

CoS-BA is a full-stack web application for uploading AI-generated content, reporting bias, and reviewing community-submitted reports through dashboards and admin moderation tools.

## Features

- User registration and login with JWT authentication
- Protected user routes and admin-only actions
- Upload AI-generated text, images, PDFs, and MP4 files
- Community feed with search, type/model filters, sorting, likes, and comments
- Edit/delete ownership controls for user comments
- Content detail pages with prompt/model metadata and discussion
- Bias reporting with primary and secondary categories
- Report status workflow: pending, reviewed, resolved, dismissed
- Dashboard charts for categories, models, status, timelines, and top prompts
- Admin panel for managing users, content, reports, and report statuses

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Axios
- Recharts
- Lucide React

Backend:
- Node.js
- Express
- MySQL
- JWT
- Multer
- dotenv

## Project Structure

```text
client/
  src/
    components/
    context/
    pages/
    services/

server/
  config/
  controllers/
  middleware/
  routes/
  uploads/
  schema.sql
```

## Setup

See [SETUP.md](./SETUP.md) for full setup instructions.

Quick start:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

## Environment Variables

Copy the example files and update them for your machine:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Database

Create the MySQL database and tables with:

```bash
mysql -u your_mysql_username -p < server/schema.sql
```

The backend also includes startup checks for newer columns used by the app, such as report status and file upload support.

## Main Routes

Frontend:
- `/`
- `/feed`
- `/content/:id`
- `/upload`
- `/report/:id`
- `/dashboard`
- `/profile`
- `/admin`

Backend:
- `/api/auth`
- `/api/content`
- `/api/comments`
- `/api/likes`
- `/api/reports`
- `/api/admin`

## Notes For GitHub

- Real `.env` files are ignored.
- `node_modules` and build output are ignored.
- Runtime uploads are ignored, but `server/uploads/.gitkeep` keeps the folder in the repo.
- Add screenshots to this README before final submission if you want the repository to look more polished.
