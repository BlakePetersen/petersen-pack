# Linting & Code Quality

Standards and tools for maintaining code quality in the Luna Design System.

## Tools

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks for pre-commit checks

## ESLint Configuration

### Rules

Our ESLint configuration enforces:

1. **TypeScript strict mode**
2. **React best practices**
3. **Accessibility standards**
4. **Import organization**
5. **Consistent code style**

### Key Rules

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // React
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Accessibility
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        "components": ["Link"],
        "specialLink": ["hrefLeft", "hrefRight"],
        "aspects": ["invalidHref", "preferButton"]
      }
    ],

    // Imports
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }
    ]
  }
}
```

## Prettier Configuration

### Format Settings

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Formatting Commands

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check

# Format specific files
pnpm prettier --write "app/**/*.{ts,tsx}"
```

## TypeScript Configuration

### Strict Mode

We use TypeScript strict mode for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Safety Best Practices

#### 1. Avoid `any`

```typescript
// ❌ Bad
const data: any = fetchData()

// ✅ Good
interface User {
  id: string
  name: string
  email: string
}
const data: User = await fetchData()

// ✅ Also good for unknown shapes
const data: unknown = await fetchData()
if (isUser(data)) {
  // Type guard
  console.log(data.email)
}
```

#### 2. Use Type Guards

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  )
}
```

#### 3. Leverage Type Inference

```typescript
// ❌ Unnecessary type annotation
const name: string = 'John'

// ✅ Let TypeScript infer
const name = 'John'

// ✅ Do annotate function returns
function getUser(): Promise<User> {
  return prisma.user.findFirst()
}
```

#### 4. Use Discriminated Unions

```typescript
type Success<T> = {
  status: 'success'
  data: T
}

type Error = {
  status: 'error'
  error: string
}

type Result<T> = Success<T> | Error

function handleResult(result: Result<User>) {
  if (result.status === 'success') {
    // TypeScript knows result.data exists
    console.log(result.data)
  } else {
    // TypeScript knows result.error exists
    console.error(result.error)
  }
}
```

## Code Style Guidelines

### Naming Conventions

```typescript
// Components: PascalCase
export function UserProfile() {}

// Hooks: camelCase with 'use' prefix
export function useUser() {}

// Utilities: camelCase
export function formatDate() {}

// Constants: UPPER_SNAKE_CASE
export const MAX_UPLOAD_SIZE = 5_000_000

// Types/Interfaces: PascalCase
export interface UserProps {}
export type Status = 'pending' | 'active'

// Private variables: camelCase with _ prefix
const _internalCache = new Map()
```

### File Organization

```
components/
├── commons/              # Shared primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   └── index.ts         # Barrel export
├── luna/                # Public components
│   ├── HeroCarousel.tsx
│   └── index.ts
└── sol/                 # Admin components
    ├── DataTable.tsx
    └── index.ts
```

### Import Order

```typescript
// 1. External libraries
import { useState } from 'react'
import Link from 'next/link'

// 2. Internal modules
import { Button } from '@/components/commons/Button'
import { useUser } from '@/lib/hooks/useUser'

// 3. Types
import type { User } from '@/types'

// 4. Relative imports
import { helper } from './utils'

// 5. Styles (if any)
import styles from './Component.module.css'
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react'
import type { ComponentProps } from './types'

// 2. Types
export interface MyComponentProps {
  title: string
  onAction?: () => void
}

// 3. Constants
const DEFAULT_TIMEOUT = 3000

// 4. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState(false)

  // Derived state
  const isActive = state && title.length > 0

  // Event handlers
  const handleClick = () => {
    setState(true)
    onAction?.()
  }

  // Render
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  )
}

// 5. Subcomponents (if any)
MyComponent.Header = function Header() {}

// 6. Helper functions
function helperFunction() {}
```

## ABOUTME Comments

Every file should start with ABOUTME comments:

```typescript
// ABOUTME: Component description
// ABOUTME: Usage context and purpose

