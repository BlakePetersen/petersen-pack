# Contact Form Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor ContactForm component to use React Hook Form + Zod validation with glass morphism styling matching the Book a Session button.

**Architecture:** Replace manual state management with React Hook Form's useForm hook. Validation logic moves from imperative functions to declarative Zod schema. Apply adaptive glass morphism styling with validation icons.

**Tech Stack:** React Hook Form 7.66.0, Zod 4.1.12, @hookform/resolvers 5.2.2, lucide-react (already installed)

---

## Task 1: Create Zod Schema

**Files:**

- Modify: `components/luna/ContactForm.tsx:1-10`

**Step 1: Add imports**

At the top of ContactForm.tsx, add:

```typescript
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, XCircle } from 'lucide-react'
```

**Step 2: Define Zod schema**

After the imports, before the component, add:

```typescript
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\(\)\.]+$/.test(val),
      'Please enter a valid phone number'
    )
    .refine(
      (val) =>
        !val ||
        val.replace(/\D/g, '').length === 0 ||
        val.replace(/\D/g, '').length >= 10,
      'Phone number must be at least 10 digits'
    ),
  serviceType: z.string().min(1, 'Please select a session type'),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'TEXT']),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Please provide more details (at least 10 characters)'),
})

type ContactFormData = z.infer<typeof contactFormSchema>
```

**Step 3: Verify no TypeScript errors**

Run: `pnpm type-check`
Expected: No errors in ContactForm.tsx

**Step 4: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "feat(contact): add Zod validation schema"
```

---

## Task 2: Replace State Management with React Hook Form

**Files:**

- Modify: `components/luna/ContactForm.tsx:9-27`

**Step 1: Replace useState with useForm**

Remove these lines:

```typescript
const [formData, setFormData] = useState({...})
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
```

Add after other useState declarations:

```typescript
const {
  register,
  handleSubmit,
  control,
  watch,
  formState: { errors, isSubmitting, dirtyFields },
  reset,
} = useForm<ContactFormData>({
  resolver: zodResolver(contactFormSchema),
  mode: 'onBlur',
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    preferredContactMethod: 'EMAIL',
    message: '',
  },
})

const formValues = watch()
```

**Step 2: Remove validation functions**

Delete these functions entirely:

- `validateEmail`
- `validatePhone`
- `formatPhone` (we'll add this back as a standalone function)
- `getFieldClassName` (we'll recreate this)
- `validateField`
- `handleBlur`
- `validateForm`

**Step 3: Re-add formatPhone as standalone**

Add before the component:

```typescript
const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}
```

**Step 4: Verify TypeScript**

Run: `pnpm type-check`
Expected: Errors about missing functions (we'll fix in next tasks)

**Step 5: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): replace manual state with React Hook Form"
```

---

## Task 3: Create Glass Morphism Field Styling Helper

**Files:**

- Modify: `components/luna/ContactForm.tsx` (add helper function)

**Step 1: Add getGlassFieldClasses function**

Add before the component:

```typescript
const getGlassFieldClasses = (
  hasError: boolean,
  isDirty: boolean,
  hasValue: boolean
): string => {
  const baseClasses =
    'w-full rounded-lg border-2 px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-500 focus:outline-none focus:ring-4 dark:text-white dark:placeholder:text-gray-400'

  // Default state
  let stateClasses =
    'bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10'

  // Focus state
  const focusClasses =
    'focus:bg-white/20 dark:focus:bg-black/30 focus:backdrop-blur-md focus:border-orange-400/50 focus:ring-orange-100/50 dark:focus:ring-orange-900/50'

  if (hasError) {
    stateClasses =
      'border-red-400/50 bg-red-50/80 dark:bg-red-950/30 focus:border-red-500/50 focus:ring-red-200/50 dark:focus:ring-red-900/50'
  } else if (isDirty && hasValue) {
    stateClasses =
      'border-green-400/40 bg-green-50/50 dark:bg-green-950/20 dark:border-green-600/40'
  }

  return `${baseClasses} ${stateClasses} ${focusClasses}`
}
```

**Step 2: Verify TypeScript**

Run: `pnpm type-check`
Expected: No errors for this helper

