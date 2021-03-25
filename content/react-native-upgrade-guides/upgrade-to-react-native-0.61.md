---
title: "Upgrade to React Native 0.61 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.61"
weight: 61
summary: "React Native 0.61 is a fairly small update, but it brings a big new feature which improves the development experience. This article explains what‘s new, how to upgrade, and what it all means."
---

React Native 0.61 is a fairly small update, but it brings a big new feature which improves the development experience. The normal upgrade process applies, however, to upgrade smoothly it is useful to understand what has changed and _why_ you need to make certain changes to your project.

{{< react-native-upgrade-callout >}}

### What's New?

Firstly, lets take a look at what's new in this version. This is a summary of the [React Native blog post](https://facebook.github.io/react-native/blog/2019/09/18/version-0.61) and the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#0610) so you can take a look at those for the full details.

#### Fast Refresh

React Native has had live reloading and hot reloading for a long time now. Live reloading would reload the entire application when it detected a code change. This would loose your current position within the app, but would ensure the code was not in a broken state. Hot reloading would attempt to "patch" just the changes you have made without reloading the entire app, allowing you to see your changes much quicker.

Hot reloading sounded good in principle, however, it was pretty buggy and didn't work with modern React features like functional components with hooks.

The React Native team have rebuilt both of these features and combined them into the new Fast Reload feature. It is enabled by default and will do the equivalent of a hot reload where possible, falling back to a full reload if it's not.

