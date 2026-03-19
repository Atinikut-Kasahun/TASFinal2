# Guide: How to Update the IP Address

If your machine's Local IP address changes (e.g., you move to a different Wi-Fi network), you need to update it in these **3 main locations** for the project to keep working on your mobile device.

### 1. Backend Environment (`backend/.env`)
Update the IP in these two lines:
- `APP_URL=http://192.168.1.65:8081`
- `FRONTEND_URL=http://192.168.1.65:3000`

### 2. Frontend API Config (`src/lib/api.ts`)
Update the `defaultHost` at the very top of the file:
- `const defaultHost = "192.168.1.65";`

### 3. Backend CORS Settings (`backend/app/Http/Middleware/CorsMiddleware.php`)
Update the IP addresses in the `$allowedOrigins` array (lines 21-23):
```php
'http://192.168.1.65:3000',
'http://192.168.1.65:3001',
'http://192.168.1.65:3002',
```

---

### How to find your current IP?
1. Open PowerShell.
2. Type `ipconfig`.
3. Look for **IPv4 Address** under your Wi-Fi adapter. It usually starts with `192.168...`.
