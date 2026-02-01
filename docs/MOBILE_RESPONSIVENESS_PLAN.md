# Mobile Responsiveness Improvement Plan for VFR3D

## Overview

This plan improves mobile responsiveness across all existing pages and components. The previous phase implemented device detection hooks, airport pages, and map protection. This phase focuses on optimizing existing pages for mobile devices.

**Target Breakpoints:**
- Phone: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## Phase 1: Critical Fixes

### 1.1 BottomDrawer Safe Area & Height

**File:** `src/components/Common/BottomDrawer.module.css`

**Issues:**
- Fixed `75vh` height consumes too much screen on small phones
- No safe area insets for notched devices (iPhone X+)

**Changes:**
- Reduce drawer height on phones: `height: 85vh` on phones, `75vh` on tablet+
- Add safe area padding: `padding-bottom: env(safe-area-inset-bottom)`
- Add CSS media query for phone-specific height

### 1.2 FlightRouteBuilder Touch Drag-and-Drop

**File:** `src/features/Flights/FlightRouteBuilder.tsx`

**Issues:**
- HTML5 drag-and-drop doesn't work on touch devices
- Fixed `w={80}` on NumberInput causes overflow
- Waypoint cards may overflow on narrow screens

**Changes:**
- Replace HTML5 drag-and-drop with touch-friendly solution using `@dnd-kit/core`
- Make NumberInput width responsive: `w={{ base: 70, sm: 80 }}`
- Add `wrap="wrap"` to waypoint card Group where needed
- Add visible drag handle icon for touch users

### 1.3 Flight Stats Grid Responsiveness

**File:** `src/routes/flights/index.tsx`

**Issues:**
- Stats grid uses fixed `cols={4}` - cramped on phones

**Changes:**
- Change to responsive: `cols={{ base: 2, sm: 4 }}`
- Stack 2x2 on phones, 1x4 on larger screens

---

## Phase 2: Flight Detail Page Improvements

### 2.1 Tab Navigation for Mobile

**File:** `src/routes/flights/$flightId.tsx`

**Issues:**
- 7 tabs overflow on mobile screens
- Tab labels too long for small screens

**Changes:**
- Use icon-only tabs on phones with tooltips
- Add horizontal scroll for tab list on phones
- Consider grouping less-used tabs into "More" dropdown

### 2.2 Flight Header Responsiveness

**File:** `src/features/FlightDetails/components/FlightHeader.tsx`

**Changes:**
- Stack action buttons vertically on phones
- Use `wrap="wrap"` on button groups
- Reduce button sizes on mobile

### 2.3 NavLog Content Tables

**Files:**
- `src/features/Flights/FlightPlanningDrawer/NavLogContent.tsx`
- Related table components

**Note:** NavLogTable.tsx already has excellent mobile support with LegCards. Ensure other tables follow this pattern.

**Changes:**
- Wrap tables in `ScrollArea` for horizontal scrolling
- Or implement card-based mobile layouts like NavLogTable

---

## Phase 3: Aircraft Page Improvements

### 3.1 Aircraft Cards & Forms

**File:** `src/routes/aircraft.tsx`

**Issues:**
- Edit/Delete ActionIcons use `compact-xs` - too small for touch
- Modal size="lg" may exceed mobile viewport
- Form `Group grow` creates 2-column layouts on phones

**Changes:**
- Increase ActionIcon size to `size="sm"` minimum
- Make modal responsive: `size={{ base: '100%', sm: 'lg' }}`
- Change form Groups to Stack on mobile or use responsive columns
- Add `fullScreen` prop to modal on phones

### 3.2 Performance Profile Selection

**File:** `src/features/Flights/FlightPlanningDrawer/PerformanceProfiles/`

**Changes:**
- Increase touch targets for Edit/Delete buttons
- Ensure profile cards don't overflow on narrow screens

---

## Phase 4: Weight & Balance Page Improvements

### 4.1 Profile Cards & Forms

**File:** `src/routes/weight-balance.tsx`

**Issues:**
- Header Group with multiple buttons may overflow
- Profile card grid `sm: 2` may be tight at 640px
- Delete modal needs responsive sizing

**Changes:**
- Add `wrap="wrap"` to header button Group
- Adjust grid: `cols={{ base: 1, sm: 1, md: 2, lg: 3 }}`
- Make delete modal responsive
- Stack form buttons on mobile

### 4.2 Calculator Component

**File:** `src/features/WeightBalance/` components

**Changes:**
- Ensure inputs are full-width on mobile
- Stack any side-by-side form fields
- Add proper spacing for touch targets

---

## Phase 5: Weather Imagery Page (Minor Fixes)

**File:** `src/routes/weather-imagery.tsx`

**Note:** This page already has excellent responsive design.

**Minor Changes:**
- Check badge display on image footer for overflow
- Ensure filter names don't cause horizontal scroll

---

## Phase 6: FlightPlanningDrawer Improvements

### 6.1 Stepper Labels

