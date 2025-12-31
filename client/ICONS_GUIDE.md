# Icons Guide - React Icons

## Installation ✅
React Icons is already installed in your project!

## How to Use

### Basic Usage
```jsx
import { IconName } from "react-icons/package-name";

function MyComponent() {
  return <IconName size={24} color="#000" />;
}
```

### Common Icon Packages

1. **Hero Icons** (`hi`) - Simple, clean icons
   ```jsx
   import { HiMenu, HiX, HiHome } from "react-icons/hi";
   ```

2. **Font Awesome** (`fa`) - Extensive icon library
   ```jsx
   import { FaHome, FaUser, FaShoppingCart } from "react-icons/fa";
   ```

3. **Material Design** (`md`) - Google's Material icons
   ```jsx
   import { MdMenu, MdClose, MdHome } from "react-icons/md";
   ```

4. **Feather Icons** (`fi`) - Minimal, beautiful icons
   ```jsx
   import { FiMenu, FiX, FiHome } from "react-icons/fi";
   ```

5. **Bootstrap Icons** (`bs`) - Bootstrap's icon set
   ```jsx
   import { BsMenuButton, BsX } from "react-icons/bs";
   ```

## Icon Props

- `size` - Size in pixels (default: 1em)
- `color` - Color (default: currentColor)
- `className` - CSS class name
- `style` - Inline styles

## Examples

### Hamburger Menu (already implemented)
```jsx
import { HiMenu } from "react-icons/hi";
<HiMenu size={24} />
```

### Close/X Icon
```jsx
import { HiX } from "react-icons/hi";
<HiX size={24} />
```

### Home Icon
```jsx
import { HiHome } from "react-icons/hi";
<HiHome size={20} color="#333" />
```

### Shopping Cart
```jsx
import { FaShoppingCart } from "react-icons/fa";
<FaShoppingCart size={20} />
```

### User/Profile
```jsx
import { FaUser } from "react-icons/fa";
<FaUser size={18} />
```

### With Styling
```jsx
import { HiMenu } from "react-icons/hi";

<HiMenu 
  size={24} 
  color="#fff" 
  className="my-icon"
  style={{ cursor: 'pointer' }}
/>
```

## Finding Icons

Visit: https://react-icons.github.io/react-icons/
- Search for icons by name
- Browse by package
- Copy the import statement directly

## Tips

1. **Tree-shaking**: Only import what you need - unused icons won't be bundled
2. **Consistency**: Stick to one icon package for consistency (Hero Icons recommended)
3. **Accessibility**: Always add `aria-label` when using icons as buttons
4. **Size**: Use consistent sizes (16px, 20px, 24px are common)

## Current Implementation

Your hamburger menu now uses `HiMenu` from Hero Icons! 🎉

