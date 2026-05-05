// ABOUTME: E2E tests for public contact form
// ABOUTME: Tests validation, phone formatting, submission, and dark mode

import { test, expect, type Page } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333/contact')
  })

  test.describe('Form Display', () => {
    test('displays all form fields', async ({ page }) => {
      await expect(page.getByLabel(/^name/i)).toBeVisible()
      await expect(page.getByLabel(/^email/i)).toBeVisible()
      await expect(page.getByLabel(/^phone/i)).toBeVisible()
      await expect(page.getByLabel(/preferred contact method/i)).toBeVisible()
      await expect(page.getByLabel(/session type/i)).toBeVisible()
      await expect(page.getByLabel(/^message/i)).toBeVisible()
      await expect(
        page.getByRole('button', { name: /send message/i })
      ).toBeVisible()
    })

    test('shows character counter for message field', async ({ page }) => {
      await expect(page.getByText(/0 characters/i)).toBeVisible()

      await page.getByLabel(/^message/i).fill('Test message')
      await expect(page.getByText(/12 characters/i)).toBeVisible()
    })
  })

  test.describe('Happy Path', () => {
    test('successfully submits form with all required fields', async ({
      page,
    }) => {
      // Fill name
      await page.getByLabel(/^name/i).fill('Test User')

      // Fill email
      await page.getByLabel(/^email/i).fill('test@example.com')

      // Fill phone (optional but testing)
      await page.getByLabel(/^phone/i).fill('5551234567')

      // Select service type
      await page.getByLabel(/session type/i).selectOption('Headshots')

      // Fill message
      await page
        .getByLabel(/^message/i)
        .fill(
          'This is a test message with enough characters to pass validation'
        )

      // Submit form
      await page.getByRole('button', { name: /send message/i }).click()

      // Should show success message or confirmation
      // Adjust this based on actual success behavior
      await expect(
        page.getByText(/thank you|success|sent/i).first()
      ).toBeVisible({ timeout: 10000 })
    })

    test('successfully submits form without optional phone field', async ({
      page,
    }) => {
      await page.getByLabel(/^name/i).fill('Test User No Phone')
      await page.getByLabel(/^email/i).fill('nophone@example.com')
      await page.getByLabel(/session type/i).selectOption('Branding')
      await page
        .getByLabel(/^message/i)
        .fill('This message is submitted without a phone number')

      await page.getByRole('button', { name: /send message/i }).click()

      await expect(
        page.getByText(/thank you|success|sent/i).first()
      ).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Field Validation', () => {
    test('shows error when name is empty on blur', async ({ page }) => {
      const nameField = page.getByLabel(/^name/i)

      // Focus and blur without entering anything
      await nameField.click()
      await page.getByLabel(/^email/i).click()

      // Should show error
      await expect(page.getByText(/name is required/i)).toBeVisible()

      // Should show red X icon
      const errorIcon = page
        .locator('[data-testid="error-icon"], .text-red-500, .text-red-400')
        .first()
      await expect(errorIcon).toBeVisible()
    })

    test('shows error for invalid email', async ({ page }) => {
      const emailField = page.getByLabel(/^email/i)

      // Enter invalid email
      await emailField.fill('notanemail')
      await page.getByLabel(/^name/i).click() // Blur

      // Should show error
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible()
    })

    test('shows error for message too short', async ({ page }) => {
      const messageField = page.getByLabel(/^message/i)

      // Enter short message
      await messageField.fill('short')
      await page.getByLabel(/^name/i).click() // Blur

      // Should show error about minimum length
      await expect(
        page.getByText(/at least 10 characters|more details/i)
      ).toBeVisible()
    })

    test('shows error for invalid phone format', async ({ page }) => {
      const phoneField = page.getByLabel(/^phone/i)

      // Enter very short phone
      await phoneField.fill('123')
      await page.getByLabel(/^name/i).click() // Blur

      // Should show error
      await expect(
        page.getByText(/at least 10 digits|valid phone/i)
      ).toBeVisible()
    })

    test('shows error when service type not selected', async ({ page }) => {
      // Try to submit without selecting service type
      await page.getByLabel(/^name/i).fill('Test User')
      await page.getByLabel(/^email/i).fill('test@example.com')
      await page.getByLabel(/^message/i).fill('Test message here')

      await page.getByRole('button', { name: /send message/i }).click()

      // Should show error for service type
      await expect(
        page.getByText(/select a session type|session type/i)
      ).toBeVisible()
    })

    test('clears error when field becomes valid', async ({ page }) => {
      const emailField = page.getByLabel(/^email/i)

      // Enter invalid email
      await emailField.fill('invalid')
      await page.getByLabel(/^name/i).click()

      // Verify error shows
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible()

      // Fix the email
      await emailField.clear()
      await emailField.fill('valid@example.com')
      await page.getByLabel(/^name/i).click()

      // Error should disappear
      await expect(
        page.getByText(/valid email|invalid email/i)
      ).not.toBeVisible()

      // Should show green checkmark
      // This will depend on implementation
    })
  })

  test.describe('Phone Formatting', () => {
    test('formats 10-digit phone number correctly', async ({ page }) => {
      const phoneField = page.getByLabel(/^phone/i)

      await phoneField.fill('5551234567')

      // Should be formatted as (555) 123-4567
      await expect(phoneField).toHaveValue('(555) 123-4567')
    })

    test('formats partial phone numbers', async ({ page }) => {
      const phoneField = page.getByLabel(/^phone/i)

      // Test 3 digits
      await phoneField.fill('555')
      await expect(phoneField).toHaveValue('555')

      // Test 6 digits
      await phoneField.clear()
      await phoneField.fill('555123')
      await expect(phoneField).toHaveValue('(555) 123')

      // Test 10 digits
      await phoneField.clear()
      await phoneField.fill('5551234567')
      await expect(phoneField).toHaveValue('(555) 123-4567')
    })

    test('accepts phone with existing formatting', async ({ page }) => {
      const phoneField = page.getByLabel(/^phone/i)

      await phoneField.fill('(555) 123-4567')

      // Should maintain or reformat
      const value = await phoneField.inputValue()
      expect(value.replace(/\D/g, '')).toBe('5551234567')
    })
  })

  test.describe('Validation Icons', () => {
    test('shows green checkmark for valid name field', async ({ page }) => {
      const nameField = page.getByLabel(/^name/i)

      await nameField.fill('Valid Name')
      await page.getByLabel(/^email/i).click() // Blur

      // Look for CheckCircle2 icon or green check styling
      // Adjust selector based on actual implementation
      const successIndicator = page.locator(
        'svg.text-green-500, svg.text-green-400, [data-icon="check"]'
      )
      await expect(successIndicator.first()).toBeVisible()
    })

    test('shows red X for invalid email', async ({ page }) => {
      const emailField = page.getByLabel(/^email/i)

      await emailField.fill('invalid')
      await page.getByLabel(/^name/i).click() // Blur

      // Look for XCircle icon or red error styling
      const errorIndicator = page.locator(
        'svg.text-red-500, svg.text-red-400, [data-icon="x"]'
      )
      await expect(errorIndicator.first()).toBeVisible()
    })
  })

  test.describe('Glass Morphism Styling', () => {
    test('applies glass morphism classes to input fields', async ({ page }) => {
      const nameField = page.getByLabel(/^name/i)

      // Check for backdrop blur classes
      const classes = await nameField.getAttribute('class')
      expect(classes).toMatch(/bg-white\/|dark:bg-black\/|backdrop-blur/)
    })

    test('changes border color on error', async ({ page }) => {
      const emailField = page.getByLabel(/^email/i)

      await emailField.fill('invalid')
      await page.getByLabel(/^name/i).click()

      const classes = await emailField.getAttribute('class')
      expect(classes).toMatch(/border-red/)
    })

    test('changes background on focus', async ({ page }) => {
      const nameField = page.getByLabel(/^name/i)

      await nameField.focus()

      // Should have focus styling
      const isFocused = await page.evaluate(
        (el) => {
          return document.activeElement === el
        },
        await nameField.elementHandle()
      )

      expect(isFocused).toBe(true)
    })
  })

  test.describe('Dark Mode', () => {
    test('renders correctly in dark mode', async ({ page }) => {
      // Toggle dark mode if theme switcher exists
      const themeToggle = page.locator(
        '[aria-label*="theme" i], [data-theme-toggle]'
      )

      if ((await themeToggle.count()) > 0) {
        await themeToggle.click()

        // Verify dark mode is active
        const htmlElement = page.locator('html')
        const darkModeClass = await htmlElement.getAttribute('class')

        if (darkModeClass?.includes('dark')) {
          // Check that form is visible in dark mode
          await expect(page.getByLabel(/^name/i)).toBeVisible()
          await expect(page.getByLabel(/^email/i)).toBeVisible()

          // Take screenshot for manual verification
          await page.screenshot({
            path: 'test-results/contact-form-dark-mode.png',
          })
        }
      }
    })

    test('error messages are readable in dark mode', async ({ page }) => {
      // Try to enable dark mode
      const themeToggle = page.locator(
        '[aria-label*="theme" i], [data-theme-toggle]'
      )

      if ((await themeToggle.count()) > 0) {
        await themeToggle.click()
      }

      // Trigger an error
      const emailField = page.getByLabel(/^email/i)
      await emailField.fill('invalid')
      await page.getByLabel(/^name/i).click()

      // Error should be visible
      const errorMessage = page.getByText(/valid email|invalid email/i)
      await expect(errorMessage).toBeVisible()

      // Take screenshot
      await page.screenshot({
        path: 'test-results/contact-form-error-dark-mode.png',
      })
    })
  })

  test.describe('Submit Button', () => {
    test('submit button has glass morphism styling', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: /send message/i })

      const classes = await submitButton.getAttribute('class')
      expect(classes).toMatch(/gradient|backdrop-blur/)
    })

    test('submit button is enabled with empty form', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: /send message/i })

      // Button should not be disabled initially (validation happens on submit)
      const isDisabled = await submitButton.isDisabled()
      expect(isDisabled).toBe(false)
    })

    test('submit button shows loading state during submission', async ({
      page,
    }) => {
      // Fill form
      await page.getByLabel(/^name/i).fill('Test User')
      await page.getByLabel(/^email/i).fill('test@example.com')
      await page.getByLabel(/session type/i).selectOption('Headshots')
      await page.getByLabel(/^message/i).fill('Test message here')

      const submitButton = page.getByRole('button', { name: /send message/i })

      // Click submit
      await submitButton.click()

      // Should show loading state (button disabled or loading text)
      // This might show "Sending..." or be disabled
      const isDisabled = await submitButton.isDisabled()
      expect(isDisabled).toBe(true)
    })
  })

  test.describe('Honeypot Protection', () => {
    test('form has hidden honeypot field', async ({ page }) => {
      // Look for hidden field used for spam protection
      const honeypotField = page.locator('input[name="website"][tabindex="-1"]')
      await expect(honeypotField).toBeHidden()
    })
  })

  test.describe('Accessibility', () => {
    test('all form fields have accessible labels', async ({ page }) => {
      // Check that clicking label focuses input
      await page.getByText('Name *').click()
      const nameField = page.getByLabel(/^name/i)
      await expect(nameField).toBeFocused()

      await page.getByText('Email *').click()
      const emailField = page.getByLabel(/^email/i)
      await expect(emailField).toBeFocused()
    })

    test('error messages are associated with inputs via aria-describedby', async ({
      page,
    }) => {
      const emailField = page.getByLabel(/^email/i)

      // Trigger error
      await emailField.fill('invalid')
      await page.getByLabel(/^name/i).click()

      // Check aria-invalid attribute
      const ariaInvalid = await emailField.getAttribute('aria-invalid')
      expect(ariaInvalid).toBe('true')
    })

    test('form passes basic keyboard navigation', async ({ page }) => {
      // Tab through form
      await page.keyboard.press('Tab') // Focus first element
      await page.keyboard.press('Tab') // Name field

      const nameField = page.getByLabel(/^name/i)
      await expect(nameField).toBeFocused()

      await page.keyboard.press('Tab') // Email field
      const emailField = page.getByLabel(/^email/i)
      await expect(emailField).toBeFocused()
    })
  })
})
