# VFR3D Frontend Migration Plan

## Overview

This document outlines the comprehensive plan to migrate the VFR3D frontend from the existing DaisyUI-based implementation to a new Mantine UI-based implementation with TanStack Router.

### Source Repository
- **Location**: `c:\Users\brand\source\repos\vfr3d`
- **Purpose**: Reference for all existing functionality, API integrations, and business logic

### Target Repository
- **Location**: `c:\Users\brand\source\repos\VFR3D.frontend`
- **Purpose**: New implementation with improved UI/UX

---

## Technology Stack Changes

| Category | Previous | New |
|----------|----------|-----|
| UI Framework | DaisyUI + Tailwind | Mantine UI + Tailwind |
| Routing | React Router v6 | TanStack Router |
| State Management | Redux Toolkit + RTK Query | Redux Toolkit + RTK Query (unchanged) |
| 3D Mapping | Cesium + Resium | Cesium + Resium (unchanged) |
| Authentication | Auth0 | Auth0 (unchanged) |
| Build Tool | Vite | Vite (unchanged) |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 + Mantine (unchanged) |

### Dependencies to Keep
- `@auth0/auth0-react` - Authentication
- `@emailjs/browser` - Contact form
- `@esri/arcgis-rest-feature-service` - ArcGIS integration
- `@esri/arcgis-rest-request` - ArcGIS integration
- `@react-pdf/renderer` - PDF generation for nav logs
- `@reduxjs/toolkit` - State management
- `cesium` + `resium` - 3D globe visualization
- `framer-motion` - Animations
- `fuse.js` - Fuzzy search
- `react-colorful` - Color picker
- `react-datepicker` - Date/time picker
- `react-device-detect` - Device detection
- `react-icons` - Icons
- `react-redux` - Redux bindings
- `react-responsive` - Responsive hooks
- `redux-persist` - State persistence
- `simplify-js` - Polygon simplification
- `swiper` - Carousels/sliders
- `uuid` - ID generation
- `axios` - HTTP client

### Dependencies to Add
- `@mantine/core` - Core UI components
- `@mantine/hooks` - Utility hooks
- `@mantine/form` - Form handling
- `@mantine/dates` - Date components (may replace react-datepicker)
- `@mantine/notifications` - Toast notifications
- `@tanstack/react-router` - Routing
- `@tanstack/router-devtools` - Router debugging

### Dependencies to Remove
- `daisyui` - Replaced by Mantine
- `react-router-dom` - Replaced by TanStack Router
- `@stripe/react-stripe-js` - Payments excluded for now
- `@stripe/stripe-js` - Payments excluded for now

---

## Existing Features Inventory

### Pages/Routes

| Route | Page | Description | Priority |
|-------|------|-------------|----------|
| `/` | HomePage | Landing page with hero, features, demo sections | High |
| `/contact` | ContactMePage | Contact form with EmailJS | Medium |
| `/features` | FeaturesPage | Feature showcase | Low |
| `/viewer` | ViewerPage | Main 3D map viewer (core functionality) | Critical |
| `/flights` | FlightsPage | List of saved flights | High |
| `/flights/:id` | FlightDetailsPage | Flight details, navlog, weather | High |
| `/profiles` | AircraftProfilesPage | Aircraft performance profiles | Medium |
| `/weather-imagery` | WeatherSupportImageryPage | Weather imagery controls | Medium |
| `/redirect` | RedirectPage | Auth redirect handler | High |

**Excluded Routes (Stripe-related):**
- `/pricing` - PricingPage
- `/payment` - StripePaymentPage
- `/subscription` - SubscriptionPage

### Core Features

#### 1. Authentication (Auth0)
- Login/logout flow
- Token management with automatic refresh
- Protected routes
- User profile dropdown
- **Source Files**:
  - `src/main.tsx` - Auth0Provider setup
  - `src/components/HOCS/withTokenValidation.tsx` - Token validation HOC
  - `src/redux/slices/authSlice.ts` - Auth state
  - `src/components/AppLayout/Header.tsx` - Login/logout buttons

