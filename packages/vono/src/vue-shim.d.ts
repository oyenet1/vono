/**
 * Vue SFC shim — allows TypeScript to resolve *.vue imports.
 * The actual component types are provided by @vitejs/plugin-vue at build time.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@nuxt/ui/vue-plugin' {
  import type { Plugin } from 'vue'
  const ui: Plugin
  export default ui
  export { ui }
}
