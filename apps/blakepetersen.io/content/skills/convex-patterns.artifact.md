---
name: Convex Patterns Starter
description: Working convex/schema.ts, auth.config.ts, and http.ts for a Clerk-backed reactive Convex app — drop-in, type-checks against Convex 1.x.
type: skill
merge: replace
destination: .claude/skills/convex-patterns.md
---

# Convex Patterns

Use these patterns for any Convex app. They cover schema-with-indexes, query/mutation/action separation, and Clerk-backed user provisioning. Functions are typed; the `_generated/` directory ships the `api` object that clients import.

## Schema

Declare every table in `convex/schema.ts`. Every column a query filters on needs an index — filter() scans the full table.

```ts
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    completed: v.boolean(),
    priority: v.optional(v.number()),
    userId: v.id('users')
  })
    .index('by_completed', ['completed'])
    .index('by_user', ['userId']),

  users: defineTable({
    name: v.string(),
    externalId: v.string()
  }).index('byExternalId', ['externalId'])
})
```

## Query / mutation / action

- **Query** — pure reads, reactive. Re-runs when underlying data changes.
- **Mutation** — transactional writes. Atomic, auto-retried on conflict.
- **Action** — external APIs, Node.js runtime. No direct `ctx.db` — use `ctx.runQuery` / `ctx.runMutation`.

```ts
// convex/tasks.ts
import { query, mutation, action, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const listForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tasks')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  }
})

export const create = mutation({
  args: { text: v.string(), userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tasks', {
      text: args.text,
      completed: false,
      userId: args.userId
    })
  }
})

export const getById = internalQuery({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => ctx.db.get(args.id)
})

export const enrich = action({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const task = await ctx.runQuery(internal.tasks.getById, { id: args.id })
    const result = await fetch('https://api.example.com/enrich', {
      method: 'POST',
      body: JSON.stringify({ text: task?.text })
    })
    return await result.json()
  }
})
```

Query terminators: `collect()`, `first()`, `unique()`, `take(n)`, `paginate(opts)`. Mutation `ctx.db`: `insert`, `patch`, `replace`, `delete`, `get`, `query`.

## Clerk integration

The JWT template in Clerk MUST be named `"convex"` — that's the name `ConvexProviderWithClerk` looks for.

```ts
// convex/auth.config.ts
import { AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex'
    }
  ]
} satisfies AuthConfig
```

Provision users via a Clerk webhook, never a lazy upsert in a query path.

```ts
// convex/http.ts
import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import type { WebhookEvent } from '@clerk/backend'
import { Webhook } from 'svix'

const http = httpRouter()

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request)
    if (!event) return new Response('Bad signature', { status: 400 })

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data
        })
        break
      case 'user.deleted':
        if (event.data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId: event.data.id
          })
        }
        break
    }

    return new Response(null, { status: 200 })
  })
})

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payload = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!
  }
  try {
    return new Webhook(process.env.CLERK_WEBHOOK_SECRET!).verify(
      payload,
      headers
    ) as unknown as WebhookEvent
  } catch {
    return null
  }
}

export default http
```

```ts
// convex/users.ts
import { internalMutation, QueryCtx } from './_generated/server'
import { v, Validator } from 'convex/values'
import type { UserJSON } from '@clerk/backend'

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const attrs = {
      name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
      externalId: data.id
    }
    const existing = await byExternalId(ctx, data.id)
    if (existing) {
      await ctx.db.patch(existing._id, attrs)
    } else {
      await ctx.db.insert('users', attrs)
    }
  }
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await byExternalId(ctx, clerkUserId)
    if (user) await ctx.db.delete(user._id)
  }
})

async function byExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', q => q.eq('externalId', externalId))
    .unique()
}
```

Set `CLERK_JWT_ISSUER_DOMAIN` and `CLERK_WEBHOOK_SECRET` (`whsec_...`) in the Convex dashboard. The webhook endpoint URL is `https://<deployment>.convex.site/clerk-users-webhook`. Add `svix` and `@clerk/backend` to your npm dependencies.

## Scheduling

```ts
import { mutation, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const sendExpiring = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('messages', { body: args.body })
    await ctx.scheduler.runAfter(5000, internal.messages.destruct, {
      id
    })
  }
})

export const destruct = internalMutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => ctx.db.delete(args.id)
})
```

`ctx.scheduler.runAfter(delayMs, ref, args)` — delay in ms.
`ctx.scheduler.runAt(timestampMs, ref, args)` — absolute epoch ms.
`ctx.scheduler.cancel(id)` — cancel a scheduled function.

Scheduled mutations: exactly-once (auto-retried). Scheduled actions: at-most-once. Always `await` scheduler calls so they land inside the triggering transaction.

## File storage

```ts
// convex/files.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation({
  args: {},
  handler: async ctx => ctx.storage.generateUploadUrl()
})

export const saveFile = mutation({
  args: { storageId: v.id('_storage'), userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.insert('uploads', {
      storageId: args.storageId,
      userId: args.userId
    })
  }
})
```

Client flow: `generateUploadUrl()` returns a short-lived URL → POST the file body to it → server returns `{ storageId }` → call `saveFile({ storageId, ... })`. Upload URLs expire after 1 hour; the upload POST has a 2-minute timeout. Serve files via `ctx.storage.getUrl(storageId)`.

## Next.js (App Router) wiring

```tsx
// app/ConvexClientProvider.tsx
'use client'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
```

Nest as `<ClerkProvider><ConvexProviderWithClerk>...</...></...>`. Convex needs Clerk context, so Clerk is outside.

## Expo / React Native

```tsx
// app/_layout.tsx
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { Stack } from 'expo-router'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false
})

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack />
    </ConvexProvider>
  )
}
```

The hooks (`useQuery` / `useMutation` / `useAction`) are identical across web and native. Only `EXPO_PUBLIC_CONVEX_URL` and the `unsavedChangesWarning: false` flag differ.

## Setup

```bash
npm install convex
npx convex dev    # interactive: creates project, writes .env.local, watches functions
npx convex deploy # production
npx convex env set KEY value
npx convex logs   # tail function logs
```

Commit `convex/_generated/` — clients consume `api` from it.