**Step 3: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "feat(contact): add glass morphism field styling helper"
```

---

## Task 4: Update Form Submit Handler

**Files:**

- Modify: `components/luna/ContactForm.tsx` (handleSubmit function)

**Step 1: Replace handleSubmit function**

Replace the existing `handleSubmit` function with:

```typescript
const onSubmit = async (data: ContactFormData) => {
  setError('')

  // Honeypot spam check
  if (honeypot) {
    console.warn('Spam detected via honeypot')
    setSubmitted(true)
    return
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      if (result.error === 'Rate limit exceeded') {
        throw new Error(
          'Too many submissions. Please wait a few minutes and try again.'
        )
      }
      throw new Error(result.error || 'Failed to send message')
    }

    trackContactFormSubmit()
    setSubmitted(true)
    reset()
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to send message. Please try calling instead.'
    )
  }
}
```

**Step 2: Update form tag**

Change the form opening tag from:

```typescript
<form onSubmit={handleSubmit} ...>
```

To:

```typescript
<form onSubmit={handleSubmit(onSubmit)} ...>
```

**Step 3: Verify TypeScript**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): update submit handler for React Hook Form"
```

---

## Task 5: Refactor Name Field with Glass Styling

**Files:**

- Modify: `components/luna/ContactForm.tsx` (name input section)

**Step 1: Replace name input**

Replace the entire name field div (lines ~247-289) with:

```typescript
<div className="relative">
  <label
    htmlFor="contact-name"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Name *
  </label>
  <div className="relative">
    <input
      id="contact-name"
      type="text"
      {...register('name')}
      className={getGlassFieldClasses(
        !!errors.name,
        !!dirtyFields.name,
        !!formValues.name
      )}
      placeholder="Your name"
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? 'name-error' : undefined}
    />
    {/* Validation Icon */}
    {dirtyFields.name && formValues.name && !errors.name && (
      <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-green-500 duration-200 dark:text-green-400" />
    )}
    {errors.name && (
      <XCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-red-500 duration-200 dark:text-red-400" />
    )}
  </div>
  {errors.name && (
    <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
      <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.name.message}
      </p>
    </div>
  )}
</div>
```

**Step 2: Test in browser**

1. Start dev server: `pnpm dev`
2. Navigate to `/contact`
3. Type in name field
4. Tab out - should see green checkmark
5. Clear field and tab out - should see red X with error

**Step 3: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): add glass morphism styling to name field"
```

---

## Task 6: Refactor Email Field

**Files:**

- Modify: `components/luna/ContactForm.tsx` (email input section)

**Step 1: Replace email input**

Replace the email field div with:

```typescript
<div className="relative">
  <label
    htmlFor="contact-email"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Email *
  </label>
  <div className="relative">
    <input
      id="contact-email"
      type="email"
      {...register('email')}
      className={getGlassFieldClasses(
        !!errors.email,
        !!dirtyFields.email,
        !!formValues.email
      )}
      placeholder="your@email.com"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'email-error' : undefined}
    />
    {dirtyFields.email && formValues.email && !errors.email && (
      <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-green-500 duration-200 dark:text-green-400" />
    )}
    {errors.email && (
      <XCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-red-500 duration-200 dark:text-red-400" />
    )}
  </div>
  {errors.email && (
    <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
      <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.email.message}
      </p>
    </div>
  )}
</div>
```

**Step 2: Test validation**

1. Enter invalid email (e.g., "test")
2. Tab out - should see red X
3. Enter valid email
4. Should see green checkmark

**Step 3: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): add glass morphism styling to email field"
```

---

## Task 7: Refactor Phone Field with Controller

**Files:**

- Modify: `components/luna/ContactForm.tsx` (phone input section)

**Step 1: Replace phone input with Controller**

Replace the phone field div with:

```typescript
<div className="relative">
  <label
    htmlFor="contact-phone"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Phone
  </label>
  <Controller
    name="phone"
    control={control}
    render={({ field }) => (
      <div className="relative">
        <input
          id="contact-phone"
          type="tel"
          value={field.value || ''}
          onChange={(e) => {
            const formatted = formatPhone(e.target.value)
            field.onChange(formatted)
          }}
          onBlur={field.onBlur}
          className={getGlassFieldClasses(
            !!errors.phone,
            !!dirtyFields.phone,
            !!field.value
          )}
          placeholder="(555) 123-4567"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {dirtyFields.phone && field.value && !errors.phone && (
          <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-green-500 duration-200 dark:text-green-400" />
        )}
        {errors.phone && (
          <XCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-red-500 duration-200 dark:text-red-400" />
        )}
      </div>
    )}
  />
  {errors.phone && (
    <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
      <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.phone.message}
      </p>
    </div>
  )}
</div>
```