#### 2. 3D Map Viewer (Cesium/Resium)
- Interactive 3D globe with FAA chart imagery
- Airport markers with click interactions
- Airspace visualization (Class B, C, D, E)
- Special use airspace (MOA, Restricted, Warning, etc.)
- PIREP markers
- AIRMET/SIGMET visualization
- Flight route rendering
- Camera controls
- **Source Files**:
  - `src/pages/ViewerPage.tsx` - Main viewer
  - `src/components/Cesium/` - Cesium entity components
  - `src/features/Airports/` - Airport features
  - `src/features/Airspace/` - Airspace features
  - `src/features/Airsigmets/` - Weather advisory features
  - `src/features/Pireps/` - PIREP features
  - `src/features/Flights/RouteComponent.tsx` - Route rendering
  - `src/features/Imagery/` - Imagery layer controls
  - `src/features/CameraControls/` - Camera controls

#### 3. Flight Planning
- Multi-step flight planning wizard
- Interactive route building with drag-and-drop waypoints
- Aircraft performance profile selection/creation
- Altitude and departure time configuration
- Nav log calculation and preview
- Round-trip flight creation
- **Source Files**:
  - `src/features/Flights/FlightPlanningDrawer/` - Main drawer and steps
  - `src/features/Flights/FlightRouteBuilder/` - Route builder
  - `src/redux/slices/flightPlanningSlice.ts` - Flight planning state

#### 4. Saved Flights
- Flight list view
- Flight details view with tabs (Overview, Nav Log, Airports, Weather, Settings)
- Flight editing
- Flight deletion
- Nav log regeneration
- PDF export
- **Source Files**:
  - `src/pages/FlightsPage.tsx`
  - `src/pages/FlightDetailsPage.tsx`
  - `src/features/Flights/` - Various components

#### 5. Aircraft Performance Profiles
- CRUD operations for profiles
- Profile form with validation
- Profile selection in flight planning
- **Source Files**:
  - `src/pages/AircraftProfilesPage.tsx`
  - `src/features/Flights/FlightPlanningDrawer/PerformanceProfiles/`

#### 6. Weather Data
- METAR display with decoded data
- TAF display with timeline
- PIREP visualization on map
- AIRMET/SIGMET visualization on map
- Cloud base display
- **Source Files**:
  - `src/features/Airports/InformationPopup/Weather/`
  - `src/features/Pireps/`
  - `src/features/Airsigmets/`

#### 7. Airport Information
- Airport search with autocomplete
- Airport info popup with tabs
- Runway information
- Communication frequencies
- Airport diagrams
- Chart supplements
- **Source Files**:
  - `src/components/Search/AirportsSearch.tsx`
  - `src/features/Airports/InformationPopup/`

#### 8. Sidebar Controls
- Responsive sidebar (desktop/mobile)
- Map imagery controls
- Route color customization
- Airport visibility controls
- PIREP toggle
- Airspace class toggles
- AIRMET/SIGMET hazard filters
- **Source Files**:
  - `src/components/Sidebar/`

#### 9. UI Components
- Bottom drawer (mobile-friendly)
- Entity info popups
- Tabs
- Accordion
- Section containers
- Loading indicators
- Error notices
- Tables with editable cells
- **Source Files**:
  - `src/components/`

### API Endpoints (RTK Query)

#### Airports API
- `getAllAirports` - Search airports
- `getAirportByIcaoCodeOrIdent` - Get single airport
- `getAirportsByState` - Get airports by state
- `getAirportsByStates` - Get airports by multiple states
- `getAirportsByIcaoCodesOrIdents` - Batch get airports
- `getAirportsByPrefix` - Get airports by prefix
- `getRunwaysByAirportCode` - Get runways

#### Flights API
- `createFlight` - Create flight
- `createRoundTripFlight` - Create round trip
- `getFlights` - Get user's flights
- `getFlight` - Get single flight
- `updateFlight` - Update flight
- `deleteFlight` - Delete flight
- `regenerateNavlog` - Regenerate nav log

