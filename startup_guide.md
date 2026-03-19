# Professional Startup Guide

Follow this sequence to start your full-stack development environment correctly.

## 1. Start the Backend (Laravel)

Open a new terminal and run the following command. This uses the exact path to the PHP executable bundled with Laragon.

```powershell
# Navigate to the backend folder
cd C:\Users\eta\Documents\Projects\TASF18\TASFinal\backend

# Ensure dependencies are installed (Run this once if vendor folder is missing)
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" "C:\laragon\bin\composer\composer.phar" install

# Create storage symbolic link (Run this once to enable image uploads)
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan storage:link

# Start the server
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan serve --port=8081 --host=0.0.0.0
```

> [!IMPORTANT]
> Keep this terminal open! If you close it, the backend server will stop.

## 2. Start the Frontend (Next.js)

Open a second terminal and run:

```powershell
# Navigate to the TAS folder
cd C:\Users\eta\Documents\Projects\TASF18\TASFinal

# Start the development server
npm run dev -- --hostname 0.0.0.0
```

## 3. Database Check

The system is currently configured to use **SQLite**.

- Database file: `C:\Users\eta\Documents\Projects\TASF18\TASFinal\backend\database\database.sqlite`
- You don't need to start a separate database service for SQLite.

---

## 4. Troubleshooting Image Display

If applicant photos or site images are not appearing:

1. **Symbolic Link**: Run `php artisan storage:link` in the `backend` folder.
2. **App URL**: Ensure `APP_URL` in `backend/.env` is set to `http://192.168.1.65:8081`.
3. **Frontend Helper**: All images should use the `getStorageUrl(path)` helper from `src/lib/api.ts` to ensure correct path resolution.

### Connection Error ("NetworkError")

If the frontend shows a connection error:

1. Check if the Laravel terminal is still running.
2. Ensure the URL in `src/lib/api.ts` is exactly `http://192.168.1.65:8081/api`.
3. Verify that your device and the computer running the server are on the same Wi-Fi network.

---

# Guide: How to Update the IP Address

If your machine's Local IP address changes (e.g., you move to a different Wi-Fi network), you need to update it in these **3 main locations** for the project to keep working on your mobile device.

### 1. Backend Environment (`backend/.env`)

Update the IP in these two lines:

- `APP_URL=http://192.168.1.65:8081`
- `FRONTEND_URL=http://192.168.1.65:3000`

### 2. Frontend API Config (`src/lib/api.ts`)

Update the `defaultHost` at the very top of the file:

- `const defaultHost = "192.168.1.49";`

### 3. Backend CORS Settings (`backend/app/Http/Middleware/CorsMiddleware.php`)

Update the IP addresses in the `$allowedOrigins` array (lines 21-23):

```php
'http://192.168.1.49:3000',
'http://192.168.1.49:3001',
'http://192.168.1.49:3002',
```

---

### How to find your current IP?

1. Open PowerShell.
2. Type `ipconfig`.
3. Look for **IPv4 Address** under your Wi-Fi adapter. It usually starts with `192.168...`.
