# Design Patterns

Common patterns and best practices for building components in the Luna Design System.

## Component Patterns

### 1. Compound Components

Use compound components for complex UI where child components need to share state.

```typescript
// Parent component
export function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

// Child components
Tabs.List = function TabsList({ children }) { /* ... */ }
Tabs.Tab = function Tab({ index, children }) { /* ... */ }
Tabs.Panel = function TabPanel({ index, children }) { /* ... */ }

// Usage
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel index={0}>Content 1</Tabs.Panel>
  <Tabs.Panel index={1}>Content 2</Tabs.Panel>
</Tabs>
```

### 2. Polymorphic Components

Allow components to render as different HTML elements.

```typescript
type AsProp<C extends React.ElementType> = {
  as?: C
}

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P)

export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

export function Heading<C extends React.ElementType = 'h2'>({
  as,
  className,
  children,
  ...props
}: PolymorphicComponentProp<C, { className?: string }>) {
  const Component = as || 'h2'
  return <Component className={className} {...props}>{children}</Component>
}

// Usage
<Heading as="h1">Title</Heading>
<Heading as="h3">Subtitle</Heading>
```

### 3. Controlled vs Uncontrolled

Provide both controlled and uncontrolled versions when appropriate.

```typescript
export function Input({
  value,
  defaultValue,
  onChange,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  // Controlled if value is provided
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e)
  }

  return <input value={inputValue} onChange={handleChange} {...props} />
}
```

### 4. Render Props

Use for flexible rendering with shared logic.

```typescript
interface RenderPropExample {
  data: Data[]
  children: (item: Data, index: number) => React.ReactNode
}

export function List({ data, children }: RenderPropExample) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={item.id}>{children(item, index)}</li>
      ))}
    </ul>
  )
}

// Usage
<List data={items}>
  {(item, index) => (
    <div>
      <h3>{item.title}</h3>
      <p>Item #{index + 1}</p>
    </div>
  )}
</List>
```

### 5. Composition Over Props

Prefer composition to boolean props for variations.

```typescript
// ❌ Bad: Too many boolean props
<Card hasHeader hasBorder hasFooter isElevated />

// ✅ Good: Composition
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    Content here
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

## Styling Patterns

### 1. Variant-Based Styling

Use variants for predictable style variations.

```typescript
const buttonVariants = {
  default: 'bg-gray-900 text-white hover:bg-gray-800',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
} as const

export interface ButtonProps {
  variant?: keyof typeof buttonVariants
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-semibold transition-colors',
        buttonVariants[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}
```

### 2. Design Tokens

Always use design tokens for spacing, colors, and typography.

```typescript
// ❌ Bad: Magic numbers
<div className="px-4 py-2 text-base">

// ✅ Good: Design tokens
<div className="px-gutter py-2 text-body-md">
```

### 3. Responsive Patterns

Mobile-first responsive design.

```typescript
// Mobile first, then tablet, desktop
<div className="
  flex flex-col gap-4
  md:flex-row md:gap-6
  lg:gap-8
">
```

## State Management Patterns

### 1. URL State for Filters

Use URL search params for shareable state.

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function GalleryFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const filter = searchParams.get('type') || 'all'

  const setFilter = (type: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('type', type)
    router.push(`?${params.toString()}`)
  }

  return <FilterNav value={filter} onChange={setFilter} />
}
```

### 2. Server State with Prisma

Fetch data in Server Components when possible.

```typescript
// app/galleries/page.tsx (Server Component)
export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    where: { featured: true },
    include: {
      images: { take: 1 },
      _count: { select: { images: true } }
    }
  })

  return <GalleryGrid galleries={galleries} />
}
```

### 3. Client State with Hooks

Use hooks for client-side interactive state.

```typescript
'use client'

export function ImageLightbox({ images }: { images: Image[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(images.length - 1, i + 1))
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isOpen, images.length])

  return (/* ... */)
}
```

## Accessibility Patterns

### 1. Semantic HTML

Use semantic elements for better accessibility.

```typescript
// ✅ Good: Semantic
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Bad: Generic divs
<div className="nav">
  <div className="nav-item" onClick={...}>About</div>
</div>
```

### 2. ARIA Labels

Provide context for screen readers.

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <XIcon className="h-5 w-5" aria-hidden="true" />
</button>
```

### 3. Keyboard Navigation

Ensure all interactive elements are keyboard accessible.

```typescript
export function MenuItem({ onClick }: { onClick: () => void }) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={handleKeyPress}
      className="cursor-pointer focus:outline-none focus:ring-2"
    >
      Menu Item
    </div>
  )
}
```

### 4. Focus Management

Manage focus for better UX.

```typescript
export function Modal({ isOpen, onClose }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus close button when modal opens
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <dialog open={isOpen} aria-modal="true">
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
      {/* ... */}
    </dialog>
  )
}
```

## Performance Patterns

### 1. Code Splitting

Use dynamic imports for large components.

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // Client-only if needed
})
```

### 2. Memoization

Memoize expensive computations.

```typescript
import { useMemo } from 'react'

export function GalleryGrid({ images }: { images: Image[] }) {
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [images])

  return <div>{/* render sortedImages */}</div>
}
```

### 3. Image Optimization

Use Next.js Image component.

```typescript
import Image from 'next/image'

<Image
  src={image.url}
  alt={image.altText}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 3} // LCP optimization
/>
```

## Error Handling Patterns

### 1. Error Boundaries

Catch React errors gracefully.

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  )
}
```

### 2. Form Validation

Client and server-side validation.

```typescript
// Client-side
const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
})

// Server action
export async function submitContact(formData: FormData) {
  const data = schema.parse({
    email: formData.get('email'),
    message: formData.get('message'),
  })

  // Process...
}
```

## Anti-Patterns to Avoid

### ❌ Don't Mix Concerns

```typescript
// Bad: Component does too much
export function UserProfile() {
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/user').then(/* ... */)
  }, [])

  const handleUpdate = () => {
    fetch('/api/user', { method: 'PUT' /* ... */ })
  }

  return (/* complex UI */)
}

// Good: Separate concerns
export function UserProfile() {
  const { user, isLoading } = useUser()
  return isLoading ? <Skeleton /> : <UserProfileView user={user} />
}
```

### ❌ Don't Inline Complex Logic

```typescript
// Bad
<div className={`px-4 ${isActive ? 'bg-blue-500' : 'bg-gray-200'} ${size === 'sm' ? 'py-2' : size === 'md' ? 'py-4' : 'py-6'}`}>

// Good
const classes = cn(
  'px-4',
  isActive ? 'bg-blue-500' : 'bg-gray-200',
  sizeClasses[size]
)
<div className={classes}>
```

### ❌ Don't Prop Drill

```typescript
// Bad: Passing props through many levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>

// Good: Context or composition
const DataContext = createContext()
<DataContext.Provider value={data}>
  <Parent>
    <Child>
      <GrandChild />
    </Child>
  </Parent>
</DataContext.Provider>
```
