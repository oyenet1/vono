# vonosan

Vonosan core runtime — config, composables, SSR helpers, and Vite plugin for building fullstack Vue applications.

## Features

- 🔧 **Vite Plugin** — First-class Vite integration for dev and production builds
- 🖥️ **SSR Helpers** — Server-side rendering utilities with streaming support
- 🧩 **Composables** — Vue composables for state, head, routing, and more
- 🌐 **Server Runtime** — Hono-based server with middleware, sessions, and DB integration
- 📦 **Module System** — Extensible module architecture

## Installation

```bash
npm install vonosan
```

## Exports

| Entry         | Description                        |
| ------------- | ---------------------------------- |
| `vonosan`        | Core config and shared utilities   |
| `vonosan/vite`   | Vite plugin                        |
| `vonosan/server` | Server runtime (Hono, middleware)  |
| `vonosan/client` | Client-side composables            |
| `vonosan/types`  | TypeScript type definitions        |

## Quick Start

```ts
// vite.config.ts
import { vonosanPlugin } from "vonosan/vite";

export default {
  plugins: [vonosanPlugin()],
};
```

## Peer Dependencies

- **Required**: `vue`, `vue-router`
- **Optional**: `hono`, `@unhead/vue`, `pinia`, `drizzle-orm`, `zod`

## License

MIT © Bowofade Oyerinde
