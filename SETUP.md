# CoS-BA Bias Auditor — Local Setup

These instructions run the MySQL database, Express API, and Vite client locally. Run commands from the repository root unless a step says otherwise.

## Prerequisites

- Node.js and npm
- A running MySQL server
- The MySQL command-line client (`mysql`) available on your `PATH`
- Two terminals for the backend and frontend development servers

## 1. Install Dependencies

```bash
cd server
npm install

cd ../client
npm install

cd ..
```

## 2. Configure Environment Variables

Copy the tracked examples, then replace the placeholder database password and JWT secret with local values.

macOS/Linux/Git Bash:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

`server/.env`:

```dotenv
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cos_ba
JWT_SECRET=replace_with_a_long_random_secret
```

`client/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Keep both real `.env` files local; they are ignored by Git.

## 3. Create the MySQL Database

The schema creates the `cos_ba` database and the `users`, `content`, `reports`, `comments`, and `likes` tables.

macOS/Linux/Git Bash:

```bash
mysql -u root -p < server/schema.sql
```

Windows PowerShell (using `cmd` for input redirection):

```powershell
cmd /c "mysql -u root -p < server\schema.sql"
```

Change `root` if `DB_USER` uses a different MySQL account. The credentials and database name in `server/.env` must match the database you just configured.

## 4. Start the Backend

Start the API first so that it can connect to MySQL:

```bash
cd server
npm run dev
```

The API defaults to `http://localhost:5000`. A successful startup logs both the server port and the MySQL connection.

`CLIENT_URL` must match the Vite origin shown in the frontend terminal. The default Vite origin is `http://localhost:5173`.

For a non-watching process, use `npm start` instead.

## 5. Start the Frontend

In a second terminal, from the repository root:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite. The client sends API requests to the `VITE_API_URL` configured above.

## 6. Optional: Enable the First Administrator

New registrations receive the `user` role. After registering an account through the application, a local database owner can promote the first administrator:

```bash
mysql -u root -p -D cos_ba -e "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Sign out and sign back in after changing the role so the new JWT contains `admin`. Further administrator accounts can then be created or promoted from the admin panel.

## 7. Validate the Client

From `client/`:

```bash
npm run lint
npm run build
```

There is currently no automated backend test suite. To verify the backend, start it with a configured MySQL database and confirm that the connection succeeds and `http://localhost:5000` responds.

## Troubleshooting

- **Database connection error:** Confirm MySQL is running and that all `DB_*` values match your local account and schema.
- **`mysql` is not recognized:** Add the MySQL client directory to `PATH`, or invoke `mysql.exe` by its full path.
- **Unauthorized API response:** Sign in again and confirm `JWT_SECRET` is set consistently for the running backend.
- **Uploads fail:** Start the backend from `server/`; the application stores local files in `server/uploads/`.
- **Client cannot reach the API:** Confirm the backend port, `VITE_API_URL`, and backend `CLIENT_URL`, then restart the relevant process after editing an `.env` file.
