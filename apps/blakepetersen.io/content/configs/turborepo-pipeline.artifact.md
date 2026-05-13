---
name: Turborepo Pipeline
description: turbo.json pipeline for pnpm/Next.js monorepo with content-hash caching, dependsOn DAG, env passthroughs, and persistent dev task
type: config
merge: replace
destination: turbo.json
devDependencies:
  turbo: '^2.5.0'
---

{
"$schema": "https://turborepo.com/schema.json",
"ui": "tui",
"globalDependencies": [
"pnpm-lock.yaml",
".env",
".env.local",
"tsconfig.base.json"
],
"globalPassThroughEnv": [
"CI",
"CI_RUN_ID",
"VERCEL",
"VERCEL_ENV"
],
"tasks": {
"build": {
"dependsOn": ["^build"],
"outputs": [
".next/**",
"!.next/cache/**",
"dist/**",
".velite/**",
"public/pagefind/**"
],
"env": [
"NODE_ENV",
"NEXT_PUBLIC_SITE_URL",
"NEXT_PUBLIC_ANALYTICS_ID",
"DATABASE_URL"
]
},
"test": {
"dependsOn": ["^build"],
"outputs": ["coverage/**"],
"env": ["NODE_ENV"]
},
"lint": {
"dependsOn": ["^topo"],
"outputs": []
},
"typecheck": {
"dependsOn": ["^topo"],
"outputs": []
},
"format": {
"outputs": []
},
"dev": {
"persistent": true,
"cache": false,
"dependsOn": []
},
"clean": {
"cache": false
}
}
}
