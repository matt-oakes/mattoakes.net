---
title: "Upgrade to React Native 0.57 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.57"
weight: 57
summary: "Upgrading to React Native 0.57 is easy when you know what the changes to your project mean."
---

The normal upgrade process applies, however, to upgrade smoothly it is useful to understand what's new and _why_ you need to make certain changes to your project.

Make sure to take a look at the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#0578) for full details on what is included in this release.

{{< react-native-upgrade-callout >}}

## Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, and especially if you are going to install a .0 version, check the React Native issue tracker to see if there are any major issues with the new release which might affect you. You should also go through the libraries that you use and see if anyone is reporting any compatibility issues with the new version.

By doing this before starting, you can save yourself some time running into known issues and instead wait until patches are released which make the process smoother.

Assuming that there doesn't seem to be any blockers, you are ready to start upgrading.

## Upgrading to React Native 0.57

As with all React Native upgrades, it is recommended that you take a look at the diff for the newly created projects and apply these changes to your own project.

You can do this using the [rn-diff-purge](https://github.com/react-native-community/rn-diff-purge) tool and the diff I will be talking you through is the one between [0.56.1 and 0.57.8](https://github.com/react-native-community/rn-diff-purge/compare/release/0.56.1..release/0.57.8). You can just follow this diff and make the changes yourself, however, I want to explain to you what each of these changes means to give you a much better understanding of _why_ you need to make the changes.

### Upgrade the Dependency Versions

The first step is to upgrade the dependencies in your `package.json` and install them. Remember that each React Native version is tied to a specific version of React, so make sure you upgrade that as well. You should also make sure that, if you use it, `react-test-renderer` matches the React version. We also need to remove the old `babel-preset-react-native` package and replace it with the new `metro-react-native-babel-preset` one. More details on that later.

```diff
"dependencies": {
- "react": "16.4.1",
- "react-native": "0.56.1"
+ "react": "16.6.3",
+ "react-native": "0.57.8"
},
"devDependencies": {
    "babel-jest": "24.7.1",
- "babel-preset-react-native": "^5",
    "jest": "24.7.1",
+ "metro-react-native-babel-preset": "0.53.1",
- "react-test-renderer": "16.4.1"
+ "react-test-renderer": "16.6.3"
},
```

### Flow Upgrade

First an easy one. The version of Flow which React Native uses has been updated in 0.57. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.78.0` and you have the same value in the `[version]` your `.flowconfig` file.

```diff
[version]
- ^0.75.0
+ ^0.78.0
```

There are also a few changes to the options that are enabled:

```diff
[options]
emoji=true

+ esproposal.optional_chaining=enable
+ esproposal.nullish_coalescing=enable
```

If you are using Flow for type checking in your project, this might lead to additional errors in your own code. I recommend that you take a look at the [changelog](https://github.com/facebook/flow/blob/master/Changelog.md) for the versions between 0.75 and 0.78 to see what might be causing them.

If you are using Typescript for type checking you code then you can actually remove the `.flowconfig` file and the `flow-bin` dependency and ignore this bit of the diff.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, however, my personal preference is to use Typescript.

### Migrate to the new Babel Preset

React Native 0.57 uses a new package from it's Babel preset. React Native is packaged using Metro which internally uses Babel to compile your code. The `metro-react-native-babel-preset` package defines the default configuration that is used by React Native projects. Previously, it was called `babel-preset-react-native`.

You already added the correct package with the changes to `package.json`. The next step is to change your `.babelrc` file to use the new package:

```diff
{
-  "presets": ["react-native"]
+  "presets": ["module:metro-react-native-babel-preset"]
}
```

If you have any customisations to your Babel config you should be able to keep them all as they were before.

### Android Gradle Changes

React Native 0.57 has various changes to the Gradle build tools and Android Gradle plugins.

### Changes to the Google Maven repository

Firstly, you need to change how the Google Maven repository is defined. Maven repositories are listed in your Gradle build scripts and Gradle will use them to look for the dependencies you ask for. Make the following changes and make sure the new `google()` lines are above any `jcenter()` lines:

```diff
buildscript {
    repositories {
-       maven {
-           url 'https://maven.google.com/'
-           name 'Google'
-       }
+       google()
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.3.3'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
allprojects {
    repositories {
        mavenLocal()
-       maven {
-           url 'https://maven.google.com/'
-           name 'Google'
-       }
+       google()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}
```

### Upgrading Android and Gradle plugin versions

This version of React Native upgrades the version of Gradle and the Android Gradle Plugin that it uses. You need to make the version changes in the `android/build.gralde` file:

```diff
buildscript {
+   // Move the ext block to here if you prefer

    repositories {
        google()
        jcenter()
    }
    dependencies {
-       classpath 'com.android.tools.build:gradle:2.3.3'
+       classpath 'com.android.tools.build:gradle:3.1.4'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
allprojects {
    repositories {
        mavenLocal()
        google()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}

ext {
-   buildToolsVersion = "26.0.3"
+   buildToolsVersion = "27.0.3"
    minSdkVersion = 16
-   compileSdkVersion = 26
+   compileSdkVersion = 27
    targetSdkVersion = 26
-   supportLibVersion = "26.1.0"
+   supportLibVersion = "27.1.1"
}

+ task wrapper(type: Wrapper) {
+     gradleVersion = '4.4'
+     distributionUrl = distributionUrl.replace("bin", "all")
+ }
```

There are some changes to the Android SDK versions we are using. With Android there are three SDK versions which we need to specify:

- `minSdkVersion`: This specifies the minimum Android version which our app supports. Even through React Native is using APIs which were added between 16 and 28 it has fallbacks which means that it can support Android devices all the way down to platform level 16 (known to users as 4.1). Leave this set to `16` unless you use a library which requires a higher Android version.
- `compileSdkVersion`: This specifies the Android SDK which will be used to compile our app. We want to use APIs which were added in Android SDK 28, so we need to set this to at least `27`.
- `targetSdkVersion`: This set the SDK which we are "targeting". When a new Android SDK is released which includes new or changed behaviour, the Android system will use this values to selectively turn off these changes and put the app into a "compatibility mode". The allows apps which expected the behaviour of a certain version to still work on new versions of the operating system. We want to leave this as `26` now.

Also note that the default project template has moved the `ext` block to inside the `buildscript` section. I recommend you move yours as well, but it's not 100% necessary.

Note as well the addition of a new `wrapper` task which was added to the bottom of the file.

You also need to update the version of Gradle that is referenced in the `android/gradle/wrapper/gradle-wrapper.properties` file:

```diff
- distributionUrl=https\://services.gradle.org/distributions/gradle-3.5.1-all.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-4.4-all.zip
```

### Gradle wrapper script updates

The Gradle wrapper scripts have also been updated. These are the `android/gradlew`, `android/gradlew.bat`, and `android/gradle/wrapper/gradle-wrapper.jar` files. These scripts are used as a wrapper around the Gradle tool. It will download the correct version if it's not already present which allows different projects on the same system to use different versions of Gradle without issue.

You can use the diff to update the files, however, it's easier to just grab a copy and replace the files directly:

- [`android/gradlew`](https://github.com/facebook/react-native/raw/0.57-stable/local-cli/templates/HelloWorld/android/gradlew)
- [`android/gradlew.bat`](https://github.com/facebook/react-native/raw/0.57-stable/local-cli/templates/HelloWorld/android/gradlew.bat)
- [`android/gradle/wrapper/gradle-wrapper.jar`](https://github.com/facebook/react-native/raw/0.57-stable/local-cli/templates/HelloWorld/android/gradle/wrapper/gradle-wrapper.jar)

### Use the new Android Gradle plugin dependency syntax

The new version of the Android Gradle Plugin requires new syntax for declaring dependecies in your `android/app/build.gradle` file. In most cases you just need to change any reference to `compile` in the `dependencies` block to `implementation`.

```diff
dependencies {
-    compile        fileTree(dir: "libs", include: ["*.jar"])
+    implementation fileTree(dir: "libs", include: ["*.jar"])
-    compile        "com.android.support:appcompat-v7:${rootProject.ext.supportLibVersion}"
+    implementation "com.android.support:appcompat-v7:${rootProject.ext.supportLibVersion}"
-    compile        "com.facebook.react:react-native:+"  // From node_modules
+    implementation "com.facebook.react:react-native:+"  // From node_modules
}
```

You will also need to update this for any other dependencies that you have. Libraries which also have their own dependencies will also need to update their syntax, however, the old `compile` syntax will still work for now and will just produce a warning.

This change is needed due to a new system of [dependency configuration](https://developer.android.com/studio/build/dependencies#dependency_configurations). These configurations allow you to choose when the library is available and if it is included in your build output. `implementation` is the main one you will use in your app, the rest are mainly useful for libraries or fully native apps.

### Support release builds on iOS

Lastly, there is a minor change to the `ios/AppDelegate.m` file where the JS code location is determined. Previously, it would only try to load from the Metro bundler and you would need to change the code for release builds. The new change uses a pre-processor macro to automatically change the code for non-debug builds.

```diff
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
 NSURL *jsCodeLocation;

- jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
+ #ifdef DEBUG
+   jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
+ #else
+   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
+ #endif

 RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                     moduleName:@"RnDiffApp"
                                              initialProperties:nil
                                                  launchOptions:launchOptions];
 rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
 self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
 UIViewController *rootViewController = [UIViewController new];
 rootViewController.view = rootView;
 self.window.rootViewController = rootViewController;
 [self.window makeKeyAndVisible];
 return YES;
}
```

## Testing & Finishing Up

Those are all of the changes that you are required to make for all projects, however, there are a couple of other breaking changes which might affect some apps. You should [read through the changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#0578) to see if anything applies to your project. You should also go through the libraries you use to see if any upgrade is required.
