---
name: Firebase emulator Java
description: Java runtime requirement encountered while running the Firebase Firestore and Storage emulators in this Replit project.
---

When running Firebase CLI 15 emulators in this Replit environment, verify `java -version` and use JDK 21 or newer. The `java-graalvm22.3` module resolved to Java 19 here, while installing the `jdk21` system package allowed the emulators to start.

**Why:** Firebase CLI 15 refuses to start the Firestore emulator with Java versions below 21, even when the Replit Java module is installed.

**How to apply:** Before emulator tests, check the actual Java runtime version rather than relying on the module name; add `jdk21` temporarily if needed.
