# Graph Report - mobile-sehatica  (2026-08-09)

## Corpus Check
- 80 files · ~80,956 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 514 nodes · 1005 edges · 67 communities (18 shown, 49 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d461abc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.ts
- explore.tsx
- useAuthStore
- expo
- expo-constants
- health-db.ts
- scripts
- getHealthDatabase
- TypeScript Configuration
- expo
- Project Reset Script
- expo-sqlite
- App Icon Assets
- Project Documentation
- @expo-google-fonts/dm-sans
- Sehatica Mobile + Backend Architecture — Phase 1
- expo-glass-effect
- (tabs)/index.tsx
- @expo/ui
- @expo-google-fonts/inter
- expo-linking
- Playfair Display Font
- Image Component
- Image Picker
- Linear Gradient
- expo-secure-store
- expo-symbols
- Splash Screen
- Status Bar
- react-native-markdown-display
- System UI
- Web Browser
- types/index.ts
- React DOM
- Gesture Handling
- @tanstack/react-query
- Reanimated Library
- dependencies
- Screen Management
- Worklets Library
- State Management
- Layout Diagrams
- Android Icon Background
- Android Icon Monochrome
- Expo Badge
- Expo Badge White
- Expo Logo
- Favicon
- Logo Glow Effect
- React Logo
- Splash Screen Icon
- Explore Tab Icon
- Home Tab Icon
- Home Tab Icon
- react-native
- expo-file-system
- expo-font
- react-native-web
- react
- metro.config.js
- expo-av
- expo-device
- expo-notifications

## God Nodes (most connected - your core abstractions)
1. `getHealthDatabase()` - 27 edges
2. `Colors` - 23 edges
3. `Icon()` - 21 edges
4. `Fonts` - 20 edges
5. `Spacing` - 19 edges
6. `BorderRadius` - 19 edges
7. `FontSize` - 19 edges
8. `useAuthStore` - 16 edges
9. `Sehatica Mobile + Backend Architecture — Phase 1` - 14 edges
10. `expo` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Android Icon Foreground` --semantically_similar_to--> `Expo Symbol SVG`  [INFERRED] [semantically similar]
  assets/images/android-icon-foreground.png → assets/expo.icon/Assets/expo-symbol 2.svg
- `App Icon` --semantically_similar_to--> `Expo Symbol SVG`  [INFERRED] [semantically similar]
  assets/images/icon.png → assets/expo.icon/Assets/expo-symbol 2.svg
- `LoginScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  src/app/(auth)/login.tsx → src/store/auth-store.ts
- `RegisterScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  src/app/(auth)/register.tsx → src/store/auth-store.ts
- `HomeScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  src/app/(tabs)/index.tsx → src/store/auth-store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Expo Branding Assets** — assets_expo_icon_assets_expo_symbol_2_svg, assets_images_expo_logo_png, assets_images_expo_badge_png, assets_images_expo_badge_white_png [EXTRACTED 1.00]

## Communities (67 total, 49 thin omitted)

### Community 0 - "theme.ts"
Cohesion: 0.07
Nodes (65): styles, styles, styles, styles, SUGGESTIONS, WA_FEATURES, styles, ADD_TYPES (+57 more)

### Community 1 - "explore.tsx"
Cohesion: 0.08
Nodes (28): expo-image, styles, TabTwoScreen(), glowKeyframe, keyframe, logoKeyframe, styles, glowKeyframe (+20 more)

### Community 2 - "useAuthStore"
Cohesion: 0.21
Nodes (10): LoginScreen(), RegisterScreen(), AuthGuard(), queryClient, HeallyScreen(), ChatBubbleProps, useAuthStore, HeallyStore (+2 more)

### Community 3 - "expo"
Cohesion: 0.06
Nodes (27): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+19 more)

### Community 5 - "health-db.ts"
Cohesion: 0.33
Nodes (10): bytesToHex(), getOrCreateDatabaseKey(), KEY_OPTIONS, openHealthDatabase(), HEALTH_DATABASE_VERSION, MIGRATION_0_TO_1, MIGRATION_1_TO_2, MIGRATION_2_TO_3 (+2 more)

### Community 6 - "scripts"
Cohesion: 0.10
Nodes (19): devDependencies, @playwright/test, @types/react, typescript, main, name, private, scripts (+11 more)

### Community 7 - "getHealthDatabase"
Cohesion: 0.07
Nodes (51): API_BASE_URL, API_ENDPOINTS, api, ApiError, refreshAccessToken(), refreshOnce(), request(), LoginResponse (+43 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.15
Nodes (12): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, paths (+4 more)

### Community 10 - "Project Reset Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 13 - "App Icon Assets"
Cohesion: 0.67
Nodes (3): Expo Symbol SVG, Android Icon Foreground, App Icon

### Community 17 - "Sehatica Mobile + Backend Architecture — Phase 1"
Cohesion: 0.06
Nodes (34): A. Current architecture assessment, B. Problems and risks, Backend, C. Proposed mobile and doctor-web architecture, Critical, D. Proposed backend architecture and responsibilities, Doctor web, Doctor web (+26 more)

### Community 19 - "(tabs)/index.tsx"
Cohesion: 0.09
Nodes (24): HomeScreen(), LOG_TITLES, LOG_TYPES, styles, ScheduleScreen(), ScheduleItemCardProps, dailyLogsService, scheduleRemindersService (+16 more)

### Community 34 - "types/index.ts"
Cohesion: 0.11
Nodes (29): ANSWER_OPTIONS, styles, MedicalRecordCardProps, VerifBadgeProps, evaluateScreening(), SCREENING_CHECK_LABELS, SCREENING_FACTOR_LABELS, SCREENING_INSTRUMENT_VERSION (+21 more)

### Community 39 - "dependencies"
Cohesion: 0.18
Nodes (11): expo-blur, expo-crypto, expo-router, @expo/vector-icons, dependencies, expo-blur, expo-crypto, expo-router (+3 more)

## Knowledge Gaps
- **208 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `plugins` connect `expo` to `explore.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `expo-router` connect `expo` to `theme.ts`, `explore.tsx`, `useAuthStore`, `types/index.ts`, `(tabs)/index.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0652014652014652 - nodes in this community are weakly interconnected._
- **Should `explore.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07610993657505286 - nodes in this community are weakly interconnected._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._