#### Airspaces API
- `getAirspacesByClass` - Get by class
- `getAirspacesByCity` - Get by city
- `getAirspacesByState` - Get by state
- `getSpecialUseAirspacesByTypeCode` - Get special use
- `getAirspacesByIcaoOrIdent` - Get by identifier
- `getAirspacesByGlobalIds` - Get by IDs
- `getSpecialUseAirspacesByGlobalIds` - Get special use by IDs

#### Weather API
- `getAllAirsigmets` - Get all AIRMETs/SIGMETs
- `getMetarForAirport` - Get METAR
- `getMetarsByState` - Get METARs by state
- `getMetarsByStates` - Get METARs by states
- `getAllPireps` - Get all PIREPs
- `getTafForAirport` - Get TAF

#### Performance Profiles API
- `saveAircraftPerformanceProfile` - Create profile
- `getAircraftPerformanceProfiles` - Get profiles
- `updateAircraftPerformanceProfile` - Update profile
- `deleteAircraftPerformanceProfile` - Delete profile

#### Performance Calculations API
- `getCrosswindForAirport` - Get crosswind
- `calculateCrosswind` - Calculate crosswind
- `getDensityAltitudeForAirport` - Get density altitude
- `calculateDensityAltitude` - Calculate density altitude

#### Navlog API
- `calculateNavLog` - Calculate navigation log
- `calcBearingAndDistance` - Calculate bearing/distance

#### Chart Supplements API
- `getChartSupplementUrlByAirportCode` - Get chart supplement URL

#### Airport Diagram API
- `getAirportDiagramUrlByAirportCode` - Get airport diagram URL

#### Frequency API
- `getFrequenciesByServicedFacility` - Get frequencies

### Redux Slices

| Slice | Purpose | Persisted |
|-------|---------|-----------|
| `airportsSlice` | Airport visibility and search state | Partial |
| `authSlice` | Authentication token | Yes |
| `flightPlanningSlice` | Flight planning state | Yes |
| `viewerSlice` | Map viewer settings | Yes |
| `routeStyleSlice` | Route color customization | Yes |
| `airspacesSlice` | Airspace visibility toggles | No |
| `selectedEntitySlice` | Currently selected map entity | No |
| `searchSlice` | Search state | No |
| `sidebarSlice` | Sidebar open/closed state | No |
| `pirepsSlice` | PIREP visibility | No |
| `airsigmetsSlice` | AIRMET/SIGMET filters | No |

### DTOs/Interfaces

All DTOs are defined in `src/redux/api/vfr3d/dtos.ts` (auto-generated from NSwag):
- `AircraftPerformanceProfileDto`
- `AirportDto`, `RunwayDto`, `RunwayEndDto`
- `AirsigmetDto`, `AirsigmetArea`, `AirsigmetPoint`
- `AirspaceDto`, `SpecialUseAirspaceDto`
- `FlightDto`, `WaypointDto`, `NavigationLegDto`
- `CreateFlightRequestDto`, `UpdateFlightRequestDto`
- `MetarDto`, `TafDto`, `PirepDto`
- `NavlogRequestDto`, `NavlogResponseDto`
- `BearingAndDistanceRequestDto`, `BearingAndDistanceResponseDto`
- `CrosswindCalculationRequestDto`, `CrosswindCalculationResponseDto`
- `DensityAltitudeRequestDto`, `DensityAltitudeResponseDto`
- `CommunicationFrequencyDto`
- `AirportDiagramUrlDto`, `ChartSupplementUrlDto`

---

## Migration Phases

### Phase 1: Project Setup & Foundation
**Goal**: Set up the new project with all dependencies and basic configuration.

1. Initialize Vite + React + TypeScript project
2. Install all dependencies (Mantine, TanStack Router, etc.)
3. Configure Tailwind CSS with Mantine
4. Set up Cesium with vite-plugin-cesium
5. Configure environment variables
6. Set up ESLint and Prettier
7. Create basic folder structure

**Files to Create**:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `.env` (copy from source)
- `.eslintrc.cjs`
- `.prettierrc`
- `index.html`