Take a look at the [React Native 0.61 announcment blog post](https://facebook.github.io/react-native/blog/2019/09/18/version-0.61) for more details.

#### React 16.9 Upgrade

React Native 0.60 comes with React 16.9. You can read more about what's new in the [changelog](https://reactjs.org/blog/2019/08/08/react-v16.9.0.html), but the main change is the renaming of the unsafe lifecycle methods for class components. The deprecation was announced over a year ago, but they have now officially been renamed and using the old names will result in a warning. If you use any of `componentWillMount`, `componentWillReceiveProps`, or `componentWillUpdate` you will need to either renamed them with the `UNSAFE_` prefix or refactor your code to remove their use entirely.

#### Cocoapods is now the only way to link libraries

Cocoapods has been supported as a linking method on iOS for a long time, and 0.60 made it the default. React Native 0.61 takes this a step further by removing support for linking using the `React.xcodeproj` file. This essentially means that you need to migrate to link using Cocoapods to continue upgrading React Native. I would have recommended doing this anyway as it allows you to use the Autolinking feature which was introduced in 0.60.

#### Fixed use_frameworks! CocoaPods support

This release fixes an issue with Cocoapods support in 0.60. You can now use the `use_frameworks!` directive with React Native. This changes how the linked libraries are bundled in your app by Cocoapods. Some iOS libraries required the use of frameworks, which previously wasn't support by React Native. This is now fixed, so you'll be able to use it if you need to, however, it's worth [reading up about what it does](https://stackoverflow.com/questions/41210249/why-do-we-use-use-frameworks-in-cocoapods) before switching it on.

### Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, and especially if you are going to install a .0 version, check the React Native issue tracker to see if there are any major issues with the new release which might affect you. You should also go through the libraries that you use and see if anyone is reporting any compatibility issues with the new version.

By doing this before starting, you can save yourself some time running into known issues and instead wait until patches are released which make the process smoother.

Assuming that there doesn't seem to be any blockers, you are ready to start upgrading.

### Upgrading to React Native 0.61

As with all React Native upgrades, it is recommended that you take a look at the diff for the newly created projects and apply these changes to your own project.

You can do this using the [upgrade helper](https://react-native-community.github.io/upgrade-helper/) tool and the diff I will be talking you through is the one between [0.60.5 to 0.61.2](https://react-native-community.github.io/upgrade-helper/?from=0.60.5&to=0.61.2). You can just follow this diff and make the changes yourself, however, I want to explain to you what each of these changes means to give you a much better understanding of _why_ you need to make the changes.

#### Upgrade the Dependency Versions

The first step is to upgrade the dependencies in your package.json and install them. Remember that each React Native version is tied to a specific version of React, so make sure you upgrade that as well. You should also make sure that react-test-renderer matches the React version, if you use it, and that you upgrade the metro-react-native-babel-preset and Babel versions.

#### Flow Upgrade

First an easy one. The version of Flow which React Native uses has been updated in 0.61. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.105.0` and you have the same value in the `[version]` your `.flowconfig` file.

If you are using Flow for type checking in your project, this might lead to additional errors in your own code. I recommend that you take a look at the changelog for the versions between 0.98 and 0.105 to see what might be causing them.

If you are using Typescript for type checking you code then you can actually remove the `.flowconfig` file and the `flow-bin` dependency and ignore this bit of the diff.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, however, my personal preference is to use Typescript.

#### Update iOS Cocoapod Paths

The podspec paths have been updated slightly for this version of React Native. You need to edit your `ios/Podifle` to replace the current core podspecs with these:

```ruby
pod 'FBLazyVector', :path => "../node_modules/react-native/Libraries/FBLazyVector"
pod 'FBReactNativeSpec', :path => "../node_modules/react-native/Libraries/FBReactNativeSpec"
pod 'RCTRequired', :path => "../node_modules/react-native/Libraries/RCTRequired"
pod 'RCTTypeSafety', :path => "../node_modules/react-native/Libraries/TypeSafety"
pod 'React', :path => '../node_modules/react-native/'
pod 'React-Core', :path => '../node_modules/react-native/'
pod 'React-CoreModules', :path => '../node_modules/react-native/React/CoreModules'
pod 'React-Core/DevSupport', :path => '../node_modules/react-native/'
pod 'React-RCTActionSheet', :path => '../node_modules/react-native/Libraries/ActionSheetIOS'
pod 'React-RCTAnimation', :path => '../node_modules/react-native/Libraries/NativeAnimation'
pod 'React-RCTBlob', :path => '../node_modules/react-native/Libraries/Blob'
pod 'React-RCTImage', :path => '../node_modules/react-native/Libraries/Image'
pod 'React-RCTLinking', :path => '../node_modules/react-native/Libraries/LinkingIOS'
pod 'React-RCTNetwork', :path => '../node_modules/react-native/Libraries/Network'
pod 'React-RCTSettings', :path => '../node_modules/react-native/Libraries/Settings'
pod 'React-RCTText', :path => '../node_modules/react-native/Libraries/Text'
pod 'React-RCTVibration', :path => '../node_modules/react-native/Libraries/Vibration'
pod 'React-Core/RCTWebSocket', :path => '../node_modules/react-native/'
pod 'React-cxxreact', :path => '../node_modules/react-native/ReactCommon/cxxreact'
pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi'
pod 'React-jsiexecutor', :path => '../node_modules/react-native/ReactCommon/jsiexecutor'
pod 'React-jsinspector', :path => '../node_modules/react-native/ReactCommon/jsinspector'
pod 'ReactCommon/jscallinvoker', :path => "../node_modules/react-native/ReactCommon"
pod 'ReactCommon/turbomodule/core', :path => "../node_modules/react-native/ReactCommon"
pod 'Yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'
```

To finish up, you will need to run `bundle exec pod install` in the `ios` directory.

This version of React Native also removed the `xcodeproj` file, so the only supported linking method is now via Cocoapods. If you have not yet made the switch, take a look at the 0.60 upgrade guide to see how to do it.

#### Update Android Gradle

There is a minor bump to the version of Gradle and the Android Gradle Plugin that you will use. Gradle is the build tool which is used to compile your Android app.

To upgrade, you firstly need to change the Gradle version number in `android/gradle/wrapper/gradle-wrapper.properties` .This is done by editing the `distributionUrl` line to be this:

```
distributionUrl=https\://services.gradle.org/distributions/gradle-5.5-all.zip
```

Next, in `android/build.gradle` upgrade the Android build tools by making the line read:

```groovy
classpath("com.android.tools.build:gradle:3.4.2")
```

You can also at Jitpack into the `allprojects` `repositories` block. This is done to allow you to use fetch libraries using the Jitpack dependency registry without anymore additional setup. Simply add this line to the block:

```groovy
maven { url 'https://jitpack.io' }
```

#### Optional: Add Flipper Support

The new version of the template also includes support for Flipper, Facebooks debugging app, out of the box. You can install this yourself by following the instructions on [their website](https://fbflipper.com/). It is, however, completely optional and you an ignore it if you don't want to use it.

### Testing & Finishing Up

Those are all of the changes that you are required to make for all projects, however, there are a couple of other breaking changes which might affect some apps. You should read through the changelog to see if anything applies to your project. You should also go through the libraries you use to see if any upgrade is required.
