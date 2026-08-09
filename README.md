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

### Graphify setup

If there are more updates on the project, restart the graphify:
```terminal
graphify . --mode deep // make sure use api key
graphify cluster-only .
```