### Phase 2: Core Infrastructure
**Goal**: Set up Redux store, RTK Query APIs, and routing.

1. Set up Redux store with persistence
2. Port all RTK Query API slices
3. Port all Redux slices
4. Port all DTOs/interfaces
5. Set up TanStack Router with route definitions
6. Configure Auth0 provider
7. Create protected route wrappers

**Files to Port/Create**:
- `src/main.tsx`
- `src/redux/store.ts`
- `src/redux/api/vfr3d/` - All API files
- `src/redux/slices/` - All slice files
- `src/routes/` - TanStack Router configuration
- `src/hooks/reduxHooks.tsx`

### Phase 3: Layout & Navigation
**Goal**: Create the app shell with Mantine components.

1. Create AppLayout with Mantine AppShell
2. Create Header with Mantine components
3. Create responsive navigation
4. Create Sidebar with Mantine NavLink/Accordion
5. Create Footer
6. Create error boundary

**Files to Create**:
- `src/components/Layout/AppLayout.tsx`
- `src/components/Layout/Header.tsx`
- `src/components/Layout/Footer.tsx`
- `src/components/Layout/Sidebar/`
- `src/components/Layout/ErrorBoundary.tsx`

### Phase 4: Reusable Components
**Goal**: Create all reusable UI components with Mantine.

1. Search components (AirportsSearch with Mantine Autocomplete)
2. Bottom drawer (Mantine Drawer)
3. Entity info popups (Mantine Modal/Popover)
4. Loading indicators (Mantine Loader)
5. Error notices (Mantine Alert)
6. Form components (Mantine Input, NumberInput, etc.)
7. Tables (Mantine Table)
8. Tabs (Mantine Tabs)
9. Accordion (Mantine Accordion)

**Files to Create**:
- `src/components/Search/`
- `src/components/Drawer/`
- `src/components/Popup/`
- `src/components/Form/`
- `src/components/Table/`
- `src/components/common/` - Loading, Error, etc.

### Phase 5: Cesium/Map Components
**Goal**: Port all Cesium-related components.

1. Port Cesium entity components (Point, Polyline, Polygon, Billboard)
2. Port point event registry
3. Port Cesium utilities
4. Create CesiumViewer component
5. Port imagery layers
6. Port camera controls

**Files to Port**:
- `src/components/Cesium/`
- `src/utility/cesiumUtils.ts`
- `src/hooks/useArcGisImageryProviders.tsx`
- `src/hooks/useDisableDoubleClickZoom.tsx`

### Phase 6: Viewer Page & Map Features
**Goal**: Build the main viewer page with all map features.

1. Create ViewerPage layout
2. Port Airport features (markers, info popup)
3. Port Airspace features
4. Port PIREP features
5. Port AIRMET/SIGMET features
6. Port Route component
7. Port FlyTo functionality
8. Port entity selection management

**Files to Create/Port**:
- `src/pages/ViewerPage.tsx`
- `src/features/Airports/`
- `src/features/Airspace/`
- `src/features/Pireps/`
- `src/features/Airsigmets/`
- `src/features/Flights/RouteComponent.tsx`
- `src/features/CameraControls/`

### Phase 7: Flight Planning
**Goal**: Implement the flight planning workflow.

1. Create FlightPlanningDrawer with Mantine Stepper
2. Port route builder with drag-and-drop
3. Port aircraft profile selection
4. Port altitude and departure controls
5. Port nav log preview
6. Port nav log calculation

**Files to Create/Port**:
- `src/features/Flights/FlightPlanningDrawer/`
- `src/features/Flights/FlightRouteBuilder/`

### Phase 8: Flights & Profiles Pages
**Goal**: Implement flights management pages.

1. Create FlightsPage with Mantine Table
2. Create FlightDetailsPage with Mantine Tabs
3. Create flight overview component
4. Create nav log table
5. Port PDF export
6. Create AircraftProfilesPage
7. Create profile forms