**Step 2: Test phone formatting**

1. Type "5551234567"
2. Should auto-format to "(555) 123-4567"
3. Should show green checkmark when valid

**Step 3: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): add phone field with formatting via Controller"
```

---

## Task 8: Refactor Select Fields

**Files:**

- Modify: `components/luna/ContactForm.tsx` (select fields)

**Step 1: Replace preferred contact method select**

Replace the preferredContactMethod select with:

```typescript
<div>
  <label
    htmlFor="contact-preferred-method"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Preferred Contact Method *
  </label>
  <select
    id="contact-preferred-method"
    {...register('preferredContactMethod')}
    className={getGlassFieldClasses(
      false,
      !!dirtyFields.preferredContactMethod,
      !!formValues.preferredContactMethod
    )}
  >
    <option value="EMAIL">Email</option>
    <option value="PHONE">Phone</option>
    <option value="TEXT">Text Message</option>
  </select>
</div>
```

**Step 2: Replace service type select**

Replace the serviceType select with:

```typescript
<div>
  <label
    htmlFor="contact-service-type"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Session Type *
  </label>
  <div className="relative">
    <select
      id="contact-service-type"
      {...register('serviceType')}
      className={getGlassFieldClasses(
        !!errors.serviceType,
        !!dirtyFields.serviceType,
        !!formValues.serviceType
      )}
      aria-invalid={!!errors.serviceType}
      aria-describedby={errors.serviceType ? 'service-type-error' : undefined}
    >
      <option value="">Select a session type</option>
      <option value="Family Portrait">Family Portrait</option>
      <option value="Headshots">Headshots</option>
      <option value="Branding">Branding</option>
      <option value="Boudoir">Boudoir</option>
      <option value="Pet Photography">Pet Photography</option>
      <option value="Yoga/Dance">Yoga/Dance</option>
      <option value="Underwater">Underwater</option>
      <option value="Other">Other</option>
    </select>
    {dirtyFields.serviceType && formValues.serviceType && !errors.serviceType && (
      <CheckCircle2 className="pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-green-500 duration-200 dark:text-green-400" />
    )}
    {errors.serviceType && (
      <XCircle className="pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 text-red-500 duration-200 dark:text-red-400" />
    )}
  </div>
  {errors.serviceType && (
    <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
      <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.serviceType.message}
      </p>
    </div>
  )}
</div>
```

**Step 3: Test select validation**

1. Leave service type empty and submit
2. Should see error message
3. Select a type - error should clear

**Step 4: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): add glass styling to select fields"
```

---

## Task 9: Refactor Message Textarea

**Files:**

- Modify: `components/luna/ContactForm.tsx` (message textarea)

**Step 1: Replace message textarea**

Replace the message field with:

```typescript
<div>
  <label
    htmlFor="contact-message"
    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
  >
    Message *
  </label>
  <div className="relative">
    <textarea
      id="contact-message"
      {...register('message')}
      rows={6}
      className={`${getGlassFieldClasses(
        !!errors.message,
        !!dirtyFields.message,
        !!formValues.message
      )} resize-none`}
      placeholder="Tell me about your session ideas, preferred dates, or any questions..."
      aria-invalid={!!errors.message}
      aria-describedby={errors.message ? 'message-error' : undefined}
    />
    {dirtyFields.message && formValues.message && !errors.message && (
      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 animate-in fade-in-0 zoom-in-95 text-green-500 duration-200 dark:text-green-400" />
    )}
    {errors.message && (
      <XCircle className="absolute right-3 top-3 h-5 w-5 animate-in fade-in-0 zoom-in-95 text-red-500 duration-200 dark:text-red-400" />
    )}
  </div>
  {errors.message && (
    <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
      <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.message.message}
      </p>
    </div>
  )}
  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
    {formValues.message?.length || 0} characters (minimum 10)
  </p>
</div>
```

**Step 2: Test character counter**

1. Type in message field
2. Counter should update in real-time
3. Shows error if less than 10 characters

