# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Android development

This SDK 57 project uses SQLCipher and therefore requires a development build. Expo Go from the Play Store (SDK 54) is not compatible.

1. Install dependencies.

   ```bash
   bun install
   ```

2. Build and install on a USB-connected Android device with USB debugging enabled.

   ```bash
   bun run android:device
   ```

   Or build an installable development APK through EAS:

   ```bash
   bunx eas-cli build --platform android --profile development
   ```

3. After installing the APK, start Metro for the development client.

   ```bash
   bun run start:dev-client
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

### Domain A implementation status (PRD-A)

Target Kesehatan / risk badge + manual data-entry live on Beranda (`src/app/(tabs)/index.tsx`),
Critical Alert banner (`src/components/alert-banner.tsx`), Smart Schedule manual create/delete +
"belum diverifikasi" badge (`src/app/(tabs)/schedule.tsx`, `src/components/schedule-item.tsx`),
local reminders via `expo-notifications` (`src/services/notifications.service.ts`).

- Local reminders only run on iOS/Android (Expo Go is fine, no dev build needed) — no-op on web,
  since browsers can't reliably fire a scheduled notification after the tab closes.
- Backend must be running for the app to work — see `backend-sehatica/README.md`. The dev API base
  URL is `127.0.0.1` (not `localhost`) in `src/constants/api.ts` — on some machines `localhost`
  resolves to a different process over IPv6 before reaching the backend.
- Google Calendar sync (PRD-A §2.7) is **not implemented** — needs Google OAuth credentials only
  the team can provision; picked lowest-priority per the PRD.

Run the Playwright e2e checks for these (needs `npx expo start --web` and the backend both running):
```sh
npx playwright test tests/risk-dashboard.spec.ts
```

### Graphify setup

If there are more updates on the project, restart the graphify:
```terminal
graphify . --mode deep // make sure use api key
graphify cluster-only .
```
