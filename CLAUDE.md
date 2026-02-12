# Claude Code Guidelines for VFR3D Frontend

## Mantine UI Styling Standards

This project uses [Mantine v7](https://mantine.dev) for UI components. When styling components, follow this priority order:

### 1. Mantine Built-in Props (Preferred)
Use Mantine's built-in component props first. These provide consistent theming and are the most maintainable approach.

```tsx
// GOOD - Using built-in props with color constants
import { BUTTON_COLORS, STATUS_COLORS } from '@/constants/colors';

<Button color={BUTTON_COLORS.PRIMARY} size="md" variant="filled" />
<Stack gap="md" align="center" justify="space-between" />
<Text size="sm" c="dimmed" fw={500} />
<Badge variant="light" color={STATUS_COLORS.ERROR} size="sm" />
```

Common styling props available on most components:
- `c` - color (e.g., `c="dimmed"`, `c="blue.5"`, `c="var(--mantine-color-gray-6)"`)
- `bg` - background color
- `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr` - padding
- `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr` - margin
- `w`, `h`, `maw`, `mah`, `miw`, `mih` - width/height constraints
- `fz` - font size
- `fw` - font weight
- `ta` - text align
- `tt` - text transform

### 2. Mantine Styles API (Secondary)
When built-in props aren't sufficient, use the `styles` prop for component-specific overrides.

```tsx
// ACCEPTABLE - Using styles API when props aren't enough
<Button
  styles={{
    root: {
      backgroundColor: 'rgba(30, 41, 59, 0.6)',
      borderColor: 'rgba(148, 163, 184, 0.3)',
    },
    label: {
      fontWeight: 700,
    },
  }}
>
  Custom Button
</Button>
```

### 3. CSS Modules (Last Resort)
Only use CSS modules when complex styling logic is needed or styles are reused across multiple components.

```tsx
// LAST RESORT - CSS modules for complex/reusable styles
import classes from './Component.module.css';

<Box className={classes.customContainer}>
  <Text className={classes.specialText}>Content</Text>
</Box>
```

### Inline `style` prop
Use the `style` prop sparingly for one-off styles that don't fit the above patterns, particularly for dynamic values.

```tsx
// OK for dynamic/one-off styles
<Box style={{ borderLeft: `3px solid var(--mantine-color-${severityColor}-6)` }}>
```

## Theme Colors

This project uses custom theme colors defined in `src/theme/index.ts`:
- `vfr3dBlue` - Primary blue (#3b82f6)
- `vfrGreen` - VFR flight category / success (#22c55e)
- `ifrRed` - IFR flight category / error / destructive (#ef4444)
- `lifrPurple` - LIFR flight category (#a855f7)
- `warningYellow` - Warnings / caution (#fbbf24)
- `vfr3dSurface` - Dark slate surfaces (0=light, 9=darkest)

Reference in CSS: `var(--mantine-color-{colorName}-{shade})` (shade 0-9, 5 is base)

## Interactive Element Color Scheme

All interactive element colors are defined in `src/constants/colors.ts`. **Always import and use these constants** rather than hardcoding colors.

### Button Patterns

```tsx
import { BUTTON_COLORS, BUTTON_VARIANTS, BUTTON_GRADIENTS } from '@/constants/colors';

// Primary CTA (hero buttons, main actions) - gradient style
<Button variant="gradient" gradient={BUTTON_GRADIENTS.PRIMARY} size="lg">
  Get Started
</Button>

// Standard primary (Save, Create, Submit, Apply)
<Button variant="filled" color={BUTTON_COLORS.PRIMARY}>Save</Button>

// Secondary/Cancel (Cancel, Close, Dismiss, Skip)
<Button variant="subtle" color={BUTTON_COLORS.SECONDARY}>Cancel</Button>

// Navigation - Back (de-emphasized)
<Button variant="subtle" color={BUTTON_COLORS.BACK} leftSection={<FiChevronLeft />}>
  Back
</Button>

// Navigation - Next (emphasized, forward progress)
<Button variant="filled" color={BUTTON_COLORS.NEXT} rightSection={<FiChevronRight />}>
  Next
</Button>

// Destructive (Delete, Remove, Clear)
<Button variant="light" color={BUTTON_COLORS.DESTRUCTIVE}>Delete</Button>

// Confirm (Confirm, Accept, Yes)
<Button variant="filled" color={BUTTON_COLORS.CONFIRM}>Confirm</Button>

// Refresh (Refresh, Reload, Update)
<Button variant="light" color={BUTTON_COLORS.REFRESH}>Refresh</Button>
```

### ActionIcon Patterns

```tsx
import { ACTION_ICON_COLORS, ACTION_ICON_VARIANTS } from '@/constants/colors';

// Close/dismiss (always subtle gray)
<ActionIcon variant="subtle" color={ACTION_ICON_COLORS.CLOSE}>
  <FiX />
</ActionIcon>

// Refresh
<ActionIcon variant="light" color={ACTION_ICON_COLORS.REFRESH}>
  <FiRefreshCw />
</ActionIcon>

// Edit
<ActionIcon variant="light" color={ACTION_ICON_COLORS.EDIT}>
  <FiEdit2 />
</ActionIcon>

// Delete
<ActionIcon variant="light" color={ACTION_ICON_COLORS.DELETE}>
  <FiTrash2 />
</ActionIcon>

// Add
<ActionIcon variant="light" color={ACTION_ICON_COLORS.ADD}>
  <FiPlus />
</ActionIcon>

// Settings
<ActionIcon variant="light" color={ACTION_ICON_COLORS.SETTINGS}>
  <FiSettings />
</ActionIcon>
```

### Color Intent Quick Reference

| Intent | Color Constant | Variant | Use Case |
|--------|---------------|---------|----------|
| Primary CTA | gradient | gradient | Hero buttons, main CTAs |
| Primary | `vfr3dBlue` | filled | Save, Create, Submit |
| Secondary | `gray` | subtle | Cancel, Close, Dismiss |
| Back | `gray` | subtle | Back navigation |
| Next | `vfr3dBlue` | filled | Forward navigation |
| Destructive | `ifrRed` | light | Delete, Remove |
| Confirm | `vfrGreen` | filled | Confirm, Accept |
| Refresh | `cyan` | light | Refresh, Reload |

### Status Colors

Use `STATUS_COLORS` from `src/constants/colors.ts`:
- `SUCCESS` (`vfrGreen.5`) - Success states, within limits
- `WARNING` (`warningYellow.5`) - Caution, approaching limits
- `ERROR` (`ifrRed.5`) - Error, critical, outside limits
- `INFO` (`vfr3dBlue.5`) - Informational, neutral

## Component Patterns

### Responsive Design
Use Mantine's responsive object syntax:
```tsx
<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} />
<Text size={{ base: 'sm', md: 'md' }} />
```

### Tooltips
Always provide tooltips for icon-only buttons:
```tsx
import { ACTION_ICON_COLORS } from '@/constants/colors';

<Tooltip label="Refresh data">
  <ActionIcon variant="light" color={ACTION_ICON_COLORS.REFRESH} onClick={handleRefresh}>
    <FiRefreshCw size={14} />
  </ActionIcon>
</Tooltip>
```

## Mantine Documentation Reference

For comprehensive Mantine documentation, reference: https://mantine.dev/llms-full.txt

Key documentation sections:
- Components: https://mantine.dev/core/button/ (and other components)
- Styles API: https://mantine.dev/styles/styles-api/
- CSS Variables: https://mantine.dev/styles/css-variables/
- Theming: https://mantine.dev/theming/theme-object/

## Code Style

- Use TypeScript for all components
- Prefer functional components with hooks
- Use RTK Query for API calls (see `src/redux/api/`)
- Icons come from `react-icons` (primarily `fi` for Feather Icons, `tb` for Tabler Icons)