**File:** `src/features/Flights/FlightPlanningDrawer/FlightPlanningDrawer.tsx`

**Issues:**
- Stepper labels ("Route", "Aircraft", "Time & Alt", "Nav Log") may wrap on small screens

**Changes:**
- Use icon-only stepper on phones
- Add tooltips to stepper icons
- Or use abbreviated labels ("Route", "A/C", "Alt", "Log")

### 6.2 Action Button Layout

**Changes:**
- Stack Previous/Next buttons vertically on very narrow screens
- Or use icon-only buttons with tooltips

### 6.3 QuickLayerSettings Toggle Sizes

**File:** `src/features/Flights/FlightPlanningDrawer/QuickLayerSettings.tsx`

**Issues:**
- Toggle button padding `2px 8px` too small for touch

**Changes:**
- Increase padding to `6px 12px` minimum
- Increase Switch size from `xs` to `sm`

---

## Phase 7: Altitude & Departure Controls

**File:** `src/features/Flights/FlightPlanningDrawer/AltitudeAndDepartureControls.tsx`

**Issues:**
- DateTimePicker may have small touch targets
- VFR Altitude Guidance text takes multiple lines

**Changes:**
- Ensure adequate spacing around date/time pickers
- Consider collapsible VFR guidance on mobile
- Test date picker overlay positioning on mobile

---

## Phase 8: Global Responsive Patterns

### 8.1 Modal Responsiveness Utility

Create a reusable pattern for responsive modals:

```typescript
// Pattern to apply across all modals
size={{ base: '100%', sm: 'md' }}  // or 'lg'
fullScreen={useIsPhone()}
```

### 8.2 Button Group Pattern

Create consistent pattern for button groups:

```typescript
<Group wrap="wrap" gap="sm">
  {/* buttons */}
</Group>
```

### 8.3 Touch Target Standards

Ensure minimum touch targets:
- Buttons: 44px height minimum on mobile
- ActionIcons: `size="md"` minimum (not `compact-xs`)
- Switches: `size="sm"` minimum

---

## Files Summary

### High Priority Modifications

| File | Changes |
|------|---------|
| `src/components/Common/BottomDrawer.module.css` | Safe area insets, responsive height |
| `src/features/Flights/FlightRouteBuilder.tsx` | Touch drag-and-drop, responsive inputs |
| `src/routes/flights/index.tsx` | Responsive stats grid |
| `src/routes/flights/$flightId.tsx` | Mobile tabs, scrollable tab list |
| `src/routes/aircraft.tsx` | Responsive modal, larger touch targets |
| `src/routes/weight-balance.tsx` | Button wrapping, responsive grid |

### Medium Priority Modifications

| File | Changes |
|------|---------|
| `src/features/Flights/FlightPlanningDrawer/FlightPlanningDrawer.tsx` | Icon-only stepper on phones |
| `src/features/Flights/FlightPlanningDrawer/QuickLayerSettings.tsx` | Larger toggle buttons |
| `src/features/Flights/FlightPlanningDrawer/AltitudeAndDepartureControls.tsx` | Date picker spacing |
| `src/features/Flights/FlightPlanningDrawer/PerformanceProfiles/*.tsx` | Touch target sizes |

### Dependencies (To Install)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- **@dnd-kit/core** - Core drag-and-drop functionality with touch support
- **@dnd-kit/sortable** - Sortable list utilities for waypoint reordering
- **@dnd-kit/utilities** - CSS transform utilities for smooth animations

---

## Implementation Order

1. **Phase 1** - Critical fixes (BottomDrawer, FlightRouteBuilder, stats grid)
2. **Phase 2** - Flight detail page tabs and headers
3. **Phase 3** - Aircraft page modals and forms
4. **Phase 4** - Weight & Balance page
5. **Phase 5** - Weather imagery (quick fixes)
6. **Phase 6** - FlightPlanningDrawer stepper and buttons
7. **Phase 7** - Altitude controls
8. **Phase 8** - Apply global patterns across remaining components

---

## Verification

### Testing Approach

1. **Chrome DevTools** - Device emulation for iPhone SE, iPhone 12, iPad
2. **Test each page** at 320px, 375px, 414px, 768px, 1024px widths
3. **Touch interaction testing** - Ensure drag-and-drop works on touch devices
4. **Safe area testing** - Test on notched device or emulator

### Key Test Cases

- [ ] BottomDrawer doesn't overlap notch/home indicator
- [ ] FlightRouteBuilder drag-and-drop works on touch
- [ ] All modals don't overflow on phones
- [ ] Tabs are navigable on narrow screens
- [ ] All buttons have adequate touch targets (44px+)
- [ ] Forms don't have horizontal overflow
- [ ] Stats grids adapt to screen width

---

## Notes

- NavLogTable.tsx already implements excellent mobile patterns (LegCards) - use as reference
- Weather imagery page is already well-optimized - minimal changes needed
- Consider lazy-loading phases to reduce initial implementation scope
