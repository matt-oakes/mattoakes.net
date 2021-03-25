---
title: "Upgrade to React Native 0.58 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.58"
weight: 58
summary: "Learn how to upgrade to React Native 0.58 and why you need to make certain changes to your project."
---

The normal upgrade process applies, however, to upgrade smoothly it is useful to understand what's new and _why_ you need to make certain changes to your project.

Make sure to take a look at the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#058) for full details on what is included in this release.

{{< react-native-upgrade-callout >}}

## Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, and especially if you are going to install a .0 version, check the React Native issue tracker to see if there are any major issues with the new release which might affect you. You should also go through the libraries that you use and see if anyone is reporting any compatibility issues with the new version.

By doing this before starting, you can save yourself some time running into known issues and instead wait until patches are released which make the process smoother.

Assuming that there doesn't seem to be any blockers, you are ready to start upgrading.

## Upgrading to React Native 0.58

As with all React Native upgrades, it is recommended that you take a look at the diff for the newly created projects and apply these changes to your own project.

You can do this using the [rn-diff-purge](https://github.com/react-native-community/rn-diff-purge) tool and the diff I will be talking you through is the one between [0.57.8 and 0.58.6](https://github.com/react-native-community/rn-diff-purge/compare/release/0.57.8..release/0.58.6). You can just follow this diff and make the changes yourself, however, I want to explain to you what each of these changes means to give you a much better understanding of _why_ you need to make the changes.

### Upgrade the Dependency Versions

The first step is to upgrade the dependencies in your `package.json` and install them. Remember that each React Native version is tied to a specific version of React, so make sure you upgrade that as well. You should also make sure that `react-test-renderer` matches the React version, if you use it, and that you upgrade the `metro-react-native-babel-preset` and `babel-core` versions if you didn't already.

```diff
"dependencies": {
  "react": "16.6.3",
  "react-native": "0.58.6"
},
"devDependencies": {
  "babel-core": "^7.0.0-bridge.0",
  "babel-jest": "24.7.1",
  "jest": "24.7.1",
  "metro-react-native-babel-preset": "0.53.1",
  "react-test-renderer": "16.6.3"
},
```

### Flow Upgrade

First an easy one. The version of Flow which React Native uses has been updated in 0.58. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.86.0` and you have the same value in the `[version]` your `.flowconfig` file.

```diff
[version]
- ^0.86.0
+ ^0.92.0
```

If you are using Flow for type checking in your project, this might lead to additional errors in your own code. I recommend that you take a look at the [changelog](https://github.com/facebook/flow/blob/master/Changelog.md) for the versions between 0.78 and 0.86 to see what might be causing them.

If you are using Typescript for type checking you code then you can actually remove the `.flowconfig` file and the `flow-bin` dependency and ignore this bit of the diff.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, however, my personal preference is to use Typescript.

### Android Gradle Changes

React Native 0.58 has various changes to the Gradle build tools and Android Gradle plugins.

#### Adding Arm 64-bit support to ABI splits

As React Native 0.58 includes partial 64-bit support on Android, we need to update the code which handles the ABI split flag.

This flag tells the build system to create a separate APK for each architecture which includes only the library binaries required for that architecture. With the flag set to false, the build system will create a single APK which includes a version of the library for each architecture. Turning this on means that the APK which gets set to users will be significantly smaller.

The first change tells the build system that we want an APK for the `arm64-v8a` architecture.

```diff
splits {
    abi {
        reset()
        enable enableSeparateBuildPerCPUArchitecture
        universalApk false  // If true, also generate a universal APK
-       include "armeabi-v7a", "x86"
+       include "armeabi-v7a", "x86", "arm64-v8a"
    }
}
```

The second line changes the code which sets the version code for each APK. This is needed because each APK in the ABI requires a separate version code which goes up each time the app is updated. This code block adds a different constant for each architecture to your base version code so they each get their own distinct values which are unlikely to overlap. For more details take a look at the [Android documentation for ABI splits](https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions).

```diff
applicationVariants.all { variant ->
    variant.outputs.each { output ->
        // For each separate APK per architecture, set a unique version code as described here:
        // http://tools.android.com/tech-docs/new-build-system/user-guide/apk-splits
-       def versionCodes = ["armeabi-v7a":1, "x86":2]
+       def versionCodes = ["armeabi-v7a":1, "x86":2, "arm64-v8a": 3]
        def abi = output.getFilter(OutputFile.ABI)
        if (abi != null) {  // null for the universal-debug, universal-release variants
            output.versionCodeOverride =
                    versionCodes.get(abi) * 1048576 + defaultConfig.versionCode
        }
    }
}
```

The final change remove the unused `ndk` section from the `defaultConfig` in `android/app/build.gradle`:

```diff
defaultConfig {
    applicationId "com.rndiffapp"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1
    versionName "1.0"
-   ndk {
-       abiFilters "armeabi-v7a", "x86"
-   }
}
```

Even if you don't use the feature, I recommend that you make these changes so you can enable the feature with no issues in the future.

#### Upgraded Gradle version

This version of React Native upgrades the version of Gradle and the Android Gradle Plugin that it uses. You need to make the version changes in the `android/build.gralde` file:

```diff
buildscript {
    ext {
- 			buildToolsVersion = "27.0.3"
+       buildToolsVersion = "28.0.2"
        minSdkVersion = 16
-       compileSdkVersion = 27
-       targetSdkVersion = 26
-       supportLibVersion = "27.1.1"
+       compileSdkVersion = 28
+       targetSdkVersion = 27
+       supportLibVersion = "28.0.0"
    }
    repositories {
        google()
        jcenter()
    }
    dependencies {
-       classpath 'com.android.tools.build:gradle:3.1.4'
+       classpath 'com.android.tools.build:gradle:3.2.1'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

```diff
task wrapper(type: Wrapper) {
-   gradleVersion = '4.4'
+   gradleVersion = '4.7'
    distributionUrl = distributionUrl.replace("bin", "all")
}
```

And the `android/gradle/wrapper/gradle-wrapper.properties` file:

```diff
- distributionUrl=https\://services.gradle.org/distributions/gradle-4.4-all.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-4.7-all.zip
```

#### Android SDK version upgrades

With Android there are three SDK versions which we need to specify:

- `minSdkVersion`: This specifies the minimum Android version which our app supports. Even through React Native is using APIs which were added between 16 and 28 it has fallbacks which means that it can support Android devices all the way down to platform level 16 (known to users as 4.1). Leave this set to `16` unless you use a library which requires a higher Android version.
- `compileSdkVersion`: This specifies the Android SDK which will be used to compile our app. We want to use APIs which were added in Android SDK 28, so we need to set this to at least `28`.
- `targetSdkVersion`: This set the SDK which we are "targeting". When a new Android SDK is released which includes new or changed behaviour, the Android system will use this values to selectively turn off these changes and put the app into a "compatibility mode". The allows apps which expected the behaviour of a certain version to still work on new versions of the operating system. As the move from 26 to 27 is a minor Android version bump (8.0 to 8.1) there are no breaking changes in behaviour when we change this to `27`.

I encourage you to read more about the [behaviour changes in Android SDK 28](https://developer.android.com/about/versions/pie/android-9.0-changes-28#tls-enabled) to make sure the rest of your app is not affected.

## Add the JavascriptCore.framework to Xcode project

You now need to include the `JavaScriptCore.framework` as a linked framework inside your Xcode project. The easiest way to do this is to open Xcode and then open the project setting by clicking on the name of your project in the top of the left panel (1). You then need to select the correct target (2) and then go to the build phases section (3). This screen show the steps that Xcode takes to build your project. Expand the "Link Binary with Libraries" section and press the plus button (4). You can then search for and add the `JavaScriptCore.framework` item.

![Steps to link a framework in Xcode](https://camo.githubusercontent.com/c09cd42747364b498efa7c82fcb73978ba076eae/687474703a2f2f646f63732e6f6e656d6f62696c6573646b2e616f6c2e636f6d2f696f732d61642d73646b2f616464696e672d6672616d65776f726b732e706e67)

When you have done this, the framework will appear in the list. The order doesn't matter.

### Rename `.babelrc` to `babel.config.js`

The new template app renames the `.babelrc` file to `babel.config.js`. This was done due to [an issue with Jest](https://github.com/facebook/react-native/pull/23150) versions below version 24.0.0. If you are either not using Jest, or you are using at least version 24.0.0, then you can technically leave the file as it is. I would recommend making the change though as the Javascript version of the config file is more powerful and easier to work with.

As well as renaming the file, you will need to change it to use a CommonJS export. If you have changed the Babel configuration for your app, you will need to move those over to the new file as well.

```diff
- {
+ module.exports = {
  "presets": ["module:metro-react-native-babel-preset"]
}
```

### Changes to the Buck Android build file

The new template includes [some changes to the Buck build script](https://github.com/facebook/react-native/commit/c5daf3fed900a949a4e449a7c55b4bc1e9e7fdd9). If you don't use [Buck](https://buck.build), then you can just ignore these changes. If you do, then you'll want to follow [the diff](https://github.com/react-native-community/rn-diff-purge/compare/release/0.57.8..release/0.58.6) for the `android/app/BUCK` and `android/app/build_defs.bzl` files.

## Testing & Finishing Up

Those are all of the changes that you are required to make for all projects, however, there are a couple of other breaking changes which might affect some apps. You should [read through the changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#058) to see if anything applies to your project. You should also go through the libraries you use to see if any upgrade is required.
