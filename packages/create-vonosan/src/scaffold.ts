/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { WizardAnswers } from './wizard.js'
import { generateTemplates } from './templates.js'

// ─── scaffoldProject ─────────────────────────────────────────────────

/**
 * scaffoldProject — writes all generated project files to disk.
 *
 * @throws Error if targetDir already exists
 */
export function scaffoldProject(answers: WizardAnswers, targetDir: string): void {
  const absTarget = join(process.cwd(), targetDir)

  if (existsSync(absTarget)) {
    throw new Error(
      `Directory "${targetDir}" already exists. ` +
        `Choose a different project name or remove the existing directory.`,
    )
  }

  const templates = generateTemplates(answers)

  for (const [relPath, content] of Object.entries(templates)) {
    const absPath = join(absTarget, relPath)
    const dir = dirname(absPath)

    mkdirSync(dir, { recursive: true })
    writeFileSync(absPath, content, 'utf8')
  }

  // Safety fallback: ensure the default home page exists for full-stack apps.
  if (answers.projectType === 'fullstack') {
    const homePagePath = join(absTarget, 'src/modules/home/index.page.vue')
    if (!existsSync(homePagePath)) {
      mkdirSync(dirname(homePagePath), { recursive: true })
      writeFileSync(
        homePagePath,
        `<template>\n  <div class="landing">\n    <header class="topbar">\n      <p class="brand">${answers.projectName}</p>\n    </header>\n\n    <section class="hero">\n      <p class="eyebrow">Welcome to Vonosan</p>\n      <h1>Build fast apps for every age and every audience.</h1>\n      <p class="subtext">A clean starter with a beautiful home page, ready for your product.</p>\n    </section>\n  </div>\n</template>\n\n<style scoped>\n.landing {\n  min-height: 100vh;\n  padding: 1.25rem;\n  color: #10243e;\n  font-family: \"Space Grotesk\", \"Nunito\", \"Segoe UI\", sans-serif;\n  background: radial-gradient(1000px 400px at 90% -10%, rgba(11, 109, 246, 0.18), transparent 60%), linear-gradient(180deg, #f8fafc, #eef6ff);\n}\n.topbar {\n  max-width: 1080px;\n  margin: 0 auto;\n}\n.brand {\n  margin: 0;\n  font-weight: 700;\n}\n.hero {\n  max-width: 1080px;\n  margin: 3rem auto 0;\n}\n.eyebrow {\n  margin: 0;\n  color: #0b6df6;\n  font-size: 0.8rem;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n.hero h1 {\n  margin: 0.6rem 0 0;\n  font-size: clamp(1.9rem, 4vw, 3rem);\n}\n.subtext {\n  max-width: 60ch;\n  color: #4a5f7a;\n  line-height: 1.6;\n}\n</style>\n`,
        'utf8',
      )
    }
  }

  // Create standard empty directories
  const emptyDirs = [
    'src/modules',
    'src/shared/utils',
    'src/shared/gates',
    'src/shared/policies',
    'src/emails',
    'src/jobs',
    'src/locales',
    'src/db/migrations',
    'src/db/seeds',
    'public',
    'logs',
  ]

  for (const dir of emptyDirs) {
    mkdirSync(join(absTarget, dir), { recursive: true })
    // Add .gitkeep so empty dirs are tracked
    writeFileSync(join(absTarget, dir, '.gitkeep'), '', 'utf8')
  }
}
