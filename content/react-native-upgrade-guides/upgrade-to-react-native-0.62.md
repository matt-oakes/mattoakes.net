---
title: "Upgrade to React Native 0.62 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.62"
weight: 62
summary: "React Native 0.62 has been a long time coming and brings many changes, large and small. This article explains what‘s new, how to upgrade, and what it all means."
---

React Native 0.62 has been a long time coming and brings many changes, large and small. The normal upgrade process applies, however, to upgrade smoothly it is useful to understand what has changed and why you need to make certain changes to your project.

{{< react-native-upgrade-callout >}}

### What's New?

Firstly, lets take a look at what's new in this version. This is a summary of the [React Native blog post](https://reactnative.dev/blog/2020/03/26/version-0.62) and the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0620) so you can take a look at those for the full details.

#### Flipper Debugger

Flipper is Facebook's open source debugging tool for mobile apps. It has many useful features such as a network inspector, layout inspector, log viewer, and integration with metro to allow for reloading your app without shaking your device.

Flipper was supported in React Native 0.61, however, it was a little tricky to setup for iOS because of conflicts with the versions of the Yoga Cocoapod which was used ([Yoga](https://yogalayout.com/) is React Native's flexbox layout engine).

These issues have now been fixed and Flipper is enabled by default for all newly created React Native apps when using `react-native init`. However, it's still optional to actually configure it when upgrading your existing app.

#### React DevTools v4

React Native now supports the latest version of the React DevTools. You can read more about this on the [React blog post](https://reactjs.org/blog/2019/08/15/new-react-devtools.html) and try out the tool on a React project in [this interactive tutorial](https://react-devtools-tutorial.now.sh/). The headline features are greater performance, better navigation, and support for hooks.

#### Appearance Module for Dark Mode

A new module has been added to help you support "dark mode" by allowing you to find out the users preferred color scheme. You can either query this using the imperative API:

```javascript
const colorScheme = Appearance.getColorScheme();
if (colorScheme === 'dark') {
  // Use dark color scheme
}
```

Or by using the `useColorScheme()` hook:

```jsx
import {Text, useColorScheme} from 'react-native';

const MyComponent = () => {
  const colorScheme = useColorScheme();
  return <Text>useColorScheme(): {colorScheme}</Text>;
};
```

#### Deprecations & Breaking Changes

This release also introduces some new deprecations and has a few breaking changes. I recommend taking a look at the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0620) to see if you're likely to be affected. The big ones are:

- Apple TV code has been moved out of the core package and is now maintained in the `[react-native-tvos](https://github.com/react-native-community/react-native-tvos)` module.
- The `useNativeDriver` property is now required when using the `Animated` API. The previous default was `false` so setting it to that preserves the previous behaviour, however, if you're animating a transform then you'll likely get better performance by setting it to `true`.

### Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, and especially if you are going to install a .0 version, check the React Native issue tracker to see if there are any major issues with the new release which might affect you. You should also go through the libraries that you use and see if anyone is reporting any compatibility issues with the new version.

By doing this before starting, you can save yourself some time running into known issues and instead wait until patches are released which make the process smoother.

Assuming that there doesn't seem to be any blockers, you are ready to start upgrading.

### Upgrading to React Native 0.62

As with all React Native upgrades, it is recommended that you take a look at the diff for the newly created projects and apply these changes to your own project.

You can do this using the [upgrade helper](https://react-native-community.github.io/upgrade-helper/) tool and the diff I will be talking you through is the one between [0.61.5 to 0.62.2](https://react-native-community.github.io/upgrade-helper/?from=0.61.5&to=0.62.2). You can just follow this diff and make the changes yourself, however, I want to explain to you what each of these changes means to give you a much better understanding of _why_ you need to make the changes.

#### Upgrade the Dependency Versions

The first step is to upgrade the dependencies in your package.json and install them. Remember that each React Native version is tied to a specific version of React, so make sure you upgrade that as well. You should also make sure that, if you use it, `react-test-renderer` matches the React version and that you upgrade the `metro-react-native-babel-preset` and Babel versions.

```json
{
  "dependencies": {
    "react": "16.11.0",
    "react-native": "0.62.2"
  },
  "devDependencies": {
    "@babel/core": "^7.6.2",
    "@babel/runtime": "^7.6.2",
    "@react-native-community/eslint-config": "^0.0.5",
    "babel-jest": "^24.9.0",
    "eslint": "^6.5.1",
    "jest": "^24.9.0",
    "metro-react-native-babel-preset": "^0.58.0",
    "react-test-renderer": "16.11.0"
  },
}
```

#### Flow Upgrade

The version of Flow which React Native uses has been updated in 0.62. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.113.0` and you have the same value in the `[version]` your `.flowconfig` file.

If you are using Typescript for type checking you code then you can actually remove the `.flowconfig` file and the `flow-bin` dependency and ignore this bit of the diff.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, however, my personal preference is to use Typescript.

If you are using Flow for type checking in your project, this might lead to additional errors in your own code. I recommend that you take a look at the [changelogs](https://github.com/facebook/flow/releases) for the versions between 0.105 and 0.113 to see what might be causing them.

You will also need to make a few other small changes to your `flowconfig` file:

- In the `[libs]` section, remove the `node_modules/react-native/Libraries/react-native/react-native-interface.js` line and replace it with `node_modules/react-native/interface.js`.
- In the `[options]` section, remove the line starting with `module.name_mapper='^react-native$' ->`.
- Also in the `[options]` section, replace the line starting with `module.name_mapper='^[./a-zA-Z0-9$_-]+\.\(bmp\|gif` with this line:
  - `module.name_mapper='^@?[./a-zA-Z0-9$_-]+\.\(bmp\|gif\|jpg\|jpeg\|png\|psd\|svg\|webp\|m4v\|mov\|mp4\|mpeg\|mpg\|webm\|aac\|aiff\|caf\|m4a\|mp3\|wav\|html\|pdf\)$' -> '<PROJECT_ROOT>/node_modules/react-native/Libraries/Image/RelativeImageStub'`

#### Update iOS Cocoapods

[Cocoapods](https://cocoapods.org/) is used to link the native parts of your iOS app together. Some of the paths to the [podspecs](https://guides.cocoapods.org/syntax/podspec.html) have been updated slightly for this version of React Native. You need to edit your `ios/Podifle` and make these changes:

- Replace the Pod named `ReactCommon/jscallinvoker` with `ReactCommon/callinvoker`.
- Add `, :modular_headers => true` to the end of the line starting with `pod 'Yoga'`. This is to support the Flipper debugger correctly.
- If you have the "Tests" target (a line such as `target 'YourAppNameTests' do`) when replace the `inherit! :search_paths` line with `inherit! :complete`.

To finish up, you will need to run `bundle exec pod install` in the `ios` directory.

#### Updating the Xcode Project Settings

To finish off the iOS upgrade, you will need to update some setting inside your Xcode project. These settings relate to things like the version of Swift that is used, where the linker looks for compiled libraries, and upgrades some deprecated settings around localization.

These are fairly involved, but there is an [excellent guide from Pavlos Vinieratos on the new upgrade support repository](https://github.com/react-native-community/upgrade-support/issues/13). Rather than replicate the instructions here, I recommend you follow them over there and come back when you are done.

#### Update Android Gradle Dependencies

Gradle is the build tool which is used to compile your Android app. The new version of React Native uses the next major version of Gradle to build your app.

To upgrade, you firstly need to change the Gradle version number in `android/gradle/wrapper/gradle-wrapper.properties` .This is done by editing the `distributionUrl` line to be this:

```
distributionUrl=https\://services.gradle.org/distributions/gradle-6.0.1-all.zip
```

Next, in `android/build.gradle` upgrade the Android build tools by making the line read:

```groovy
classpath("com.android.tools.build:gradle:3.5.2")
```

You can also optionally make a small change to the Jitpack repository URL. The default template now adds the `www` subdomain to the URL. This is meant to fix [an issue with connection timeouts](https://github.com/jitpack/jitpack.io/issues/3973). It's not 100% needed, but might help avoid issues in the future.

```groovy
maven { url 'https://www.jitpack.io' }
```

Then, over in the `android/app/build.gradle` file, inside the `depenencies` section, add:

```groovy
implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.0.0"
```

#### Optional: ProGuard Settings for Hermes Users

If you are using the Hermes rendering engine on Android, then you need to make sure these lines are included in your `android/app/proguard-rules.pro` file:

```
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
```

This ensures that when your app is built for release, the Android build system doesn't remove some of the files needed for Hermes to work. This is happening because Hermes is using "reflection" to get to the files, and Proguard can't detect they are in use and is stripping them away, thinking they are "Dead code".

#### Optional: Add Flipper Support

The new version of the template also includes support for Flipper, Facebooks debugging app, out of the box. You can install this yourself by following the instructions on [their website](https://fbflipper.com/). It is, however, completely optional and you an ignore it if you don't want to use it.

#### Setting the Android Launch Mode Flag

The default launch mode for Android apps has been changed to `singleTask`. You can set this by adding `android:launchMode="singleTask"` into the `<activity>` tag of the `MainActivity` in your `android/app/src/main/AndroidManifest.xml` file.

An Android's app launch mode determines what the system does when it needs to "launch" a new copy of your app. By default an Android app can have multiple instances launched on the same phone. This allows the user to have two copy of the app open, but looking at different screens.

For React Native apps, this isn't usually the desired behaviour. Instead it is set to "single task", which means that only a single instance can be open at once. If the user opens a link which will "deep link" into your app, then it will instead open the existing app instance and tell it the new URL the user wants to go to. You can listen for this using the `Linking` module.

You might have already added this if your app supports deep linking, but the default is now changed for all new React Native apps.

You can [read more about launch modes in the Android documentation](https://developer.android.com/guide/topics/manifest/activity-element#lmode).

#### Reacting to Android Configuration Changes

The new `Appearance` module allows you to listen for changes to the users desired color scheme, for example when they enable dark mode.

"Real" native Android apps are made up of Activities, which are meant to be stateless UI screens in the app. They are meant to be built in a way which allows them to be killed and reopened by the system whenever the devices state changes. This is the default behaviour.

For React Native apps however, this is not the desired behaviour. At best this would lead to a flicker when the Javascript reloads, and at worst it would reset the app back to the initial screen.

This is why React Native apps instead ask for a different behaviour. Inside your `android/app/src/main/AndroidManifest.xml` file, look for the `android:configChanges` line inside the `<activity>` tag of your `MainActivity`. You'll notice that it already includes a list of options such as `keyboard`, `orientation`, and `screenSize`. We are going to add a new `uiMode` option to the list (make sure it's separated from the others by a `|`.

This list essentially says: "If any of these change, don't restart this activity, just let me know about the new config". This allows the React Native app to stay running and update you about configuration changes those either listeners or hooks.

You can [read more about other configuration changes in the Android documentation](https://developer.android.com/guide/topics/manifest/activity-element#config).

#### Optional: Add Flipper Support

As mentioned before, Flipper is now enabled by default for newly create React Native apps. Add it to your app is completely optional if you are upgrading, but if you want to use it then you can follow these instructions to add it.

##### Android

Start by editing the `[android.gradel.properties](http://android.gradel.properties)` file and adding this line to the bottom of the file:

```
FLIPPER_VERSION=0.33.1
```

Then, over in the `android/app/build.gradle` file, inside the `depenencies` section, add:

```groovy
debugImplementation("com.facebook.flipper:flipper:${FLIPPER_VERSION}") {
  exclude group:'com.facebook.fbjni'
}
debugImplementation("com.facebook.flipper:flipper-network-plugin:${FLIPPER_VERSION}") {
  exclude group:'com.facebook.flipper'
}
debugImplementation("com.facebook.flipper:flipper-fresco-plugin:${FLIPPER_VERSION}") {
  exclude group:'com.facebook.flipper'
}
```

These changes will add the Flipper dependencies to your Android app, along with the network and fresco plugins. Fresco is the library React Native uses to load, transform, and cache images. The flipper plugin allows you to inspect the current cache state.

You now need to configure your app to initialize Flipper.

In your `[MainApplication.java](http://mainapplication.java)` file, add this line at the bottom of the `onCreate` method:

```java
initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
```

You then need to add the new `initializeFlipper` method below `onCreate`:

```java
/**
  * Loads Flipper in React Native templates. Call this in the onCreate method with something like
  * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  *
  * @param context
  * @param reactInstanceManager
  */
private static void initializeFlipper(
    Context context, ReactInstanceManager reactInstanceManager) {
  if (BuildConfig.DEBUG) {
    try {
      /*
        We use reflection here to pick up the class that initializes Flipper,
      since Flipper library is not available in release mode
      */
      Class<?> aClass = Class.forName("com.yourpackagename.ReactNativeFlipper");
      aClass
          .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
          .invoke(null, context, reactInstanceManager);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    } catch (NoSuchMethodException e) {
      e.printStackTrace();
    } catch (IllegalAccessException e) {
      e.printStackTrace();
    } catch (InvocationTargetException e) {
      e.printStackTrace();
    }
  }
}
```

Make sure you replace `com.yourpackagename` with the package name of your app.

Inside the `android/app/src` folder, create a `debug` folder if one doesn't already exist and then create a file called `ReactNativeFlipper.java` in the `java/com/your/packagename` folder, creating all of the directories to make up your apps package name (it should match the directory structure which your `MainApplication.java` file sits in). Inside the new file, add the [contents of this file](https://raw.githubusercontent.com/react-native-community/rn-diff-purge/release/0.62.2/RnDiffApp/android/app/src/debug/java/com/rndiffapp/ReactNativeFlipper.java), but make sure you replace the `package com.rndiffapp;` line with your own package name.

Then, back in the `MainApplication.java` file, make sure you have these imports somewhere at the top of the file:

```java
import com.facebook.react.ReactInstanceManager;
import java.lang.reflect.InvocationTargetException;
```

You should now be able to build, run, and use Flipper with your Android app.

##### iOS

To integrate Flipper with iOS, you first need to add the correct dependencies to your `ios/Podfile`. One thing to note is that if you are using the `use_frameworks!` flag in Cocoapods (most likely due to one of your dependencies requiring it) the Flipper will not work and you won't be able to enable it.

If you are not using frameworks, then open the file and add these lines above your app's `target` block:

```ruby
def add_flipper_pods!(versions = {})
  versions['Flipper'] ||= '~> 0.33.1'
  versions['DoubleConversion'] ||= '1.1.7'
  versions['Flipper-Folly'] ||= '~> 2.1'
  versions['Flipper-Glog'] ||= '0.3.6'
  versions['Flipper-PeerTalk'] ||= '~> 0.0.4'
  versions['Flipper-RSocket'] ||= '~> 1.0'
  pod 'FlipperKit', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitLayoutPlugin', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/SKIOSNetworkPlugin', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitUserDefaultsPlugin', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitReactPlugin', versions['Flipper'], :configuration => 'Debug'
  # List all transitive dependencies for FlipperKit pods
  # to avoid them being linked in Release builds
  pod 'Flipper', versions['Flipper'], :configuration => 'Debug'
  pod 'Flipper-DoubleConversion', versions['DoubleConversion'], :configuration => 'Debug'
  pod 'Flipper-Folly', versions['Flipper-Folly'], :configuration => 'Debug'
  pod 'Flipper-Glog', versions['Flipper-Glog'], :configuration => 'Debug'
  pod 'Flipper-PeerTalk', versions['Flipper-PeerTalk'], :configuration => 'Debug'
  pod 'Flipper-RSocket', versions['Flipper-RSocket'], :configuration => 'Debug'
  pod 'FlipperKit/Core', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/CppBridge', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FBCxxFollyDynamicConvert', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FBDefines', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FKPortForwarding', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitHighlightOverlay', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitLayoutTextSearchable', versions['Flipper'], :configuration => 'Debug'
  pod 'FlipperKit/FlipperKitNetworkPlugin', versions['Flipper'], :configuration => 'Debug'
end
# Post Install processing for Flipper
def flipper_post_install(installer)
  installer.pods_project.targets.each do |target|
    if target.name == 'YogaKit'
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_VERSION'] = '4.1'
      end
    end
  end
end
```

These blocks define the list of dependencies needed for Flipper, enable them only for debug configurations, and set the Swift version correctly for the Yoga dependency.

To complete the integration, at the bottom of your app's `target` block, add these lines to include the flipper dependencies:

```ruby
add_flipper_pods!
post_install do |installer|
  flipper_post_install(installer)
end
```

Now you have Cocoapods configured, you need to run `pod install` inside your `ios` directory to actually install the dependencies.

Now that is done, you need to initialize Flipper when you app opens. Inside your `AppDelegate.m` file, add these lines below the last imports:

```objectivec
#if DEBUG
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif
```

Then, at the very top of your `application:didFinishLaunchingWithOptions` method, add these lines:

```objectivec
#if DEBUG
  InitializeFlipper(application);
#endif
```

With that, you can now build, run, and use Flipper inside your iOS app.

### Testing & Finishing Up

Those are all of the changes that you are required to make for all projects, however, there are a couple of other breaking changes which might affect some apps. You should read through the [changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0620) to see if anything applies to your project. You should also go through the libraries you use to see if any upgrade is required.

As mentioned before, there is now an [upgrade support repository](https://github.com/react-native-community/upgrade-support) to support the React Native community with upgrade questions. If you have any issue, search over there and see if someone has found a way to fix it.