export function MyComponent() {
  // ...
}
```

**Rules**:

- Two lines maximum
- Start with "ABOUTME: "
- First line: What the file does
- Second line: Context/purpose
- Keep it concise

**Examples**:

```typescript
// ABOUTME: Button primitive component with variants
// ABOUTME: Foundation for all clickable actions in the design system

// ABOUTME: User authentication hook
// ABOUTME: Manages login state and session handling

// ABOUTME: Date formatting utilities
// ABOUTME: Consistent date display across the application
```

## Pre-commit Hooks

### Husky Configuration

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## Running Checks

### Individual Checks

```bash
# TypeScript type checking
pnpm tsc --noEmit

# ESLint
pnpm lint

# Prettier
pnpm format:check

# All checks
pnpm check
```

### Fix Issues

```bash
# Auto-fix ESLint issues
pnpm lint --fix

# Auto-format with Prettier
pnpm format

# Fix everything
pnpm fix
```

## Common Issues & Fixes

### Issue: Unused Variables

```typescript
// ❌ ESLint error
function Component({ name, email, phone }) {
  return <div>{name}</div>
}

// ✅ Fix: Prefix with underscore
function Component({ name, email: _email, phone: _phone }) {
  return <div>{name}</div>
}

// ✅ Better: Destructure only what you need
function Component({ name }) {
  return <div>{name}</div>
}
```

### Issue: Missing Dependencies

```typescript
// ❌ ESLint warning
useEffect(() => {
  fetchData(userId)
}, [])

// ✅ Fix: Add dependency
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ Or: Use useCallback if function changes
const fetchData = useCallback((id: string) => {
  // ...
}, [])

useEffect(() => {
  fetchData(userId)
}, [fetchData, userId])
```

### Issue: Accessibility

```typescript
// ❌ Missing alt text
<img src={url} />

// ✅ Fix: Add alt text
<img src={url} alt={description} />

// ❌ Click handler on div
<div onClick={handleClick}>Click me</div>

// ✅ Fix: Use button
<button onClick={handleClick}>Click me</button>

// ❌ Missing label
<input type="text" />

// ✅ Fix: Add label
<label>
  Email
  <input type="email" />
</label>
```

### Issue: Import Order

```typescript
// ❌ Unsorted imports
import { helper } from './utils'
import { useState } from 'react'
import { Button } from '@/components/Button'

// ✅ Fix: Sort imports
import { useState } from 'react'

import { Button } from '@/components/Button'

import { helper } from './utils'
```

## Code Quality Metrics

### Goals

- **TypeScript**: 100% strict mode compliance
- **ESLint**: 0 errors, 0 warnings
- **Prettier**: 100% formatted
- **Test Coverage**: 80%+ for components
- **Accessibility**: 0 automated violations

### CI/CD Checks

All pull requests must pass:

1. ✅ TypeScript compilation
2. ✅ ESLint (no errors)
3. ✅ Prettier (all files formatted)
4. ✅ Tests passing
5. ✅ Build succeeds

## Editor Setup

### VS Code

Recommended settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Recommended extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

## Enforcement

### Pre-commit

- Husky runs lint-staged
- Auto-fixes what it can
- Blocks commit if unfixable errors

### Pre-push

- Full test suite runs
- Build must succeed
- All checks must pass

### CI/CD

- Lint check
- Type check
- Build check
- Test check
- Deploy only if all pass

## Best Practices Summary

1. ✅ **Always run checks before committing**
2. ✅ **Fix errors immediately, don't accumulate**
3. ✅ **Use auto-fix when available**
4. ✅ **Write types, don't use `any`**
5. ✅ **Follow naming conventions**
6. ✅ **Keep imports organized**
7. ✅ **Add ABOUTME comments**
8. ✅ **Make code accessible**
9. ✅ **Format consistently**
10. ✅ **Review your own code first**
