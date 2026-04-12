/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { Logger } from 'vonosan/server'

const green = (s: string) => `\x1b[32m${s}\x1b[0m`
const red = (s: string) => `\x1b[31m${s}\x1b[0m`
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`

/** Known installable Vonosan modules */
const KNOWN_MODULES: Record<string, string> = {
  auth: '@vonosan/auth',
  notifications: '@vonosan/notifications',
  logging: '@vonosan/logging',
  ws: '@vonosan/ws',
  storage: '@vonosan/storage',
  queue: '@vonosan/queue',
  cache: '@vonosan/cache',
  email: '@vonosan/email',
  i18n: '@vonosan/i18n',
}

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() })
}

function addFrontendScaffold(): void {
  const cwd = process.cwd()
  const pkgPath = join(cwd, 'package.json')

  if (!existsSync(pkgPath)) {
    process.stderr.write(red('Cannot add frontend: package.json not found in current directory.\n'))
    process.exit(1)
  }

  const rawPkg = readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(rawPkg) as {
    name?: string
    scripts?: Record<string, string>
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  const projectName = pkg.name ?? 'vonosan-app'

  const files: Record<string, string> = {
    'index.html': `<!DOCTYPE html>
<html lang="en" class="h-full">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body class="h-full">
    <div id="app" class="isolate"><!--ssr-outlet--></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
    'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vonosan } from 'vonosan/vite'
import vonoConfig from './vonosan.config.js'

export default defineConfig({
  plugins: [vue(), ...vonosan(vonoConfig)],
})
`,
    'src/App.vue': `<template>
  <UApp>
    <RouterView />
  </UApp>
</template>
`,
    'src/main.ts': `import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createUnhead } from '@unhead/vue'
import App from './App.vue'
import { createRouter } from './router.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  const head = createUnhead()
  const router = createRouter()

  app.use(pinia)
  app.use(head)
  app.use(router)

  return { app, pinia, head, router }
}
`,
    'src/router.ts': `import { createRouter as _createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('./modules/home/index.page.vue'),
  },
]

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  })
}
`,
    'src/modules/home/index.page.vue': `<template>
  <main>
    <h1>${projectName}</h1>
    <p>Welcome to your Vonosan app.</p>
  </main>
</template>
`,
    'src/route-rules.ts': `import type { RouteRules } from 'vonosan/server/route-rules'

export const routeRules: RouteRules = {
  '/': { mode: 'ssr', cache: 3600 },
  '/dashboard/**': { mode: 'spa' },
  '/admin/**': { mode: 'spa' },
}
`,
    'src/env.d.ts': `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
}
`,
  }

  for (const [relPath, content] of Object.entries(files)) {
    const absPath = join(cwd, relPath)
    if (existsSync(absPath)) {
      process.stdout.write(yellow(`  Skipped ${relPath} (already exists)\n`))
      continue
    }

    mkdirSync(dirname(absPath), { recursive: true })
    writeFileSync(absPath, content, 'utf8')
    process.stdout.write(green(`  Created ${relPath}\n`))
  }

  pkg.scripts = pkg.scripts ?? {}
  pkg.scripts.dev = 'vite --host 0.0.0.0 --port 4000'
  pkg.scripts.build = 'vite build'
  pkg.scripts.preview = 'vite preview --host 0.0.0.0 --port 4000'

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  process.stdout.write(green('  Updated package.json scripts for frontend runtime\n'))

  try {
    run('bun add vue vue-router pinia @unhead/vue @nuxt/ui')
    run('bun add -d vite @vitejs/plugin-vue')
    process.stdout.write(green('✔ Frontend dependencies installed\n'))
  } catch {
    process.stdout.write(
      yellow('⚠ Could not install frontend dependencies automatically. Install them manually.\n'),
    )
  }

  process.stdout.write(green('✔ Frontend scaffold added. Run bun run dev\n'))
}

/**
 * Reads vonosan.config.ts and appends the module to the `modules` array.
 * This is a best-effort text manipulation — for a production implementation
 * you would use an AST transformer.
 */
function updateVonosanConfig(packageName: string): void {
  const configPath = join(process.cwd(), 'vonosan.config.ts')
  if (!existsSync(configPath)) return

  const content = readFileSync(configPath, 'utf8')

  // Idempotency check
  if (content.includes(packageName)) {
    process.stdout.write(yellow(`  vonosan.config.ts already references "${packageName}" — skipping.\n`))
    return
  }

  // Append to modules array if present, otherwise add a comment
  const updated = content.replace(
    /modules\s*:\s*\[([^\]]*)\]/,
    (match, inner) => `modules: [${inner.trim() ? inner + ',\n    ' : '\n    '}// ${packageName} — configure here\n  ]`,
  )

  if (updated !== content) {
    writeFileSync(configPath, updated, 'utf8')
    process.stdout.write(green(`  Updated vonosan.config.ts\n`))
  }
}

