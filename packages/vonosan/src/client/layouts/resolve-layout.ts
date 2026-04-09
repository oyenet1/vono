/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */

import type { Component } from 'vue'

export type LayoutName = 'default' | 'dashboard' | 'auth' | 'blank' | undefined

/**
 * resolveLayout — returns the correct layout component for a given name.
 *
 * Returns null for 'blank' or undefined (no wrapper).
 * Returns a lazy-loaded component for named layouts.
 *
 * The actual .vue files live in the generated project's src/shared/layouts/.
 * This function is a runtime helper — the import paths are resolved by Vite
 * in the consuming project, not by tsc in the framework package.
 */
export function resolveLayout(
  layoutName: LayoutName,
  layoutMap?: Record<string, Component>,
): Component | null {
  if (!layoutName || layoutName === 'blank') return null

  // If a custom layout map is provided (from the consuming project), use it
  if (layoutMap && layoutMap[layoutName]) {
    return layoutMap[layoutName]
  }

  // Return null — the consuming project's App.vue handles layout resolution
  // via its own import.meta.glob of src/shared/layouts/*.vue
  return null
}