**Files to Create/Port**:
- `src/pages/FlightsPage.tsx`
- `src/pages/FlightDetailsPage.tsx`
- `src/pages/AircraftProfilesPage.tsx`
- `src/features/Flights/FlightDetails/`
- `src/features/Flights/NavLog/`

### Phase 9: Weather & Utilities Pages
**Goal**: Implement remaining pages.

1. Create WeatherSupportImageryPage
2. Port weather components (METAR, TAF display)

**Files to Create/Port**:
- `src/pages/WeatherSupportImageryPage.tsx`
- `src/features/Weather/`

### Phase 10: Landing Pages
**Goal**: Create marketing/landing pages.

1. Create HomePage with hero, features, demo sections
2. Create FeaturesPage
3. Create ContactMePage with EmailJS

**Files to Create**:
- `src/pages/HomePage.tsx`
- `src/pages/FeaturesPage.tsx`
- `src/pages/ContactMePage.tsx`
- `src/components/HomePage/`

### Phase 11: Polish & Testing
**Goal**: Final refinements and testing.

1. Responsive design testing
2. Animation refinements
3. Performance optimization
4. Accessibility improvements
5. Error handling review
6. Final styling adjustments

---

## Implementation Order Summary

1. **Phase 1**: Project Setup (Foundation)
2. **Phase 2**: Core Infrastructure (Redux, APIs, Routing)
3. **Phase 3**: Layout & Navigation (App Shell)
4. **Phase 4**: Reusable Components (UI Library)
5. **Phase 5**: Cesium/Map Components (3D Map)
6. **Phase 6**: Viewer Page (Core Feature)
7. **Phase 7**: Flight Planning (Core Feature)
8. **Phase 8**: Flights & Profiles Pages (User Features)
9. **Phase 9**: Weather & Utilities (Support Features)
10. **Phase 10**: Landing Pages (Marketing)
11. **Phase 11**: Polish & Testing (Quality)

---

## File Structure (New Project)

