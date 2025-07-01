# Flicklog: Design Guidelines

This document is the single source of truth for the visual identity and user experience of Flicklog. It ensures that the application maintains a consistent, beautiful, and intuitive interface that reflects our core vision. All UI development MUST adhere to these guidelines.

## Core Design Principles

Our design is guided by three keywords: **Nostalgic, Cozy, and Minimal.**

- **Nostalgic & Cozy:** The app should feel like a warm, personal, and well-loved scrapbook. It's a comfortable space for memories. We achieve this through our color palette, typography, and subtle animations.
- **Minimal:** The interface must be clean, uncluttered, and intuitive. The focus is always on the user's content (posters, ratings, comments). We achieve this through generous spacing and a clear visual hierarchy.

---

## 1. Color Palette & Theming (Tailwind v4)

Our application is built using Tailwind CSS v4, which uses a modern, CSS variable-driven approach for theming. All theme configuration is centralized in `src/app/globals.css`. The app supports both a dark (default) and a light theme, meeting WCAG 2.1 AA accessibility standards.

### **Night Mode (Default Dark Theme)**

Designed to feel like a cozy, dimly lit living room. This is the primary theme.

- **Background:** `#1A1D23` (A very dark, deep blue/charcoal)
- **UI Background (Cards/Inputs):** `#252931` (A slightly lighter charcoal)
- **Text / Light Elements:** `#EAE6E1` (A gentle, warm off-white) - 14.2:1 contrast ratio
- **Primary Accent (Buttons/Links):** `#D4A269` (A warm, soft gold/amber)
- **Secondary Accent (Tags/Meta):** `#3E6D74` (A muted, deep teal)

### **Day Mode (Light Theme)**

The airy and clean counterpart that maintains the brand's warmth.

- **Background:** `#F5F2EF` (A soft, warm off-white)
- **UI Background (Cards/Inputs):** `#FFFFFF` (A clean white for contrast)
- **Text / Dark Elements:** `#1A1D23` (The same deep charcoal for consistency) - 13.8:1 contrast ratio
- **Primary Accent:** `#D4A269` (The same warm gold)
- **Secondary Accent:** `#3E6D74` (The same muted teal)

### **Semantic Colors**

For consistent feedback and state communication:

- **Success:** `#10B981` (Emerald-500)
- **Warning:** `#F59E0B` (Amber-500)
- **Error:** `#EF4444` (Red-500)
- **Info:** `#3B82F6` (Blue-500)

### **Implementation: CSS Variables & `@theme`**

Our theme is defined in `src/app/globals.css` using `oklch` color values for modern browsers. We define our brand tokens in `:root` and then map them to Tailwind's utilities using `@theme`.

```css
/* src/app/globals.css (abbreviated) */

/* 1. Define custom utilities */
@theme {
  --font-heading: var(--font-poppins), sans-serif;
  --font-body: var(--font-source-sans-pro), sans-serif;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  --color-flicklog-accent-teal: oklch(0.485 0.05 214.3);
}

/* 2. Define CSS variables for the theme */
:root {
  /* This is our "Night Mode" theme */
  --background: oklch(0.151 0.012 259.4); /* #1A1D23 */
  --foreground: oklch(0.914 0.011 82.9);  /* #EAE6E1 */
  --card: oklch(0.203 0.014 259.6);       /* #252931 */
  --primary: oklch(0.704 0.094 78.4);     /* #D4A269 */
  /* ... etc ... */
}

/* 3. Map our variables to Tailwind's theme system */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  /* ... etc ... */
}
```

---

## 2. Typography

Our typography is clean and contemporary, with a touch of personality in headlines. Readability is the top priority. We use `next/font` for optimal performance.

### **Font Hierarchy**

#### **Heading Font: Poppins**

- **Role:** Used for all major headings (`<h1>`, `<h2>`, `<h3>`), movie titles, and prominent UI elements
- **Feel:** Geometric, warm, and inviting
- **Weights:** 600 (Semi-bold), 700 (Bold)
- **Utility Class:** `font-heading`

#### **Body Font: Source Sans Pro**

- **Role:** Used for all paragraphs, comments, descriptions, labels, and general UI text
- **Feel:** Clean, professional, and highly legible
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-bold)
- **Utility Class:** `font-body`

### **Typography Scale (Desktop Sizes)**

- **H1 (Page Titles):** `text-3xl` (30px) or `text-4xl` (36px) - `font-heading font-bold`
- **H2 (Section Headers):** `text-2xl` (24px) - `font-heading font-semibold`
- **H3 (Card Titles):** `text-xl` (20px) - `font-heading font-semibold`
- **H4 (Subsections):** `text-lg` (18px) - `font-body font-semibold`
- **Body Large:** `text-base` (16px) - `font-body font-normal`
- **Body Regular:** `text-sm` (14px) - `font-body font-normal`
- **Body Small:** `text-xs` (12px) - `font-body font-normal`

