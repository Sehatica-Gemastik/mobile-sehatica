#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Gradle/Android harus JDK 17–21. Java 26 sistem bikin jlink/androidJdkImage gagal.
if [[ -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
elif [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JAVA_HOME belum diset dan Android Studio JBR tidak ditemukan."
  exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"

WRAPPER_JAR="android/gradle/wrapper/gradle-wrapper.jar"
SOURCE_JAR="node_modules/@react-native/gradle-plugin/gradle/wrapper/gradle-wrapper.jar"

if [[ ! -f "$SOURCE_JAR" ]]; then
  echo "node_modules belum lengkap — jalankan bun install dulu"
  exit 1
fi

if [[ ! -f "$WRAPPER_JAR" ]] || ! unzip -t "$WRAPPER_JAR" >/dev/null 2>&1; then
  echo "Memperbaiki gradle-wrapper.jar..."
  mkdir -p android/gradle/wrapper
  cp "$SOURCE_JAR" "$WRAPPER_JAR"
fi

# expo prebuild kadang menghasilkan jar yang invalid untuk java -jar
if [[ -f "$WRAPPER_JAR" ]] && [[ -n "${JAVA_HOME:-}" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
  if ! "$JAVA_HOME/bin/java" -jar "$WRAPPER_JAR" --version >/dev/null 2>&1; then
    echo "gradle-wrapper.jar invalid — mengganti dari @react-native/gradle-plugin"
    cp "$SOURCE_JAR" "$WRAPPER_JAR"
  fi
fi

echo "JAVA_HOME=${JAVA_HOME:-<system java>}"

SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK_DIR" && -d "$HOME/Library/Android/sdk" ]]; then
  SDK_DIR="$HOME/Library/Android/sdk"
fi

if [[ -z "$SDK_DIR" || ! -d "$SDK_DIR" ]]; then
  echo "Android SDK tidak ditemukan."
  echo "Install Android Studio, buka sekali, lalu SDK Manager → Android SDK."
  echo "Atau set: export ANDROID_HOME=\"\$HOME/Library/Android/sdk\""
  exit 1
fi

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"

LOCAL_PROPS="android/local.properties"
mkdir -p android
printf 'sdk.dir=%s\n' "$SDK_DIR" > "$LOCAL_PROPS"
echo "ANDROID_HOME=$SDK_DIR"

GRADLE_PROPS="android/gradle.properties"
if [[ -f "$GRADLE_PROPS" ]]; then
  if grep -q '^org.gradle.java.home=' "$GRADLE_PROPS"; then
    sed -i '' "s|^org.gradle.java.home=.*|org.gradle.java.home=$JAVA_HOME|" "$GRADLE_PROPS"
  else
    printf '\n# Pin JDK for Android build (avoid system Java 26)\norg.gradle.java.home=%s\n' "$JAVA_HOME" >> "$GRADLE_PROPS"
  fi
fi

# Stop daemon lama yang mungkin masih pakai Java 26
if [[ -x "android/gradlew" ]]; then
  (cd android && ./gradlew --stop >/dev/null 2>&1 || true)
fi
