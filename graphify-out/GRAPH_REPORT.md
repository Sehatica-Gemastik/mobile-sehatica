# Graph Report - .  (2026-08-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 325 nodes · 514 edges · 60 communities (18 shown, 42 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 1,119 input · 630 output

## Graph Freshness
- Built from commit: `e787334b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Components and Screens
- Theming and UI Elements
- Doctor Feature and API
- Expo App Configuration
- Chat Interface Components
- Navigation and Layouts
- Project Dependencies and Scripts
- Authentication and State
- TypeScript Configuration
- Core Mobile Dependencies
- Project Reset Script
- Splash Screen Animations
- Web Splash Animations
- App Icon Assets
- Project Documentation
- Audio and Video
- Blur Effects
- Expo Core
- Device Information
- Font Management
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

## God Nodes (most connected - your core abstractions)
1. `Colors` - 17 edges
2. `Spacing` - 16 edges
3. `BorderRadius` - 14 edges
4. `expo` - 13 edges
5. `FontSize` - 13 edges
6. `expo-router` - 11 edges
7. `useAuthStore` - 10 edges
8. `useTheme()` - 9 edges
9. `ChatMessage` - 8 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `plugins` --extends--> `expo-router`  [EXTRACTED]
  app.json → package.json
- `Android Icon Foreground` --semantically_similar_to--> `Expo Symbol SVG`  [INFERRED] [semantically similar]
  assets/images/android-icon-foreground.png → assets/expo.icon/Assets/expo-symbol 2.svg
- `App Icon` --semantically_similar_to--> `Expo Symbol SVG`  [INFERRED] [semantically similar]
  assets/images/icon.png → assets/expo.icon/Assets/expo-symbol 2.svg
- `LoginScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  src/app/(auth)/login.tsx → src/store/auth-store.ts
- `RegisterScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  src/app/(auth)/register.tsx → src/store/auth-store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Expo Branding Assets** — assets_expo_icon_assets_expo_symbol_2_svg, assets_images_expo_logo_png, assets_images_expo_badge_png, assets_images_expo_badge_white_png [EXTRACTED 1.00]

## Communities (60 total, 42 thin omitted)

### Community 0 - "UI Components and Screens"
Cohesion: 0.11
Nodes (25): styles, styles, AddType, FILTERS, styles, styles, MedicalRecordCard(), MedicalRecordCardProps (+17 more)

### Community 1 - "Theming and UI Elements"
Cohesion: 0.14
Nodes (21): styles, TabTwoScreen(), ExternalLink(), Props, HintRowProps, styles, styles, ThemedText() (+13 more)

### Community 2 - "Doctor Feature and API"
Cohesion: 0.14
Nodes (18): SPECIALTIES, styles, API_BASE_URL, API_ENDPOINTS, api, ApiError, refreshAccessToken(), request() (+10 more)

### Community 3 - "Expo App Configuration"
Cohesion: 0.08
Nodes (23): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+15 more)

### Community 4 - "Chat Interface Components"
Cohesion: 0.12
Nodes (18): HeallyScreen(), styles, SUGGESTIONS, ChatBubble(), ChatBubbleProps, styles, styles, TypingIndicator() (+10 more)

### Community 5 - "Navigation and Layouts"
Cohesion: 0.12
Nodes (12): plugins, expo-router, expo-router, styles, BottomTabBar(), styles, Tab, TABS (+4 more)

### Community 6 - "Project Dependencies and Scripts"
Cohesion: 0.11
Nodes (18): devDependencies, @playwright/test, @types/react, typescript, main, name, private, scripts (+10 more)

### Community 7 - "Authentication and State"
Cohesion: 0.15
Nodes (13): LoginScreen(), styles, RegisterScreen(), AuthGuard(), queryClient, HomeScreen(), authService, LoginResponse (+5 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.15
Nodes (12): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, paths (+4 more)

### Community 9 - "Core Mobile Dependencies"
Cohesion: 0.22
Nodes (9): expo-constants, @expo/ui, dependencies, expo-constants, @expo/ui, react-native, react-native-web, react-native (+1 more)

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
- **145 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `Navigation and Layouts` to `UI Components and Screens`, `Theming and UI Elements`, `Authentication and State`?**
  _High betweenness centrality (0.383) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core Mobile Dependencies` to `Navigation and Layouts`, `Project Dependencies and Scripts`, `Audio and Video`, `Blur Effects`, `Expo Core`, `Device Information`, `Font Management`, `Glass UI Effects`, `Inter Font`, `Playfair Display Font`, `Image Component`, `Image Picker`, `Linear Gradient`, `Deep Linking`, `Secure Storage`, `Splash Screen`, `Status Bar`, `SF Symbols`, `System UI`, `Web Browser`, `React Core`, `React DOM`, `Gesture Handling`, `Markdown Rendering`, `Reanimated Library`, `Safe Area Management`, `Screen Management`, `Worklets Library`, `Data Fetching`, `State Management`?**
  _High betweenness centrality (0.348) - this node is a cross-community bridge._
- **Why does `expo-router` connect `Navigation and Layouts` to `Core Mobile Dependencies`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components and Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Should `Theming and UI Elements` be split into smaller, more focused modules?**
  _Cohesion score 0.1431451612903226 - nodes in this community are weakly interconnected._
- **Should `Doctor Feature and API` be split into smaller, more focused modules?**
  _Cohesion score 0.13978494623655913 - nodes in this community are weakly interconnected._