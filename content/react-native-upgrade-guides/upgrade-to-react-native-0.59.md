---
title: "Upgrade to React Native 0.59 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.59"
weight: 59
summary: "React Native 0.59 introduces many exciting features, most of all Hooks. This article explains what‘s new, how to upgrade, and what it all means."
---

React Native 0.59 is a major update which brings many useful changes. The normal upgrade process applies, but, to upgrade smoothly it is useful to understand what has changed and _why_ you need to make the changes.

{{< react-native-upgrade-callout >}}

### What‘s New?

Let‘s take a look at what‘s new in this version. This is a summary of the [React Native blog post](https://facebook.github.io/react-native/blog/2019/03/12/releasing-react-native-059) and the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0595). Take a look at those for the full details.

#### Hooks

The most noticeable change to developers is the addition of Hooks. Hooks let you re-use state logic between components, without resorting to classes. They are an opt-in feature and will work side-by-side with your current code, so you can adopt it gradually.

You can [read more about hooks](https://reactjs.org/docs/hooks-intro.html) on the React website.

#### Android JavascriptCore Upgrade & 64-bit Support

Another large change is the upgrade to JavascriptCore for Android. On Android, the JavascriptCore library used to run your JS code is bundled within your app. On iOS, it uses a system provided framework. Previous versions of React Native bundled a very old library on Android.

The upgraded library includes performance increases and some features which were previously polyfilled. It also enables 64-bit support on Android, which will be a [requirement for apps](https://android-developers.googleblog.com/2019/01/get-your-apps-ready-for-64-bit.html) on the Google Play Store from 1st August 2019. Before then, you will need to upgrade to at least React Native 0.59 to be able to make changes to your app on Android.

#### Inline Requires

Facebook is bringing some of their performance optimisations to the community. This starts with Inline Requires. It optimises the start up time of your app by allowing the Metro bundler to identify modules which can by lazily loaded.

This is an opt-in feature and they are looking for [feedback](https://twitter.com/hashtag/inline-requires). You can [read more about it on the React Native website](https://facebook.github.io/react-native/docs/0.56/performance#inline-requires).

#### Lean Core

This version marks the start of the Lean Core effort. The React Native repository is very large and complex. It makes it hard for non-core parts of the codebase to be approachable to new contributors. This is why non-core components into new community run repositories. This process started with WebView with great results.

0.59 extracts some more components and APIs and marks them as deprecated. For now, you can continue to use them as before, but, you are encouraged to migrate over to the new libraries. They are all backward compatible and usually only need a change to the import statement.

#### CLI Upgrades

The CLI tool was also extracted from the main repository. This has lead to many changes, including one which improves the performance 3x. There is also a new `upgrade` command which will make future upgrades much easier.

<newsletter-prompt text="Want to know when a new React Native upgrade guide is released? Sign up to be the first to hear"></newsletter-prompt>

### Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, check the React Native issue tracker to see if there are any major issues which might affect you. You should also check any libraries that you use and see if there are any compatibility issues.

Assuming that there doesn‘t seem to be any blockers, you are ready to start upgrading.

### Performing the Upgrade

As always, you can perform the upgrade by following the diffs in the [`rn-diff-purge`](https://github.com/react-native-community/rn-diff-purge) tool. You can follow this diff and make the changes yourself, but, I want to explain to you what each of these changes means. This will give you a much better understanding of _why_ you need to make the changes. The diff I will be talking you through is the one between [0.58 and 0.59.5](https://github.com/react-native-community/rn-diff-purge/compare/release/0.58.5..release/0.59.0).

#### Upgrade Dependency Versions

The first step is to upgrade the dependencies in your `package.json` and install them. Remember that each React Native version ties to a specific version of React. Make sure you upgrade that as well. If you use it, you should also make sure that `react-test-renderer` matches the React version, if you use it, matches the React version. You should also upgrade the `metro-react-native-babel-preset` and Babel versions.

```json
"dependencies": {
  "react": "16.8.3",
  "react-native": "0.59.0"
},
"devDependencies": {
  "@babel/core": "^7.4.3",
  "@babel/runtime": "^7.4.3",
  "babel-jest": "^24.7.1",
  "jest": "^24.7.1",
  "metro-react-native-babel-preset": "^0.53.1",
  "react-test-renderer": "16.8.3"
},
```

#### Flow Upgrade

Next an easy one. React Native updates the version of Flow which it in 0.59. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.92.0`. The same value version should be in the `[version]` section of your `.flowconfig` file.

```diff
[libs]
node_modules/react-native/Libraries/react-native/react-native-interface.js
node_modules/react-native/flow/
- node_modules/react-native/flow-github/
```

```diff
[version]
- ^0.86.0
+ ^0.92.0
```

If you are using Flow for type checking in your project, this might lead to new errors in your own code. I recommend that you take a look at the changelog for the versions between 0.86 and 0.92 to see what might be causing them.

If you are using Typescript for type checking, then you can remove the `.flowconfig` file and the `flow-bin` dependency.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, but, my personal preference is to use Typescript.

#### Removed Unneeded Lint Ignores

Another very easy one which most people can likely ignore. The default file header contained some lint ignores for an internal Facebook tool. These were never needed for anyone else and can be removed.

```diff
/*
 * @format
 * @flow
- * @lint-ignore-every XPLATJSCOPYRIGHT1
 */
```

#### Android Gradle Changes

Now for something a little more involved. React Native 0.59 has various changes to the Gradle build tools.

##### Build tool version

The first change that you will see in the diff is the removal of the `buildToolsVersion` statement. This is no longer needed and you can remove this line.

This is because the Android Gradle Plugin from 3.0.0 will use a minimum version by default. It will ignore any lower versions specified in the `buildToolsVersion` line. Most apps will not need to, but, you can use this to specify a newer version.

```diff
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
-   buildToolsVersion rootProject.ext.buildToolsVersion
```

##### Java 8 Declaration

Next is the addition of a few lines which says that the app uses Java 8 features through the React Native library. The app builds fine without these and has been using Java 8 features for a while. The lines [fixes some Android lint warnings](https://github.com/facebook/react-native/pull/23295) so you should include them.

Include these lines somewhere in the `android` section of your `android/app/build.gradle` file.

```groovy
compileOptions {
    sourceCompatibility JavaVersion.VERSION_1_8
    targetCompatibility JavaVersion.VERSION_1_8
}
```

##### 64-bit ABI Splits

As React Native 0.59 includes 64-bit support on Android, we need to update the code which handles the ABI split flag. This flag tells the build system to create a separate APK for each architecture. These include only the library binaries required for that architecture. Turning this on means that the APK which gets sent to users will be significantly smaller.

The first change tells the build system that we want an APK for the x84-64 architecture.

```diff
splits {
    abi {
        reset()
        enable enableSeparateBuildPerCPUArchitecture
        universalApk false  // If true, also generate a universal APK
-       include "armeabi-v7a", "x86", "arm64-v8a"
+       include "armeabi-v7a", "x86", "arm64-v8a", "x86-64"
    }
}
```

The second line changes the code which sets the version code for each APK. We need this because each APK in the ABI requires a separate version code which goes up each time the app updates. This code block adds a different constant for each architecture to your base version code. Each APK then get their own distinct values which are unlikely to overlap. For more details take a look at the [Android documentation for ABI splits](https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions).

```diff
applicationVariants.all { variant ->
    variant.outputs.each { output ->
        // For each separate APK per architecture, set a unique version code as described here:
        // http://tools.android.com/tech-docs/new-build-system/user-guide/apk-splits
-       def versionCodes = ["armeabi-v7a":1, "x86":2, "arm64-v8a": 3]
+       def versionCodes = ["armeabi-v7a":1, "x86":2, "arm64-v8a": 3, "x86-64": 4]
        def abi = output.getFilter(OutputFile.ABI)
        if (abi != null) {  // null for the universal-debug, universal-release variants
            output.versionCodeOverride =
                    versionCodes.get(abi) * 1048576 + defaultConfig.versionCode
        }
    }
}
```

If you don‘t use the feature, I recommend that you make these changes. Then you can enable it with no issues in the future.

##### Upgraded Gradle Version

This version of React Native uses newer versions of Gradle and the Android Gradle Plugin. You need to make the version changes in the `android/build.gralde` file and the `android/gradle/wrapper/gradle-wrapper.properties` file. You can also remove the `wrapper` Gradle task. This no longer required as it duplicates the Gradle version setting.

```diff
buildscript {
    ext {
-       buildToolsVersion = "28.0.2"
+       buildToolsVersion = "28.0.3"
        minSdkVersion = 16
        compileSdkVersion = 28
        targetSdkVersion = 27
        supportLibVersion = "28.0.0"
    }
    repositories {
        google()
        jcenter()
    }
    dependencies {
-       classpath 'com.android.tools.build:gradle:3.2.1'
+       classpath 'com.android.tools.build:gradle:3.3.1'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

```diff
- task wrapper(type: Wrapper) {
-     gradleVersion = '4.7'
-     distributionUrl = distributionUrl.replace("bin", "all")
- }
```

```diff
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
- distributionUrl=https\://services.gradle.org/distributions/gradle-4.7-all.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-4.10.2-all.zip
```

##### Android Target SDK upgrade

We also need to update the target SDK from 27 to 28.

```diff
buildscript {
    ext {
        buildToolsVersion = "28.0.3"
        minSdkVersion = 16
        compileSdkVersion = 28
-       targetSdkVersion = 27
+       targetSdkVersion = 28
        supportLibVersion = "28.0.0"
    }
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.3.1'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

With Android there are three SDK versions which we need to specify:

- `compileSdkVersion`: This specifies the Android SDK which will be used to compile our app. If we want to use APIs which were added in Android SDK 28, then this would need to be set to at least 28. Leave this set to 28 for this version.
- `minSdkVersion`: This specifies the minimum Android version which our app supports. If you use APIs from a higher level then you need to provide fallbacks. React Native provides these fallbacks to support Android devices down to API level 16 (known to users as 4.1). Leave this set to 16 unless you use a library which requires a higher Android version.
- `targetSdkVersion`: This set the SDK which we are _targeting_. New Android SDKs releases will include new or changed behaviour. They will also includes _compatibility modes_ for apps which were not targeting them. This avoids breaking old apps with new Android upgrades. With the change from 27 to 28 Android will impose some new security rules. We will visit this in more detail later on.

You should read about the [behaviour changes in Android SDK 28](https://developer.android.com/about/versions/pie/android-9.0-changes-28) to make sure the rest of your app is not affected.

#### Debug only AndroidManifest.xml

The default Android Manifest in React Native used to include a `SYSTEM_ALERT_WINDOW` permission. This was actually only required for `debug` builds. This change moves the permission into a `AndroidManifest.xml` file which is only used for `debug` builds.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

    <application tools:targetApi="28" tools:ignore="GoogleAppIndexingWarning" android:networkSecurityConfig="@xml/react_native_config" />
</manifest>
```

```diff
  <uses-permission android:name="android.permission.INTERNET" />
- <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
```

This works using the Gradle _source set_ feature. It takes the files from multiple folders inside `android/app/src` and merges them when building. In this example, for a `debug` build the `AndroidManifest.xml` files from `src/debug` and `src/main` are combined. For a `release` build it will only be the one from `src/main`.

#### Android Debug Network Config

The new debug `AndroidManifest.xml` includes a line referencing a new `react_native_config.xml` file. This is needed due to a change in behaviour when we started targeting Android SDK 28. On Android 9+ (API 28+) devices [all network connections are required to be encrypted by default](https://developer.android.com/about/versions/pie/android-9.0-changes-28#tls-enabled). This would cause issues accessing the Metro packager which does not use HTTPS encryption.

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">localhost</domain>
    <domain includeSubdomains="false">10.0.2.2</domain>
    <domain includeSubdomains="false">10.0.3.2</domain>
  </domain-config>
</network-security-config>
```

The config file turns the security rules off for the domains required by Metro. You might need to add your own domains for this list. For example, if you are connecting to a development API which does not have HTTPS.

You can [read more about the network security config](https://developer.android.com/training/articles/security-config) on the Android website.

#### `AppDelegate` Implements `RCTBridgeDelegate`

Turning our attention to iOS now, the `AppDelegate` has changed slightly. This is another change where the app will build and work ok without changing it. The change is there to [fix a timing issue with getting the bundle URL](https://github.com/facebook/react-native/pull/23031).

You need to change the `AppDelegate.h` file to import and declare that the class implements the `RCTBridgeDelegate` protocol.

```diff
+ #import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

- @interface AppDelegate : UIResponder <UIApplicationDelegate>
+ @interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
```

Then in the `AppDelegate.m` file you need to move the logic for getting your bundle URL into a method called `sourceURLForBridge`. This is all we need to implement the `RCTBridgeDelegate` protocol.

```diff
#import "AppDelegate.h"

+ #import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
```

```objective-c
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}
```

You then need to alter the `didFinishLaunchingWithOptions` implementation to create and use a `RCTBridge` object.

```diff
(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
- NSURL *jsCodeLocation;
- jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
-
- RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
-                                                     moduleName:@"RnDiffApp"
-                                              initialProperties:nil
-                                                  launchOptions:launchOptions];
- rootView.backgroundColor = [UIColor blackColor];
+ RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
+ RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
+                                                  moduleName:@"RnDiffApp"
+                                           initialProperties:nil];
+  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}
```

The implementation for this will be different if you are using `react-native-navigation` or Code Push. If you are using either of these libraries, you should refer to see how to implement it correctly, or leave the `AppDelegate` as it was.

#### Add Default Metro Config

The template now includes a default `metro.config.js` file. This file is used to configure Metro, which is the React Native tool which bundles the Javascript code of your app.

```js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  }
};
```

In this default are two boolean settings for the new inline requires performance optimisation. They are both off by default, so if you would like to use them turn them to true.

If you do not plan to use these features, and don‘t configure any other Metro settings, you do not need to have this file. It was included in the template to make it clearer where these features should be configured.

#### Lean Core

As mentioned above, some of the non-core part of React Native have been extracted from the main module and moved out to community run repos. For now, they are still available in React Native 0.59, but, you will get a warning about their deprecation. You should go to the new repository for each one that you use and follow the migration instructions.

In most cases the API is 100% compatible and you can just install, link, and then change your imports to begin using the new module.

### Testing & Finishing Up

Those are all the changes that you need to make for all projects. There are a couple of other breaking changes which might affect some apps. You should [read through the changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0595) to see if anything applies to your project. You should also go through the libraries you use to see if any upgrades are required.
