# CoS-BA Setup

## 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

## 2. Configure environment variables

Copy the example files and update the values for your machine.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

## 3. Create the database

Run the included MySQL schema:

```bash
mysql -u your_mysql_username -p < server/schema.sql
```

## 4. Start the app

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

The frontend runs on the Vite URL shown in the terminal. The backend defaults to `http://localhost:5000`.

## 5. Verify

From `client/`:

```bash
npm run lint
npm run build
```

From `server/`, start the API and confirm it connects to MySQL:

```bash
npm run dev
```

## GitHub Notes

Do not commit real `.env` files, `node_modules`, `client/dist`, or files inside `server/uploads`. The root `.gitignore` excludes these.
