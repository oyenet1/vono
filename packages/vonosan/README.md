# Vonosan

The full-stack TypeScript framework for Vue + Hono — batteries included.

Vonosan gives you SSR, composables, server middleware, database integration, jobs, email, storage, auth, and a powerful CLI — all wired together with Vite.

## Getting Started

### Create a New Project

```bash
# bun (recommended)
bun create vonosan@latest my-app

# npm
npm create vonosan@latest my-app

# pnpm
pnpm create vonosan@latest my-app
```

The interactive wizard walks you through choosing your stack:

- **Language** — TypeScript or JavaScript
- **Project type** — Full-stack (Vue + Hono SSR) or API-only
- **Deployment** — Bun, Node.js, Docker, Cloudflare Workers, Vercel, Netlify, Deno, AWS Lambda
- **Database** — PostgreSQL, MySQL, SQLite, or none
- **Queue** — BullMQ, Cloudflare Queues, or none
- **Cache** — Upstash Redis, ioredis, Cloudflare KV, or none
- **Email** — Resend, Postmark, SMTP, or console
- **Storage** — Local, R2, S3, Cloudinary, Bunny CDN, or none
- **Features** — WebSocket, notifications, logging, auth, roles, API docs, SaaS mode

### Manual Installation

```bash
bun add vonosan
bun add -D @vonosan/cli
```

## Package Exports

Vonosan ships as a single package with multiple entry points:

| Import Path        | What It Provides                                              |
| ------------------ | ------------------------------------------------------------- |
| `vonosan`          | Config — `defineVonosanConfig()`, `useVonosanConfig()`, env helpers |
| `vonosan/vite`     | Vite plugin — SSR, auto-imports, dev server, HMR              |
| `vonosan/server`   | Server runtime — Hono app factory, middleware, utilities       |
| `vonosan/client`   | Vue composables — `useAsyncData`, `useCookie`, `useState`, etc. |
| `vonosan/types`    | Shared TypeScript interfaces and types                        |

---

## Configuration

Create a `vonosan.config.ts` at your project root:

```ts
import { defineVonosanConfig } from 'vonosan'

export default defineVonosanConfig({
  appName: 'My App',
  port: 4000,
  database: {
    driver: 'postgres',
    url: process.env.DATABASE_URL!,
  },
  email: { driver: 'resend', apiKey: process.env.RESEND_API_KEY! },
  storage: { driver: 'r2', bucket: 'my-bucket' },
  cache: { driver: 'upstash', url: process.env.UPSTASH_REDIS_URL! },
})
```

Access config anywhere:

```ts
import { useVonosanConfig } from 'vonosan'

const config = useVonosanConfig()
console.log(config.appName)
```

---

## Vite Plugin

```ts
// vite.config.ts
import { vonosanPlugin } from 'vonosan/vite'

export default {
  plugins: [vonosanPlugin()],
}
```

The plugin handles SSR setup, auto-imports, module registration, dev server proxy, and HMR.

---

## Server (`vonosan/server`)

### App Factory

```ts
import { createVonosanApp } from 'vonosan/server'

const app = createVonosanApp()

app.get('/api/hello', (c) => {
  return c.json(success({ message: 'Hello from Vonosan!' }))
})

export default app
```

### Response Helpers

```ts
import { success, error, buildPaginationMeta } from 'vonosan/server'

// Success response
return c.json(success(data))

// Error response
return c.json(error('Not found'), 404)

// Paginated response
return c.json(success(items, buildPaginationMeta(total, page, perPage)))
```

### Middleware

```ts
import { zodValidator, configProvider, dbProvider } from 'vonosan/server'
import { z } from 'zod'

// Validate request body
app.post('/api/users', zodValidator('json', z.object({
  name: z.string(),
  email: z.string().email(),
})), handler)

// Rate limiting
import { authRateLimiter, apiRateLimiter } from 'vonosan/server'
app.use('/api/auth/*', authRateLimiter)
app.use('/api/*', apiRateLimiter)
```

