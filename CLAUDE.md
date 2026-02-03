# Claude Code Guidelines for VFR3D Frontend

## Mantine UI Styling Standards

This project uses [Mantine v7](https://mantine.dev) for UI components. When styling components, follow this priority order:

### 1. Mantine Built-in Props (Preferred)
Use Mantine's built-in component props first. These provide consistent theming and are the most maintainable approach.

```tsx
// GOOD - Using built-in props
<Button color="blue" size="md" variant="filled" radius="md" />
<Stack gap="md" align="center" justify="space-between" />
<Text size="sm" c="dimmed" fw={500} />
<Badge variant="light" color="red" size="sm" />
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

This project uses custom theme colors. Reference them using:
- `var(--mantine-color-vfr3dSurface-N)` - Surface colors (0-9)
- Standard Mantine colors: `blue`, `red`, `orange`, `gray`, etc.

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
<Tooltip label="Refresh data">
  <ActionIcon onClick={handleRefresh}>
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
