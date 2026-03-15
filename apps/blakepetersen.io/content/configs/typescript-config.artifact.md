---
name: TypeScript Strict Config
description: Strict TypeScript configuration for modern Node.js and bundler projects
type: config
merge: section
destination: tsconfig.json
---

{
"compilerOptions": {
"target": "ES2022",
"module": "ESNext",
"moduleResolution": "bundler",

    // Strict type-checking
    "strict": true,
    // Catch unsafe bracket notation on arrays and records
    "noUncheckedIndexedAccess": true,
    // Distinguish between undefined and missing properties
    "exactOptionalPropertyTypes": true,
    // Enforce type-only imports use the `type` keyword
    "verbatimModuleSyntax": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Emit declarations for downstream consumers
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    // Let the bundler handle emit
    "noEmit": true

},
"include": ["src"],
"exclude": ["node_modules", "dist"]
}