### Authorization (Gates & Policies)

```ts
import { gate, policy, authorize } from 'vonosan/server'

// Define a gate
registerGate('admin', (user) => user.role === 'admin')

// Use in routes
app.delete('/api/posts/:id', authorize('admin'), handler)
```

### Storage

```ts
import { useStorage } from 'vonosan/server'

const storage = useStorage()
const result = await storage.upload(file, { path: 'avatars/' })
const url = result.url
```

Drivers: Local, R2, S3, Cloudinary, Bunny CDN.

### Jobs / Cron

```ts
import { defineJob, startJobs } from 'vonosan/server'

const cleanupJob = defineJob({
  name: 'cleanup-expired-tokens',
  schedule: '0 * * * *', // every hour
  handler: async (ctx) => {
    // your logic
  },
})

startJobs([cleanupJob])
```

### Email

```ts
import { defineEmail, sendEmail } from 'vonosan/server'

const welcomeEmail = defineEmail({
  subject: 'Welcome!',
  template: (data) => `<h1>Hello ${data.name}</h1>`,
})

await sendEmail(welcomeEmail, { to: 'user@example.com', data: { name: 'Fade' } })
```

Drivers: Resend, Postmark, SMTP, Console.

### Soft Deletes

```ts
import { withSoftDeletes, softDelete, restore } from 'vonosan/server'

// Query with soft delete support
const users = await withSoftDeletes(db.select().from(usersTable))
await softDelete(db, usersTable, userId)
await restore(db, usersTable, userId)
```

### Logger

```ts
import { Logger } from 'vonosan/server'

Logger.info('User created', { userId: 123 })
Logger.error('Payment failed', { orderId: 'abc' })
```

---

## Client Composables (`vonosan/client`)

### `useAsyncData`

Fetch data with SSR support and automatic caching:

```ts
const { data, pending, error, refresh } = await useAsyncData(
  'users',
  () => fetch('/api/users').then(r => r.json())
)
```

### `useVonosanFetch`

Typed fetch wrapper:

```ts
const { data, error } = await useVonosanFetch('/api/posts')
```

### `useState`

SSR-safe shared reactive state:

```ts
const count = useState('counter', () => 0)
count.value++
```

### `useCookie`

Read and write cookies reactively:

```ts
const token = useCookie('auth-token')
token.value = 'abc123'
```

### `useSeo`

Set page meta and SEO tags:

```ts
useSeo({
  title: 'My Page',
  description: 'Welcome to my app',
  ogImage: '/og.png',
})
```

### `navigateTo`

Programmatic navigation (works in SSR and client):

```ts
navigateTo('/dashboard')
navigateTo('/login', { redirect: true })
```

### `useFormErrors`

Map server validation errors to form fields:

```ts
const { errors, setErrors, clearErrors } = useFormErrors()
// After API call:
setErrors(response.errors)
```

### `useRouteRules`

Access route-level metadata:

```ts
const rules = useRouteRules()
```

---

## CLI (`@vonosan/cli`)

Install the CLI as a dev dependency:

```bash
bun add -D @vonosan/cli
```

Run commands with `bun vonosan <command>` or `npx vonosan <command>`.

### Code Generators

Scaffold files with a single command:

```bash
vonosan make:module   posts        # Full module (routes, controller, service, dto, schema, pages, tests)
vonosan make:service  email        # Service only
vonosan make:controller payment    # Controller only
vonosan make:dto      invoice      # DTO with Zod validation
vonosan make:routes   webhook      # Routes file
vonosan make:schema   posts        # Drizzle database schema
vonosan make:middleware tenant     # Middleware
vonosan make:page     posts/Edit   # Vue page
vonosan make:component posts/Card  # Vue component
vonosan make:composable posts/use  # Vue composable
vonosan make:store    cart         # Pinia store
vonosan make:migration add-roles   # SQL migration
vonosan make:seed     users        # Database seed
vonosan make:test     posts        # Test file
vonosan make:notification welcome  # Notification
vonosan make:resource posts        # API response transformer
vonosan make:policy   posts        # Authorization policy
vonosan make:job      cleanup      # Cron job
vonosan make:email    welcome      # Email template
vonosan make:helper   currency     # Shared utility
vonosan make:version  v2           # API version namespace
```

