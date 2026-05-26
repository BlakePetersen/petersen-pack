# Contact Form Redesign: Glass Morphism & React Hook Form

**Date:** 2025-11-25
**Status:** Approved for Implementation

## Goal

Refactor the contact form to use React Hook Form and Zod for validation while applying glass morphism styling that matches the "Book a Session" CTA button.

## Current State

The contact form uses manual state management with React `useState` for form data, field errors, and touched fields. Validation runs manually on blur and change events. The form works but requires ~500 lines of imperative code to manage state and validation.

## Proposed Solution

### Technology Stack

Replace manual form management with:

- **React Hook Form** - Manages form state, validation triggers, and submission
- **Zod** - Declares validation rules in a schema
- **@hookform/resolvers/zod** - Bridges React Hook Form and Zod

Both libraries are already installed.

### Visual Design: Adaptive Glass Morphism

**Input Fields:**

- Default: Subtle frosted background `rgba(255, 255, 255, 0.1)` with thin border
- Focus: Enhanced backdrop blur, orange gradient border, ring glow
- Valid: Green border with checkmark icon on right
- Error: Red border with X icon on right
- All states transition smoothly over 300ms

**Error Messages:**

- Display below field with icon
- Glass morphic background with subtle backdrop blur
- Fade in animation

**Submit Button:**

- Already uses glass morphism (previous implementation)
- Centered with `max-w-md` constraint

### Technical Implementation

**Zod Schema:**

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
    ),
  serviceType: z.string().min(1, 'Please select a session type'),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'TEXT']),
  message: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)'),
})
```

**Form Setup:**

```typescript
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting, dirtyFields },
  reset,
} = useForm({
  resolver: zodResolver(contactFormSchema),
  mode: 'onBlur',
  defaultValues: {
    /* ... */
  },
})
```

**Phone Field:**
Use React Hook Form's `Controller` component to maintain phone formatting logic while integrating with form state.

**Preserved Behavior:**

- Honeypot spam protection (manual state, outside form)
- API submission to `/api/contact`
- Rate limit error handling
- Success state and tracking
- All ARIA labels and accessibility attributes
- Character counter on message field

### Code Reduction

Remove:

- All manual `useState` for form fields and errors
- Manual validation functions (replaced by Zod)
- Manual `onChange` handlers (React Hook Form handles this)
- Manual `touchedFields` tracking (built-in)

Result: ~50% less code with better type safety and performance.

### Component Structure

**GlassInput Pattern:**
Create inline styling patterns for inputs that:

- Apply glass morphism based on field state
- Show validation icons (CheckCircle2, XCircle from lucide-react)
- Handle dark mode automatically
- Accept `register()` props and error state

No separate component file needed - keep styles inline for maintainability.

### Submission Flow

```typescript
const onSubmit = async (data: ContactFormData) => {
  // Check honeypot
  if (honeypotValue) {
    setSubmitted(true)
    return
  }

  // Submit to API
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Handle rate limit and other errors
    }

    trackContactFormSubmit()
    setSubmitted(true)
    reset()
  } catch (err) {
    setError(err.message)
  }
}
```

### Accessibility

Maintain all existing accessibility features:

- `aria-invalid` on fields with errors
- `aria-describedby` linking fields to error messages
- `role="alert"` on error banners with `aria-live="assertive"`
- `role="status"` on success message with `aria-live="polite"`
- Proper label associations
- Keyboard navigation

### Testing Plan

**Manual Testing:**

1. Fill form and submit successfully
2. Trigger validation errors (empty fields, invalid email, short phone)
3. Test honeypot spam protection
4. Test rate limiting error display
5. Verify dark mode styling
6. Check mobile responsive behavior
7. Validate animations don't cause layout shift

**Browser Coverage:**

- Chrome, Safari, Firefox
- Mobile iOS/Android viewports
- Dark/light mode toggle

**Regression Checks:**

- Form submits to `/api/contact`
- Success tracking calls `trackContactFormSubmit()`
- Validation rules match current behavior
- Phone formatting works identically
- Honeypot protection functional

## Files Modified

- `components/luna/ContactForm.tsx` - Complete refactor

## Implementation Notes

- Use `transition-all duration-300` for smooth state transitions
- Icons animate with `animate-in fade-in-0 zoom-in-95 duration-200`
- Glass morphism uses `backdrop-blur-md` on focus
- Border colors use rgba with alpha for layering effect
- Preserve exact validation rules from current implementation
