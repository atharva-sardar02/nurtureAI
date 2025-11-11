# v0 by Vercel - Integration Guide

## What is v0?

v0 is Vercel's AI-powered UI component generator that creates React components using shadcn/ui and Tailwind CSS - perfect for our project!

## How to Use v0 Components in This App

### Step 1: Generate Components in v0

1. **Go to v0.dev**
   - Visit: https://v0.dev
   - Sign in with your GitHub account

2. **Describe Your Component**
   - Type a prompt like: "Create a chat interface with message bubbles"
   - Or: "Design an onboarding form with multiple steps"
   - v0 will generate the component code

3. **Copy the Generated Code**
   - Click "Copy code" button in v0
   - The code will include all necessary imports and component structure

### Step 2: Add Required shadcn/ui Components

Before pasting v0 code, you need to install the shadcn/ui components that v0 uses:

```bash
# Example: If v0 uses Button, Card, Input, etc.
npx shadcn-ui@latest add button card input textarea select
npx shadcn-ui@latest add dialog dropdown-menu popover
npx shadcn-ui@latest add form label checkbox radio-group
npx shadcn-ui@latest add table tabs accordion
npx shadcn-ui@latest add alert toast badge
npx shadcn-ui@latest add avatar separator skeleton
```

**Tip:** v0 usually shows which components it uses. Install them before pasting the code.

### Step 3: Paste Component into Your Project

1. **Create Component File**
   - Create a new file in `src/components/` (or appropriate subdirectory)
   - Example: `src/components/chat/ChatInterface.jsx`

2. **Paste the Code**
   - Paste the code from v0
   - v0 code uses `@/components/ui/*` imports which we've configured!

3. **Fix Imports (if needed)**
   - v0 might use TypeScript - change `.tsx` to `.jsx`
   - Ensure all imports use our path aliases:
     - `@/components/ui/*` ✅ (already configured)
     - `@/lib/utils` ✅ (already configured)
     - `@/hooks/*` ✅ (already configured)

### Step 4: Use the Component

Import and use in your pages:

```jsx
import ChatInterface from '@/components/chat/ChatInterface';

function AssessmentPage() {
  return (
    <div>
      <ChatInterface />
    </div>
  );
}
```

## Project Structure for v0 Components

Our project is already set up correctly:

```
src/
├── components/
│   ├── ui/              ← shadcn/ui components go here
│   ├── chat/            ← v0 chat components
│   ├── onboarding/      ← v0 form components
│   └── ...
├── lib/
│   └── utils.js         ← cn() utility (v0 uses this)
└── ...
```

## Path Aliases (Already Configured)

v0 components use these imports - all configured in `vite.config.js`:

- `@/components/ui/*` → `src/components/ui/*`
- `@/lib/utils` → `src/lib/utils.js`
- `@/hooks/*` → `src/hooks/*`
- `@/components/*` → `src/components/*`

## Common v0 Component Patterns

### 1. Chat Interface
```bash
# Install required components
npx shadcn-ui@latest add button card input scroll-area avatar

# Generate in v0: "chat interface with message bubbles"
# Paste into: src/components/chat/ChatInterface.jsx
```

### 2. Onboarding Form
```bash
# Install required components
npx shadcn-ui@latest add form input button card label select

# Generate in v0: "multi-step onboarding form"
# Paste into: src/components/onboarding/OnboardingWizard.jsx
```

### 3. Scheduling Calendar
```bash
# Install required components
npx shadcn-ui@latest add calendar button card popover

# Generate in v0: "appointment scheduling calendar"
# Paste into: src/components/scheduling/SchedulingCalendar.jsx
```

## Quick Start Workflow

1. **Design in v0.dev**
   - Describe your component
   - Review the generated code
   - Copy the code

2. **Install Dependencies**
   ```bash
   # Check which shadcn components v0 uses, then:
   npx shadcn-ui@latest add [component-names]
   ```

3. **Paste & Adapt**
   - Create component file
   - Paste v0 code
   - Change `.tsx` → `.jsx` if needed
   - Fix any import paths

4. **Test**
   ```bash
   npm run dev
   ```
   - Import and use the component
   - Verify it renders correctly

## Tips for Best Results

1. **Be Specific in v0 Prompts**
   - "Create a chat interface with user and AI message bubbles, input field, and send button"
   - Better than: "make a chat"

2. **Iterate in v0**
   - v0 allows multiple iterations
   - Refine your prompt based on results
   - Get the perfect component before copying

3. **Combine Multiple Components**
   - Generate individual components in v0
   - Combine them in your app
   - Example: Chat interface + Input form + Button

4. **Customize After Pasting**
   - v0 gives you a great starting point
   - Customize colors, spacing, behavior to match your design
   - Add Firebase integration, state management, etc.

## Example: Adding a v0 Chat Component

```bash
# 1. Install shadcn components
npx shadcn-ui@latest add button card input scroll-area avatar

# 2. Generate in v0: "chat interface with message bubbles for AI conversation"

# 3. Create file: src/components/chat/ChatInterface.jsx
# 4. Paste v0 code
# 5. Update imports if needed (change .tsx to .jsx)

# 6. Use in your app:
import ChatInterface from '@/components/chat/ChatInterface';
```

## Troubleshooting

### "Cannot find module '@/components/ui/button'"
- Run: `npx shadcn-ui@latest add button`
- Component will be created in `src/components/ui/button.jsx`

### "Cannot find module '@/lib/utils'"
- Already exists at `src/lib/utils.js`
- Make sure path alias is working (check `vite.config.js`)

### TypeScript Errors
- v0 generates TypeScript by default
- Change file extension from `.tsx` to `.jsx`
- Remove TypeScript type annotations if needed

### Styling Not Working
- Make sure Tailwind CSS is configured (✅ done)
- Check that `global.css` is imported in `index.jsx` (✅ done)
- Verify component uses Tailwind classes

---

**Ready to start designing!** Go to https://v0.dev and start generating beautiful components! 🎨