/**
 * `vonosan add <module> [--eject]`
 *
 * - Installs the @vonosan/<module> package
 * - Generates required files
 * - Updates vonosan.config.ts (idempotent)
 *
 * With `--eject`: copies module source into src/modules/<module>/ and
 * removes the package dependency.
 */
export async function runAdd(args: string[]): Promise<void> {
  const eject = args.includes('--eject')
  const moduleArgs = args.filter(a => !a.startsWith('--'))
  const [moduleName, ...extra] = moduleArgs

  if (!moduleName) {
    process.stderr.write(red('Usage: vonosan add <module> [--eject]\n'))
    process.stderr.write(`  Known modules: ${Object.keys(KNOWN_MODULES).join(', ')}\n`)
    process.exit(1)
  }

  if (moduleName === 'frontend') {
    if (eject) {
      process.stderr.write(red('`vonosan add frontend --eject` is not supported.\n'))
      process.exit(1)
    }

    process.stdout.write(bold('Adding frontend scaffold (Vue + Vite) …\n'))
    addFrontendScaffold()
    return
  }

  const packageName = KNOWN_MODULES[moduleName] ?? `@vonosan/${moduleName}`

  process.stdout.write(bold(`Adding module "${moduleName}" (${packageName}) …\n`))

  if (eject) {
    await ejectModule(moduleName, packageName)
    return
  }

  // Install package
  try {
    run(`bun add ${packageName}`)
    process.stdout.write(green(`✔ Installed ${packageName}\n`))
  } catch {
    process.stderr.write(
      yellow(`⚠  Could not install ${packageName} — it may not be published yet.\n`),
    )
  }

  // Update vonosan.config.ts
  updateVonosanConfig(packageName)

  process.stdout.write(
    green(`\n✔ Module "${moduleName}" added. Configure it in vonosan.config.ts.\n`),
  )
}

/**
 * Ejects a module: copies its source into src/modules/<module>/ and removes
 * the package dependency.
 */
async function ejectModule(moduleName: string, packageName: string): Promise<void> {
  const nodeModulesPath = join(process.cwd(), 'node_modules', packageName, 'src')
  const targetDir = join(process.cwd(), 'src', 'modules', moduleName)

  if (existsSync(targetDir)) {
    process.stderr.write(
      red(`Module source already ejected at ${targetDir}. Remove it first.\n`),
    )
    process.exit(1)
  }

  if (!existsSync(nodeModulesPath)) {
    process.stderr.write(
      red(
        `Cannot eject: ${packageName} is not installed or has no src/ directory.\n` +
          `Run \`vonosan add ${moduleName}\` first.\n`,
      ),
    )
    process.exit(1)
  }

  mkdirSync(targetDir, { recursive: true })
  cpSync(nodeModulesPath, targetDir, { recursive: true })
  process.stdout.write(green(`✔ Ejected ${packageName} source to ${targetDir}\n`))

  // Remove the package dependency
  try {
    run(`bun remove ${packageName}`)
    process.stdout.write(green(`✔ Removed ${packageName} from dependencies\n`))
  } catch {
    process.stdout.write(yellow(`⚠  Could not remove ${packageName} — remove it manually.\n`))
  }

  // Update vonosan.config.ts to remove the package reference
  const configPath = join(process.cwd(), 'vonosan.config.ts')
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf8')
    const updated = content.replace(new RegExp(`import.*from.*${packageName}.*\\n`, 'g'), '')
    if (updated !== content) writeFileSync(configPath, updated, 'utf8')
  }

  process.stdout.write(
    green(`\n✔ Module "${moduleName}" ejected to src/modules/${moduleName}/\n`),
  )
}
