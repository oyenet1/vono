/**
 * ──────────────────────────────────────────────────────────────────
 * 🏢 Company Name: Bonifade Technologies
 * 👨‍💻 Developer: Bowofade Oyerinde
 * 🐙 GitHub: oyenet1
 * 📅 Created Date: 2026-04-05
 * 🔄 Updated Date: 2026-04-05
 * ──────────────────────────────────────────────────────────────────
 */

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { AppVariables, AuthAccount } from 'vonosan/types'
import { Logger } from 'vonosan/server'
import { verifyToken } from '../lib/jwt.js'
import { accounts, apiKeys } from '../schema.js'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthVariables = AppVariables & { account: AuthAccount }
type AuthDb = PostgresJsDatabase<typeof import('../schema.js')>

// ─── authMiddleware ───────────────────────────────────────────────────────────

/**
 * `authMiddleware` — verifies the Bearer JWT, loads the account from DB,
 * and sets `c.var.account`. Returns 401 on missing/invalid token.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized: missing token' })
    }

    const token = authHeader.slice(7)
    const config = c.var.config
    const payload = await verifyToken(token, config.JWT_SECRET)

    if (!payload) {
      throw new HTTPException(401, { message: 'Unauthorized: invalid or expired token' })
    }

    if (!payload.sub) {
      throw new HTTPException(401, { message: 'Unauthorized: invalid token subject' })
    }

    const db = c.var.db as AuthDb

    // Load account from DB to get current roles/status
    const [account] = await db.select().from(accounts).where(eq(accounts.id, payload.sub)).limit(1)

    if (!account || account.status !== 'active') {
      throw new HTTPException(401, { message: 'Unauthorized: account not found or inactive' })
    }

    c.set('account', {
      id: account.id,
      email: account.email,
      username: account.username,
      currentRole: account.current_role as AuthAccount['currentRole'],
      roles: [account.current_role as AuthAccount['currentRole']],
      status: account.status,
      language: account.language,
    })

    await next()
  },
)

// ─── optionalAuthMiddleware ───────────────────────────────────────────────────

/**
 * `optionalAuthMiddleware` — silently continues as guest on invalid/missing token.
 * Does not set `c.var.account` if authentication fails.
 */
export const optionalAuthMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    try {
      const authHeader = c.req.header('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const config = c.var.config
        const payload = await verifyToken(token, config.JWT_SECRET)

        if (payload) {
          if (!payload.sub) {
            await next()
            return
          }

          const db = c.var.db as AuthDb
          const [account] = await db
            .select()
            .from(accounts)
            .where(eq(accounts.id, payload.sub))
            .limit(1)

          if (account && account.status === 'active') {
            c.set('account', {
              id: account.id,
              email: account.email,
              username: account.username,
              currentRole: account.current_role as AuthAccount['currentRole'],
              roles: [account.current_role as AuthAccount['currentRole']],
              status: account.status,
              language: account.language,
            })
          }
        }
      }
    } catch (err) {
      Logger.debug('[auth] optionalAuthMiddleware: silent failure', { error: String(err) })
    }

    await next()
  },
)

// ─── Role guards ──────────────────────────────────────────────────────────────

/**
 * `isAdmin` — 403 if the authenticated user is not admin or superadmin.
 * Must be used after `authMiddleware`.
 */
export const isAdmin = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const account = c.var.account
  if (!account) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  if (!['admin', 'superadmin'].includes(account.currentRole)) {
    throw new HTTPException(403, { message: 'Forbidden: admin access required' })
  }
  await next()
})

/**
 * `isSuperAdmin` — 403 if the authenticated user is not superadmin.
 * Must be used after `authMiddleware`.
 */
export const isSuperAdmin = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const account = c.var.account
    if (!account) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    if (account.currentRole !== 'superadmin') {
      throw new HTTPException(403, { message: 'Forbidden: superadmin access required' })
    }
    await next()
  },
)

// ─── apiKeyOrJwtMiddleware ────────────────────────────────────────────────────

/**
 * `apiKeyOrJwtMiddleware` — accepts either a Bearer JWT or a `vono_*` API key.
 * Sets `c.var.account` on success; returns 401 on failure.
 */
export const apiKeyOrJwtMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    const config = c.var.config
    const db = c.var.db as AuthDb

    // Try API key first (vono_ prefix)
    if (authHeader?.startsWith('Bearer vono_')) {
      const rawKey = authHeader.slice(7)

      // Hash the key for lookup
      const { hashOtp } = await import('../lib/otp.js')
      const keyHash = await hashOtp(rawKey)

      const [keyRow] = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash)).limit(1)

      if (!keyRow) {
        throw new HTTPException(401, { message: 'Unauthorized: invalid API key' })
      }

      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, keyRow.account_id))
        .limit(1)

      if (!account || account.status !== 'active') {
        throw new HTTPException(401, { message: 'Unauthorized: account inactive' })
      }

      // Update last_used_at asynchronously (fire-and-forget)
      db.update(apiKeys)
        .set({ last_used_at: new Date() })
        .where(eq(apiKeys.id, keyRow.id))
        .execute()
        .catch((err: unknown) => Logger.warn('[auth] Failed to update api key last_used_at', { error: String(err) }))

      c.set('account', {
        id: account.id,
        email: account.email,
        username: account.username,
        currentRole: account.current_role as AuthAccount['currentRole'],
        roles: [account.current_role as AuthAccount['currentRole']],
        status: account.status,
        language: account.language,
      })

      return next()
    }

    // Fall back to JWT
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const payload = await verifyToken(token, config.JWT_SECRET)

      if (!payload) {
        throw new HTTPException(401, { message: 'Unauthorized: invalid token' })
      }

      if (!payload.sub) {
        throw new HTTPException(401, { message: 'Unauthorized: invalid token subject' })
      }

      const [account] = await db.select().from(accounts).where(eq(accounts.id, payload.sub)).limit(1)

      if (!account || account.status !== 'active') {
        throw new HTTPException(401, { message: 'Unauthorized: account not found' })
      }

      c.set('account', {
        id: account.id,
        email: account.email,
        username: account.username,
        currentRole: account.current_role as AuthAccount['currentRole'],
        roles: [account.current_role as AuthAccount['currentRole']],
        status: account.status,
        language: account.language,
      })

      return next()
    }

    throw new HTTPException(401, { message: 'Unauthorized: no credentials provided' })
  },
)
