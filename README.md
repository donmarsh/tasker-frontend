This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Manual (non-Docker) Deployment

1. **Provision a host** – choose a VM or dedicated server with a Unix-like OS (Ubuntu, Debian, Amazon Linux, etc.).
2. **Install Node.js 20+ and pnpm** (matching the `engines` block in `package.json` if present). On Linux you can use the official NodeSource script, then `corepack enable` to bring in `pnpm`.
3. **Clone the repository** and switch to `main`.
	```bash
	git clone https://github.com/donmarsh/tasker-frontend.git
	cd tasker-frontend
	git checkout main
	```
4. **Install dependencies** without Docker.
	```bash
	pnpm install
	```
5. **Configure environment variables** (copy `.env.example` if it exists) and point them at your backend services and auth endpoints. At minimum set:
    - `NEXT_PUBLIC_API_URL` — base URL for the backend REST API (e.g. `https://api.example.com` or `http://localhost:8000/api`).

    Example `.env.local`:
    ```bash
    NEXT_PUBLIC_API_URL=https://api.example.com
    # NEXTAUTH_URL=https://app.example.com (optional)
    ```
6. **Build the project** for production.
	```bash
	pnpm build
	```
8. **Start the Next.js server** in production mode and keep it alive with a process manager like `pm2`, `systemd`, or `supervisord`.
	```bash
	pnpm start
	```
9. **Proxy traffic** from your reverse proxy (NGINX, Caddy) to `http://localhost:3000`. Ensure TLS termination happens at the proxy, then forward WebSocket/long-polling traffic for `/api` if required.
10. **Automate deployment** by pulling new commits, reinstalling dependencies, re-building, and restarting the process manager.

### Optional checks
- `pnpm lint` — run static checks before deploying.
- `pnpm test` — run tests if available (add your target test suite here).
- `pnpm dev` — locally iterate before pushing updates.

Maintaining a simple `deploy.sh` script that pulls, installs, builds, and restarts the process manager can keep this workflow repeatable.