**Step 3: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): add glass styling to message textarea"
```

---

## Task 10: Update Submit Button State

**Files:**

- Modify: `components/luna/ContactForm.tsx` (submit button)

**Step 1: Update button disabled state**

The button is already styled with glass morphism. Just verify it uses the correct disabled state from React Hook Form.

The button should already have:

```typescript
disabled = { isSubmitting }
```

This `isSubmitting` now comes from `formState` instead of local state.

**Step 2: Test full form submission**

1. Fill out all required fields with valid data
2. Click submit
3. Button should show "Sending..." spinner
4. On success, should show success message
5. Form should reset

**Step 3: Test validation on submit**

1. Leave fields empty
2. Click submit
3. Should see error messages on all required fields
4. Fill in fields one by one
5. Errors should clear as fields become valid

**Step 4: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): verify submit button state handling"
```

---

## Task 11: Clean Up Unused Code

**Files:**

- Modify: `components/luna/ContactForm.tsx`

**Step 1: Remove old state**

Verify these are removed:

- `formData` state
- `fieldErrors` state
- `touchedFields` state

**Step 2: Keep required state**

Verify these remain:

- `isSubmitting` - now from formState
- `submitted` - manual state for success screen
- `error` - manual state for API errors
- `honeypot` - manual state for spam protection

**Step 3: Run full type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Run linter**

Run: `pnpm lint`
Expected: No errors or warnings

**Step 5: Commit**

```bash
git add components/luna/ContactForm.tsx
git commit -m "refactor(contact): remove unused state and cleanup"
```

---

## Task 12: Manual Testing

**Files:**

- Test: Manual testing in browser

**Step 1: Start dev server**

Run: `pnpm dev`
Navigate to: `http://localhost:3333/contact`

**Step 2: Test happy path**

1. Fill name: "Test User"
2. Fill email: "test@example.com"
3. Fill phone: "5551234567" (should format)
4. Select service type: "Headshots"
5. Write message: "This is a test message with enough characters"
6. Submit form
7. Should see success message

**Step 3: Test validation**

1. Reload page
2. Click submit without filling anything
3. Should see errors on all required fields
4. Fill each field incorrectly:
   - Email: "notanemail"
   - Phone: "123"
   - Message: "short"
5. Should see appropriate error messages
6. Fix each field
7. Errors should clear with green checkmarks

**Step 4: Test phone formatting**

1. Type: "5551234567"
2. Should auto-format to: "(555) 123-4567"
3. Type: "555123"
4. Should format to: "(555) 123"

**Step 5: Test dark mode**

1. Toggle dark mode (if available)
2. All glass morphism should adjust
3. Error messages should be readable
4. Icons should be visible

**Step 6: Document any issues**

Create a note of any bugs found for fixing.

---

## Task 13: Final Commit and Push

**Files:**

- All modified files

**Step 1: Run final checks**

```bash
pnpm lint
pnpm type-check
```

Expected: No errors

**Step 2: Review all changes**

```bash
git diff main
```

Review the full diff to ensure:

- No debugging code left
- No commented code
- All TODOs addressed

**Step 3: Final commit if needed**

If any cleanup needed:

```bash
git add .
git commit -m "chore(contact): final cleanup"
```

**Step 4: Create summary commit**

```bash
git log --oneline main..HEAD
```

Review commit history. Should show progression:

- Add schema
- Replace state management
- Add styling helper
- Refactor each field
- Cleanup

**Step 5: Push to remote**

```bash
git push origin main
```

---

## Verification Checklist

After implementation, verify:

- [ ] All form fields use React Hook Form registration
- [ ] Validation shows errors on blur
- [ ] Validation clears when fields become valid
- [ ] Green checkmark appears for valid fields
- [ ] Red X appears for invalid fields
- [ ] Phone number formats automatically
- [ ] Glass morphism effects visible on focus
- [ ] Submit button disabled during submission
- [ ] Success message shows after submission
- [ ] Form resets after successful submission
- [ ] Honeypot spam protection still works
- [ ] API errors display correctly
- [ ] Dark mode styling works
- [ ] All accessibility attributes present
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Character counter updates in real-time

## Notes

- Total estimated time: 60-90 minutes
- Each task is 5-10 minutes
- Commit frequently (after each task)
- Test thoroughly before final push
- The glass morphism creates a cohesive visual language with the submit button