---

## 3. Layout, Spacing, & Shape

The structure of our UI is defined by generous spacing and soft, consistent shapes.

### **Spacing System**

Using Tailwind's default 4px base unit system:

- **Micro spacing:** `p-1`, `gap-1` (4px)
- **Small spacing:** `p-2`, `gap-2` (8px)
- **Medium spacing:** `p-4`, `gap-4` (16px)
- **Large spacing:** `p-6`, `gap-6` (24px)
- **XL spacing:** `p-8`, `gap-8` (32px)
- **XXL spacing:** `p-12`, `gap-12` (48px)

### **Border Radius Standards**

Defined by the `--radius` variable in `globals.css` (default `0.5rem` / 8px).

- **Cards, Buttons, Inputs:** `rounded-lg`
- **Tags, Badges:** `rounded-full`
- **Modals, Overlays:** `rounded-xl`
- **Images:** `rounded-md`

---

## 4. Interactive States & Animations

### **Animation Principles**

- **Duration:** 200ms for micro-interactions, 300ms for page transitions
- **Easing:** `ease-out` for entrances, `ease-in` for exits
- **Reduce Motion:** Respect `prefers-reduced-motion` setting

### **Focus States**

All interactive elements MUST have visible focus indicators, handled automatically by ShadCN/ui components via the `--ring` variable.

```css
/* Example of how ShadCN uses our ring variable */
.ring {
  --tw-ring-color: var(--ring);
}
```

---

## 5. Component Styling Reference

Component styling is achieved by composing Tailwind utility classes. The ShadCN/ui library provides the base components which are themed by our `globals.css` file.

### **Cards**

The primary container for content. Uses `--card` and `--card-foreground` variables.

```tsx
<div className="bg-card text-card-foreground rounded-lg border p-6">
  {/* Card content */}
</div>
```

### **Buttons**

#### **Primary Buttons**

Uses `--primary` and `--primary-foreground` variables.

```tsx
<Button>Primary Action</Button>
```

*Resulting classes include `bg-primary text-primary-foreground`.*

#### **Secondary Buttons**

Uses `--secondary` and `--secondary-foreground` variables.

```tsx
<Button variant="secondary">Secondary Action</Button>
```

*Resulting classes include `bg-secondary text-secondary-foreground`.*

### **Input Fields**

Uses the `--input` variable for borders.

```tsx
<Input type="email" placeholder="Email" />
```

*Resulting classes include `border-input`.*

### **Tags & Badges**

Uses a custom utility class defined in our theme.

```tsx
<span className="bg-flicklog-accent-teal text-white px-3 py-1 rounded-full text-sm font-medium">
  Tag Label
</span>
```

---

## 6. Iconography

### **Icon Library**

- **Primary:** Lucide React - thin, line-based, minimal icons
- **Style:** 24px stroke width of 1.5px for consistency
- **Sizes:**
  - Small: `h-4 w-4` (16px) - For inline text
  - Medium: `h-5 w-5` (20px) - For buttons
  - Large: `h-6 w-6` (24px) - For navigation

---

## 7. Accessibility Standards

### **Requirements**

- **Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus:** All interactive elements must have visible focus indicators
- **Keyboard:** Full keyboard navigation support
- **Screen Readers:** Proper ARIA labels and semantic HTML
- **Motion:** Respect `prefers-reduced-motion` setting

### **Color Accessibility**

Never rely on color alone to convey information. Always pair with:

- Icons
- Text labels
- Different shapes/patterns
- Position/layout changes

---

## 8. Responsive Design Breakpoints

```css
/* Mobile First Approach */
/* xs: 0px - Default styles */
/* sm: 640px - Small tablets */
/* md: 768px - Tablets */
/* lg: 1024px - Desktop */
/* xl: 1280px - Large desktop */
/* 2xl: 1536px - Extra large */
```

### **Component Responsiveness**

- **Cards:** Stack vertically on mobile, grid on desktop
- **Navigation:** Collapse to hamburger menu on mobile
- **Typography:** Smaller sizes on mobile for better readability
- **Touch Targets:** Minimum 44px on mobile for accessibility

---

## 9. Design Tokens Reference

For consistent implementation across the codebase:

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        flicklog: {
          "bg-dark": "#1A1D23",
          "bg-card-dark": "#252931",
          "text-light": "#EAE6E1",
          "accent-gold": "#D4A269",
          "accent-teal": "#3E6D74",
          "bg-light": "#F5F2EF",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Source Sans Pro", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
      },
    },
  },
};
```

This comprehensive guide ensures every visual element of Flicklog maintains our nostalgic, cozy, and minimal aesthetic while meeting modern accessibility and usability standards.
