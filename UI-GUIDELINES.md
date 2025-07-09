# UI-GUIDELINES.md

**Load for Rounds 3, 5, 6 (Page Design, Animal Interface)**

## 🎨 Design System Foundation

### Brand Identity

- **System Name**: "ระบบ E-ID" (for headers)
- **Company Brand**: "JAOTHUI"
- **Logo File**: `public/jaothui-logo.png` (120px x 120px)
- **Powered By**: "Powered by JAOTHUI" (footer text)

### Color Palette

```scss
// Primary Colors
$primary: #f39c12; // Orange brand color
$primary-light: #f5b041; // Lighter orange for hover
$primary-dark: #d68910; // Darker orange for active

// Neutral Colors
$header-bg: #4a4a4a; // Dark gray header
$text-primary: #333333; // Main text color
$text-secondary: #666666; // Secondary text
$text-muted: #999999; // Muted text

// Background Colors
$bg-white: #ffffff; // Pure white
$bg-light: #f9f9f9; // Light gray cards
$bg-input: #f5f5f5; // Input backgrounds
$bg-border: #e0e0e0; // Border color

// Status Colors
$success: #2ecc71; // Green for success
$warning: #f1c40f; // Yellow for warning
$error: #e74c3c; // Red for error
$info: #3498db; // Blue for info
```

### Typography Scale

```scss
// Font Sizes
$font-xs: 12px; // Small labels
$font-sm: 14px; // Secondary text
$font-base: 16px; // Body text
$font-lg: 18px; // Large text
$font-xl: 20px; // Subheadings
$font-2xl: 24px; // Headings
$font-3xl: 32px; // Brand text

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;

// Line Heights
$leading-tight: 1.25;
$leading-normal: 1.5;
$leading-relaxed: 1.75;
```

### Spacing System

```scss
// Spacing Scale (Tailwind-compatible)
$space-1: 4px; // 0.25rem
$space-2: 8px; // 0.5rem
$space-3: 12px; // 0.75rem
$space-4: 16px; // 1rem
$space-5: 20px; // 1.25rem
$space-6: 24px; // 1.5rem
$space-8: 32px; //
```