### Database & Migrations

```bash
vonosan migrate:make  add-users    # Generate migration from schema diff
vonosan migrate:run                # Apply pending migrations
vonosan migrate:rollback           # Roll back last migration
vonosan migrate:status             # Show migration status
vonosan migrate:reset              # Rollback all, then re-run
vonosan migrate:fresh --seed       # Drop all, re-run, seed

vonosan db:push                    # Push schema directly (no migration)
vonosan db:studio                  # Open Drizzle Studio
vonosan db:seed                    # Run seed files
vonosan schema:sync                # Regenerate schema barrel file
```

### Module Installer

Add optional modules to your project:

```bash
vonosan add auth                   # Install @vonosan/auth
vonosan add notifications          # Install @vonosan/notifications
vonosan add logging                # Install @vonosan/logging
vonosan add ws                     # Install @vonosan/ws

vonosan add auth --eject           # Copy module source into your project
```

### Linting & Auditing

```bash
vonosan lint                       # Scan for violations (headers, logs, naming, DRY)
vonosan fix:headers                # Auto-inject missing file headers
vonosan fix:logs                   # Replace console.* with Logger.*
vonosan audit                      # Full audit report
vonosan audit --fix                # Audit and auto-fix
```

### Git Automation

```bash
vonosan branch:new  user-auth      # Create feature/user-auth branch
vonosan branch:finish               # Merge feature branch back
vonosan commit "feat: add login"    # Validate Conventional Commits and commit
```

### Environment Variables

```bash
vonosan env:add DATABASE_URL "PostgreSQL connection string"
# → Appends to both .env and .env.example
```

### Jobs

```bash
vonosan jobs:run cleanup-tokens     # Execute a named cron job immediately
```

### Testing

```bash
vonosan test                        # Run test suite
vonosan test:clean                  # Clean test artifacts and re-run
```

### Upgrade

```bash
vonosan upgrade:check               # Check for available updates
vonosan upgrade:apply-codemods      # Apply version migration codemods
```

---

## Optional Modules

| Package                  | Description                          | Install                        |
| ------------------------ | ------------------------------------ | ------------------------------ |
| `@vonosan/auth`          | JWT auth, password reset, roles, passkeys | `vonosan add auth`        |
| `@vonosan/drizzle`       | Database integration (Drizzle ORM)   | Included with database setup   |
| `@vonosan/notifications` | In-app notification system           | `vonosan add notifications`    |
| `@vonosan/logging`       | Activity and audit logging           | `vonosan add logging`          |
| `@vonosan/ws`            | WebSocket support                    | `vonosan add ws`               |

---

## Project Structure

A typical Vonosan project looks like this:

```
my-app/
├── src/
│   ├── modules/           # Feature modules
│   │   └── posts/
│   │       ├── posts.routes.ts
│   │       ├── posts.controller.ts
│   │       ├── posts.service.ts
│   │       ├── posts.dto.ts
│   │       ├── posts.schema.ts
│   │       └── pages/
│   │           └── Index.page.vue
│   ├── db/
│   │   ├── schema.ts      # Barrel file (auto-generated)
│   │   └── migrations/
│   ├── shared/
│   │   └── helpers/
│   └── app.ts             # Hono app entry
├── vonosan.config.ts
├── vite.config.ts
├── index.html
└── package.json
```

---

## Peer Dependencies

- **Required**: `vue >= 3.5`, `vue-router >= 5.0`
- **Optional**: `hono`, `@unhead/vue`, `pinia`, `drizzle-orm`, `zod`

## License

MIT © Bowofade Oyerinde
