/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */

import type { Hono } from 'hono'

/**
 * Auto-discovers and mounts all routes.ts files from src/modules.
 *
 * Pass the result of import.meta.glob from your Vite project:
 *
 *   const mods = import.meta.glob('/src/modules/' + '*' + '/' + '*.routes.ts', { eager: true })
 *   await autoRegisterRoutes(api, mods)
 */
export async function autoRegisterRoutes(
  app: Hono,
  modules: Record<string, { default?: Hono }>,
): Promise<void> {
  for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(/\/modules\/([^/]+)\//)
    if (!match) continue

    const prefix = `/${match[1]}`
    if (!mod.default) continue

    app.route(prefix, mod.default)
  }
}
