/**
 * Type stubs for optional peer dependencies.
 * These packages are installed by the consuming project, not the framework.
 * The stubs allow tsc to compile without errors.
 */

declare module 'vite' {
  export interface Plugin { name: string; [key: string]: unknown }
  export interface UserConfig { [key: string]: unknown }
  export function defineConfig(config: UserConfig): UserConfig
}

declare module '@hono/vite-dev-server' {
  import type { Plugin } from 'vite'
  function devServer(options: { entry: string; exclude?: unknown[] }): Plugin
  export default devServer
}

declare module '@vitejs/plugin-vue' {
  import type { Plugin } from 'vite'
  function vue(options?: unknown): Plugin
  export default vue
}

declare module 'vue-router/vite' {
  import type { Plugin } from 'vite'
  function VueRouter(options?: unknown): Plugin
  export default VueRouter
}

declare module 'unplugin-auto-import/vite' {
  import type { Plugin } from 'vite'
  function AutoImport(options?: unknown): Plugin
  export default AutoImport
}

declare module 'unplugin-vue-components/vite' {
  import type { Plugin } from 'vite'
  function Components(options?: unknown): Plugin
  export default Components
}

declare module '@nuxt/ui/vite' {
  import type { Plugin } from 'vite'
  function ui(options?: unknown): Plugin
  export default ui
}

declare module 'nodemailer' {
  export interface Transporter {
    sendMail(options: unknown): Promise<unknown>
  }
  export function createTransport(options: unknown): Transporter
}

declare module 'node-cron' {
  export function schedule(expression: string, handler: () => void | Promise<void>): { stop(): void }
  export function validate(expression: string): boolean
}

declare module '@aws-sdk/client-s3' {
  export class S3Client { constructor(config: unknown); send(cmd: unknown): Promise<unknown> }
  export class PutObjectCommand { constructor(input: unknown) }
  export class DeleteObjectCommand { constructor(input: unknown) }
  export class GetObjectCommand { constructor(input: unknown) }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: unknown, command: unknown, options?: unknown): Promise<string>
}
