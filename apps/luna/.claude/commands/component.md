---
argument-hint: <category/ComponentName>
---

Scaffold a new component with Storybook story and optional test file.

Usage: `/component luna/PhotoGrid` or `/component commons/SearchBar`

1. Parse the component path to extract:
   - Category (luna, sol, commons, etc.)
   - Component name (must be PascalCase)

2. Create the component file at `components/<category>/<ComponentName>.tsx`:
   - Include ABOUTME comments (2 lines) explaining what the component does
   - Import React and necessary types
   - Create a basic functional component with TypeScript props interface
   - Use Tailwind CSS for styling
   - Export the component

3. Create the Storybook story at `components/<category>/<ComponentName>.stories.tsx`:
   - Include ABOUTME comments explaining the story's purpose
   - Import Meta and StoryObj from '@storybook/nextjs'
   - Set up meta with title '<Category>/<ComponentName>'
   - Include 'autodocs' tag
   - Create at least two stories: Default and a variant demonstrating key features
   - Use proper TypeScript typing

4. Optionally ask if a test file should be created at `components/<category>/<ComponentName>.test.tsx`

5. After creating files:
   - Show a summary of created files
   - Suggest running `pnpm storybook` to view the component
   - Remind to follow the design-system skill for component development

Example structure for PhotoGrid:

- components/luna/PhotoGrid.tsx
- components/luna/PhotoGrid.stories.tsx
- components/luna/PhotoGrid.test.tsx (optional)
