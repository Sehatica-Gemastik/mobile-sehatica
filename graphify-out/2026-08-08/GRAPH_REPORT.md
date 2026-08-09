# Graph Report - mobile-sehatica  (2026-08-08)

## Corpus Check
- 62 files · ~65,545 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 359 nodes · 662 edges · 62 communities (17 shown, 45 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d461abc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/index.ts
- theme.ts
- types/index.ts
- Expo App Configuration
- expo-constants
- app-tabs.tsx
- Project Dependencies and Scripts
- login.tsx
- TypeScript Configuration
- dependencies
- Project Reset Script
- Splash Screen Animations
- Web Splash Animations
- App Icon Assets
- Project Documentation
- @expo-google-fonts/dm-sans
- Blur Effects
- Expo Core
- Device Information
- @expo/ui
- Glass UI Effects
- Inter Font
- Playfair Display Font
- Image Component
- Image Picker
- Linear Gradient
- Deep Linking
- Secure Storage
- Splash Screen
- Status Bar
- SF Symbols
- System UI
- Web Browser
- React Core
- React DOM
- Gesture Handling
- Markdown Rendering
- Reanimated Library
- Safe Area Management
- Screen Management
- Worklets Library
- Data Fetching
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
- @expo/vector-icons
- react-native

## God Nodes (most connected - your core abstractions)
1. `Colors` - 22 edges
2. `Icon()` - 20 edges
3. `Fonts` - 19 edges
4. `Spacing` - 18 edges
5. `BorderRadius` - 18 edges
6. `FontSize` - 18 edges
7. `expo` - 13 edges
8. `expo-router` - 10 edges
9. `IconName` - 10 edges
10. `useAuthStore` - 10 edges

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

## Communities (62 total, 45 thin omitted)

### Community 0 - "ui/index.ts"
Cohesion: 0.07
Nodes (53): styles, SUGGESTIONS, WA_FEATURES, styles, ADD_TYPES, AddType, FILTERS, styles (+45 more)

### Community 1 - "theme.ts"
Cohesion: 0.15
Nodes (20): styles, TabTwoScreen(), ExternalLink(), Props, HintRowProps, styles, styles, ThemedText() (+12 more)

### Community 2 - "types/index.ts"
Cohesion: 0.08
Nodes (30): styles, HeallyScreen(), ChatBubbleProps, MedicalRecordCardProps, VerifBadgeProps, API_BASE_URL, API_ENDPOINTS, api (+22 more)

### Community 3 - "Expo App Configuration"
Cohesion: 0.08
Nodes (23): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+15 more)

### Community 5 - "app-tabs.tsx"
Cohesion: 0.20
Nodes (8): styles, BottomTabBar(), styles, Tab, TABS, HeallyFAB(), HeallyFABProps, styles

### Community 6 - "Project Dependencies and Scripts"
Cohesion: 0.11
Nodes (18): devDependencies, @playwright/test, @types/react, typescript, main, name, private, scripts (+10 more)

### Community 7 - "login.tsx"
Cohesion: 0.12
Nodes (17): plugins, expo-router, LoginScreen(), styles, RegisterScreen(), styles, AuthGuard(), queryClient (+9 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.15
Nodes (12): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, paths (+4 more)

### Community 9 - "dependencies"
Cohesion: 0.22
Nodes (9): expo-av, expo-font, expo-router, dependencies, expo-av, expo-font, expo-router, react-native-web (+1 more)

### Community 10 - "Project Reset Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 11 - "Splash Screen Animations"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 12 - "Web Splash Animations"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 13 - "App Icon Assets"
Cohesion: 0.67
Nodes (3): Expo Symbol SVG, Android Icon Foreground, App Icon

## Knowledge Gaps
- **158 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `login.tsx` to `ui/index.ts`, `theme.ts`, `app-tabs.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `expo` connect `Expo App Configuration` to `login.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `plugins` connect `login.tsx` to `Expo App Configuration`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0715372907153729 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `Expo App Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._