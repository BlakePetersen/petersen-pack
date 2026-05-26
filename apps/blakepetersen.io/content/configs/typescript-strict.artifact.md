---
name: TypeScript Strict Base Config
description: Strict tsconfig.base.json for a pnpm/Turbo monorepo with exactOptionalPropertyTypes and noUncheckedIndexedAccess enabled
type: config
merge: replace
destination: tsconfig.base.json
devDependencies:
  typescript: '^5.7.0'
---

{
"$schema": "https://json.schemastore.org/tsconfig",
"compilerOptions": {
"target": "es2022",
"lib": ["es2022", "dom", "dom.iterable"],
"module": "esnext",
"moduleResolution": "bundler",
"moduleDetection": "force",
"esModuleInterop": true,
"resolveJsonModule": true,
"isolatedModules": true,
"verbatimModuleSyntax": false,
"skipLibCheck": true,
"allowJs": false,
"checkJs": false,
"incremental": true,
"strict": true,
"exactOptionalPropertyTypes": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noFallthroughCasesInSwitch": true,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noPropertyAccessFromIndexSignature": false,
"forceConsistentCasingInFileNames": true,
"useDefineForClassFields": true,
"jsx": "preserve",
"allowSyntheticDefaultImports": true
},
"exclude": ["node_modules", "dist", ".next", ".turbo", "coverage"]
}
