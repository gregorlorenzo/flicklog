# Flicklog: Design Guidelines

This document is the single source of truth for the visual identity and user experience of Flicklog. It ensures that the application maintains a consistent, beautiful, and intuitive interface that reflects our core vision. All UI development MUST adhere to these guidelines.

## Core Design Principles

Our design is guided by three keywords: **Nostalgic, Cozy, and Minimal.**

- **Nostalgic & Cozy:** The app should feel like a warm, personal, and well-loved scrapbook. It's a comfortable space for memories. We achieve this through our color palette, typography, and subtle animations.
- **Minimal:** The interface must be clean, uncluttered, and intuitive. The focus is always on the user's content (posters, ratings, comments). We achieve this through generous spacing and a clear visual hierarchy.

---

## 1. Color Palette

The app supports both a dark (default) and a light theme. The palette is designed to be warm and accessible, meeting WCAG 2.1 AA standards with minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text.

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

- **Success:** `#10B981` (Emerald-500) - For confirmations, completed actions
- **Warning:** `#F59E0B` (Amber-500) - For cautions, pending states
- **Error:** `#EF4444` (Red-500) - For errors, destructive actions
- **Info:** `#3B82F6` (Blue-500) - For informational messages

### **Color Usage Guidelines**

```css
/* Primary Actions */
.btn-primary {
  background: #d4a269;
  color: #1a1d23;
}

/* Secondary Actions */
.btn-secondary {
  background: transparent;
  color: #d4a269;
  border: 1px solid #d4a269;
}

/* Text Hierarchy */
.text-primary {
  color: #eae6e1;
} /* Dark mode */
.text-secondary {
  color: #b8b5b2;
} /* 60% opacity of primary */
.text-muted {
  color: #8a8884;
} /* 40% opacity of primary */

/* Interactive States */
.interactive:hover {
  background: rgba(212, 162, 105, 0.1);
}
.interactive:focus {
  box-shadow: 0 0 0 2px #d4a269;
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

#### **Body Font: Source Sans Pro**

- **Role:** Used for all paragraphs, comments, descriptions, labels, and general UI text
- **Feel:** Clean, professional, and highly legible
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-bold)

### **Typography Scale**

#### **Desktop Sizes**

- **H1 (Page Titles):** 32px (2rem) - Poppins 700
- **H2 (Section Headers):** 24px (1.5rem) - Poppins 600
- **H3 (Card Titles):** 20px (1.25rem) - Poppins 600
- **H4 (Subsections):** 18px (1.125rem) - Source Sans Pro 600
- **Body Large:** 16px (1rem) - Source Sans Pro 400
- **Body Regular:** 14px (0.875rem) - Source Sans Pro 400
- **Body Small:** 12px (0.75rem) - Source Sans Pro 400
- **Caption:** 11px (0.6875rem) - Source Sans Pro 500

#### **Mobile Sizes (Responsive)**

- **H1:** 28px (1.75rem)
- **H2:** 20px (1.25rem)
- **H3:** 18px (1.125rem)
- **Body:** 16px (1rem) - Larger for better mobile readability

### **Line Height Guidelines**

- **Headlines:** 1.2 (tight)
- **Body Text:** 1.6 (relaxed for readability)
- **Captions:** 1.4 (balanced)

---

## 3. Layout, Spacing, & Shape

The structure of our UI is defined by generous spacing and soft, consistent shapes.

### **Spacing System**

Using Tailwind's 4px base unit system:

- **Micro spacing:** `space-1` (4px) - Between related elements
- **Small spacing:** `space-2` (8px) - Form field gaps
- **Medium spacing:** `space-4` (16px) - Component internal padding
- **Large spacing:** `space-6` (24px) - Between component groups
- **XL spacing:** `space-8` (32px) - Section breaks
- **XXL spacing:** `space-12` (48px) - Major layout sections

### **Border Radius Standards**

- **Cards, Buttons, Inputs:** `rounded-lg` (8px)
- **Tags, Badges:** `rounded-full` (full radius)
- **Modals, Overlays:** `rounded-xl` (12px)
- **Images:** `rounded-md` (6px)

### **Shadow System**

Subtle shadows for depth without heaviness:

- **Card Shadow:** `shadow-md` - For content cards
- **Modal Shadow:** `shadow-2xl` - For overlays and modals
- **Button Shadow:** `shadow-sm` - For interactive elements
- **Hover Shadow:** `shadow-lg` - For hover states

### **Grid System**

- **Desktop:** 12-column grid with 24px gutters
- **Tablet:** 8-column grid with 20px gutters
- **Mobile:** 4-column grid with 16px gutters

---

## 4. Interactive States & Animations

### **Animation Principles**

- **Duration:** 200ms for micro-interactions, 300ms for page transitions
- **Easing:** `ease-out` for entrances, `ease-in` for exits
- **Reduce Motion:** Respect `prefers-reduced-motion` setting

### **Interactive States**

#### **Buttons**

```css
/* Primary Button States */
.btn-primary {
  transition: all 200ms ease-out;
}
.btn-primary:hover {
  background: #c19550; /* Slightly darker gold */
  transform: translateY(-1px);
  shadow: shadow-md;
}
.btn-primary:active {
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### **Cards**

```css
.card {
  transition: transform 200ms ease-out, shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-2px);
  shadow: shadow-lg;
}
```

#### **Focus States**

All interactive elements MUST have visible focus indicators:

```css
.interactive:focus {
  outline: 2px solid #d4a269;
  outline-offset: 2px;
}
```

---

## 5. Component Styling Reference

### **Cards**

The primary container for content.

```tsx
<div className="bg-[#252931] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
  {/* Card content */}
</div>
```

### **Buttons**

#### **Primary Buttons**

```tsx
<button className="bg-[#D4A269] text-[#1A1D23] px-4 py-2 rounded-lg font-medium hover:bg-[#C19550] focus:ring-2 focus:ring-[#D4A269] focus:ring-offset-2 transition-all duration-200">
  Primary Action
</button>
```

#### **Secondary Buttons**

```tsx
<button className="bg-transparent text-[#D4A269] border border-[#D4A269] px-4 py-2 rounded-lg font-medium hover:bg-[#D4A269] hover:text-[#1A1D23] focus:ring-2 focus:ring-[#D4A269] transition-all duration-200">
  Secondary Action
</button>
```

### **Input Fields**

```tsx
<input className="bg-[#252931] border border-[#3A3F47] rounded-lg px-3 py-2 text-[#EAE6E1] focus:ring-2 focus:ring-[#D4A269] focus:border-[#D4A269] transition-colors duration-200" />
```

### **Tags & Badges**

```tsx
<span className="bg-[#3E6D74] text-[#EAE6E1] px-3 py-1 rounded-full text-sm font-medium">
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

### **Icon Usage Guidelines**

```tsx
// Consistent sizing and styling
<Star className="h-5 w-5 text-[#D4A269]" />
<Heart className="h-4 w-4 text-red-500" fill="currentColor" />
```

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
