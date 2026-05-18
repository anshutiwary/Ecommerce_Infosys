# Node E-commerce Backend

Express + MongoDB backend module providing:

- JWT authentication (access + refresh tokens)
- Secure password hashing with bcrypt
- User profile update and password change
- Logout / session handling (refresh token revocation)
- Protected routes and token validation middleware
- User-specific order retrieval (order history)
- MVC-style controllers, routes, services, and models

Quick start:

```bash
cd node_backend
cp .env.example .env
# edit .env to point to your MongoDB
npm install
npm run dev
```

API overview (relative to server root):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/users/me`
- `PUT  /api/users/me`
- `PUT  /api/users/me/password`
- `GET  /api/orders` (user's orders)
- `GET  /api/orders/:id`