```
src/
├── main.tsx                      # Entry point with providers
├── App.tsx                       # Router configuration
├── index.css                     # Global styles
├── vite-env.d.ts                 # Vite types
│
├── routes/                       # TanStack Router
│   ├── __root.tsx                # Root layout
│   ├── index.tsx                 # Home page route
│   ├── viewer.tsx                # Viewer page route
│   ├── flights/
│   │   ├── index.tsx             # Flights list route
│   │   └── $flightId.tsx         # Flight details route
│   ├── profiles.tsx              # Profiles route
│   ├── contact.tsx               # Contact route
│   ├── features.tsx              # Features route
│   ├── weather-imagery.tsx       # Weather imagery route
│   └── redirect.tsx              # Auth redirect route
│
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Sidebar/
│   ├── Cesium/
│   │   ├── PointEntity.tsx
│   │   ├── PolylineEntity.tsx
│   │   ├── PolygonEntity.tsx
│   │   ├── BillboardEntity.tsx
│   │   ├── CesiumViewerConfig.tsx
│   │   └── pointEventRegistry.ts
│   ├── Search/
│   │   └── AirportsSearch.tsx
│   ├── Drawer/
│   │   └── BottomDrawer.tsx
│   ├── Popup/
│   │   ├── EntityInfoPopup.tsx
│   │   └── EntityInfoPopupManager.tsx
│   ├── Form/
│   │   └── NumericInput.tsx
│   ├── Table/
│   │   └── DataTable.tsx
│   ├── HOCs/
│   │   └── withTokenValidation.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorNotice.tsx
│       ├── FlightCategoryBadge.tsx
│       └── DualTime.tsx
│
├── features/
│   ├── Airports/
│   │   ├── Airports.tsx
│   │   ├── AirportEntity.tsx
│   │   ├── FlyTo.tsx
│   │   └── InformationPopup/
│   ├── Airspace/
│   │   ├── AirspaceComponent.tsx
│   │   └── AirspaceInfoPopup.tsx
│   ├── Airsigmets/
│   │   ├── AirsigmetComponent.tsx
│   │   └── AirsigmetInfoPopup.tsx
│   ├── Pireps/
│   │   ├── Pireps.tsx
│   │   ├── PirepEntity.tsx
│   │   └── PirepInformationPopup.tsx
│   ├── Flights/
│   │   ├── RouteComponent.tsx
│   │   ├── FlightPlanningDrawer/
│   │   ├── FlightRouteBuilder/
│   │   ├── FlightDetails/
│   │   └── NavLog/
│   ├── Imagery/
│   │   ├── ImageryLayers.tsx
│   │   └── ImageryControls.tsx
│   └── CameraControls/
│       └── CameraControls.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── ViewerPage.tsx
│   ├── FlightsPage.tsx
│   ├── FlightDetailsPage.tsx
│   ├── AircraftProfilesPage.tsx
│   ├── WeatherSupportImageryPage.tsx
│   ├── ContactMePage.tsx
│   ├── FeaturesPage.tsx
│   └── RedirectPage.tsx
│
├── redux/
│   ├── store.ts
│   ├── api/
│   │   └── vfr3d/
│   │       ├── vfr3dSlice.ts
│   │       ├── dtos.ts
│   │       ├── airports.api.ts
│   │       ├── flights.api.ts
│   │       ├── airspaces.api.ts
│   │       ├── weather.api.ts
│   │       ├── performanceProfiles.api.ts
│   │       ├── performance.api.ts
│   │       ├── navlog.api.ts
│   │       ├── chartSupplements.api.ts
│   │       ├── airportDiagram.api.ts
│   │       └── frequency.api.ts
│   └── slices/
│       ├── airportsSlice.ts
│       ├── authSlice.ts
│       ├── flightPlanningSlice.ts
│       ├── viewerSlice.ts
│       ├── routeStyleSlice.ts
│       ├── airspacesSlice.ts
│       ├── selectedEntitySlice.ts
│       ├── searchSlice.ts
│       ├── sidebarSlice.ts
│       ├── pirepsSlice.ts
│       └── airsigmetsSlice.ts
│
├── hooks/
│   ├── reduxHooks.tsx
│   ├── useSelectedEntity.tsx
│   ├── useFetchAirportData.ts
│   ├── useMapOptions.tsx
│   ├── useArcGisImageryProviders.tsx
│   └── useDisableDoubleClickZoom.tsx
│
├── utility/
│   ├── utils.ts
│   ├── cesiumUtils.ts
│   ├── constants.ts
│   ├── entityIdUtils.ts
│   ├── enums.ts
│   ├── types.ts
│   └── states.ts
│
├── styles/
│   └── animations.css
│
└── assets/
    └── images/
```

---

## Environment Variables Required

```env
# Auth0
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_REDIRECT_URI=
VITE_AUTH0_LOGOUT_URI=
VITE_AUTH0_VFR3D_API_AUDIENCE=

# API
VITE_VFR3D_BASE_URL=

# Cesium
VITE_CESIUM_API_KEY=

# ArcGIS
VITE_ARCGIS_API_KEY=
VITE_FAA_ARCGIS_BASE_URL=

# EmailJS
VITE_EMAILJS_USER_ID=
VITE_EMAILJS_VFR3D_EMAIL_SERVICE_ID=
VITE_EMAILJS_CONTACT_FORM_TEMPLATE_ID=
```

---

## Notes

### Stripe Exclusion
The following Stripe-related features are intentionally excluded from this migration:
- Subscription management
- Payment processing
- Subscription-protected routes (will be converted to auth-protected only)
- Pricing page

These can be re-added later when monetization is desired.

### Mantine UI Benefits
- Comprehensive component library with consistent design
- Built-in dark mode support
- Better accessibility out of the box
- Form handling with validation
- Notification system
- More customizable than DaisyUI

### TanStack Router Benefits
- Type-safe routing
- Better developer experience
- Built-in search params handling
- Loader/action patterns for data fetching
- Better code splitting support

---

## Ready to Begin

With this plan documented, we can start implementing Phase 1: Project Setup. Each phase builds upon the previous, ensuring a smooth migration process while maintaining all existing functionality.
