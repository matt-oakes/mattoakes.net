---
title: "Upgrade to React Native 0.60 - Matt Oakes - React Native Freelancer"
sectionTitle: "Upgrade to React Native 0.60"
weight: 60
summary: "React Native 0.60 is a major update which brings many welcome changes. This article explains what‘s new, how to upgrade, and what it all means."
---

React Native 0.60 is a major update which brings many welcome changes. The normal upgrade process applies, however, to upgrade smoothly it is useful to understand what has changed and _why_ you need to make certain changes to your project.

{{< react-native-upgrade-callout >}}

### What's New?

Firstly, lets take a look at what's new in this version. This is a summary of the [React Native blog post](https://facebook.github.io/react-native/blog/2019/07/03/version-60) and the [full changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#060) so you can take a look at those for the full details.

#### Autolinking

The big new feature of React Native 0.60 is Autolinking. Linking native libraries has always been one of the harder parts of React Native development. It's a multi-step process and missing one of the steps can lead to hard to debug issues.

The new React Native CLI includes support for Autolinking your native dependencies. This works by scanning your dependencies and adding the linking code for you at compile time. On Android this works using the usual Gradle build system, and on iOS it uses Cocoapods.

You can read more about Autolinking on the [React Native CLI documentation](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md).

You can keep using manual linking if you wish, including mixing automatic and manual linking, however, I recommend migrating to the new system as soon as possible.

#### AndroidX Migration

Almost all Android apps previously made use of the Android Support Library. These set of libraries were released by Google separately from the usual Android release cycle and provided backward compatibility of new features between Android versions. It's the main reason why Android apps can support very old Android versions without too many issues.

Google have recently announced that the Support Library is being replaced by [AndroidX](https://developer.android.com/jetpack/androidx) (short of Android Extensions). These libraries are mostly the same, however, the package names have all been changed. There is also now a new release system where each part of the library is an independent version, rather than all being released at the same time.

The upgrade process for most React Native apps boils down to adding a flag to start the migration and then ensuring that all of your libraries are using AndroidX rather than the Support Library. It is not possible to use both in a single app, however, there are some tools to help with the migration.

#### Hermes Engine on Android

React Native apps use a headless Javascript engine to execute your code.

On iOS, this is is done using the JavascriptCore framework provided by Apple (using anything else would breach the App Store guidelines).

On Android, there is no system provided Javascript engine, so each React Native app included the JavascriptCore framework inside the packaged app. This worked well, and kept it consistent with the iOS app, however, it had some downsides as JavascriptCore was not designed to be used this way.

Facebook have been working internally on a brand new Javascript engine called Hermes. It is written from the ground up with the React Native use-case in mind. This results in smaller app sizes and faster app loading times. This is a drop in replacement for most apps, however, as it's a new system you should throughly test your app before releasing it as there may be compatibility issues.

You can read more about Hermes in the [announcement blog post](https://engineering.fb.com/android/hermes/) and on the [project website](https://hermesengine.dev/).

#### Lean Core

0.60 continues the "Lean Core" effort. Because the React Native repository is very large and complex, it makes it hard for non-core parts of the codebase to be testable and approachable to new contributors. This is why the maintainers are splitting out these non-core components into new community run repositories. This process started with WebView with great results.

In 0.59 some additional components and APIs were extracted and marked as deprecated. In 0.60 the deprecated APIs have now been removed. To continue using `NetInfo`, `Geolocation`, or `WebView` you will need to migrate to the new libraries. These are now well maintained and come with bug fixes and other improvements.

#### Accessibility

Creating accessible apps should be a priority for all developers and this version of React Native brings some changes and new tools to help you improve your app. You can read more about the changes in [this blog post](https://facebook.github.io/react-native/blog/2019/06/12/react-native-open-source-update#meaningful-community-contributions).

#### New Start Screen

This won't affect most people who are upgrading, however, a lot of work has gone into making the "first run" screen on React Native much friendlier and more informative. Take a look at the blog post linked above to see screenshots of it in action.

### Before You Upgrade

As always, it is good to run through a few checks before you perform an upgrade. Firstly, and especially if you are going to install a .0 version, check the React Native issue tracker to see if there are any major issues with the new release which might affect you. You should also go through the libraries that you use and see if anyone is reporting any compatibility issues with the new version.

By doing this before starting, you can save yourself some time running into known issues and instead wait until patches are released which make the process smoother.

Assuming that there doesn't seem to be any blockers, you are ready to start upgrading.

### Upgrading to React Native 0.60

As with all React Native upgrades, it is recommended that you take a look at the diff for the newly created projects and apply these changes to your own project.

You can do this using the [upgrade helper](https://react-native-community.github.io/upgrade-helper/) tool and the diff I will be talking you through is the one between [0.59.10 to 0.60.6](https://react-native-community.github.io/upgrade-helper/?from=0.59.10&to=0.60.6). You can just follow this diff and make the changes yourself, however, I want to explain to you what each of these changes means to give you a much better understanding of _why_ you need to make the changes.

#### Upgrade the Dependency Versions

The first step is to upgrade the dependencies in your package.json and install them. Remember that each React Native version is tied to a specific version of React, so make sure you upgrade that as well. You should also make sure that react-test-renderer matches the React version, if you use it, and that you upgrade the metro-react-native-babel-preset and Babel versions.

#### Flow Upgrade

First an easy one. The version of Flow which React Native uses has been updated in 0.60. The means that you need to make sure that the `flow-bin` dependency you have is set to `^0.98.0` and you have the same value in the `[version]` your `.flowconfig` file.

If you are using Flow for type checking in your project, this might lead to additional errors in your own code. I recommend that you take a look at the changelog for the versions between 0.92 and 0.98 to see what might be causing them.

If you are using Typescript for type checking you code then you can actually remove the `.flowconfig` file and the `flow-bin` dependency and ignore this bit of the diff.

If you are not using a type checker at all then I highly recommend you look into using one. Either option will work, however, my personal preference is to use Typescript.

#### Migrate iOS Linking to Cocoapods

If you are not currently using Cocoapods for linking, then it is recommended that you migrate over. This will allow you to take advantage of the Autolinking feature. Also, from React Native 0.61, it is the only linking method available. However, if you prefer you can leave your project how it is for now.

If you are currently using Cocoapods, you will also need to make a few changes to how your project is linked.

To start, you will need to ensure you have Cocoapods installed on your machine. I recommend installing via Bundler to ensure all of the developers of your app use the correct version of Cocoapods.

```
bundle init
bundle install cocoapods
```

You then need to setup Cocoapods for your project. Run this command inside your `ios` folder:

```
bundle exec pod install
```

This will create a `Podfile` file. Open that file and add the following contents to it:

```ruby
platform :ios, '9.0'

def pods()
    pod 'React', :path => '../node_modules/react-native/'
    pod 'React-Core', :path => '../node_modules/react-native/React'
    pod 'React-DevSupport', :path => '../node_modules/react-native/React'
    pod 'React-RCTActionSheet', :path => '../node_modules/react-native/Libraries/ActionSheetIOS'
    pod 'React-RCTAnimation', :path => '../node_modules/react-native/Libraries/NativeAnimation'
    pod 'React-RCTBlob', :path => '../node_modules/react-native/Libraries/Blob'
    pod 'React-RCTImage', :path => '../node_modules/react-native/Libraries/Image'
    pod 'React-RCTLinking', :path => '../node_modules/react-native/Libraries/LinkingIOS'
    pod 'React-RCTNetwork', :path => '../node_modules/react-native/Libraries/Network'
    pod 'React-RCTSettings', :path => '../node_modules/react-native/Libraries/Settings'
    pod 'React-RCTText', :path => '../node_modules/react-native/Libraries/Text'
    pod 'React-RCTVibration', :path => '../node_modules/react-native/Libraries/Vibration'
    pod 'React-RCTWebSocket', :path => '../node_modules/react-native/Libraries/WebSocket'
    pod 'React-cxxreact', :path => '../node_modules/react-native/ReactCommon/cxxreact'
    pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi'
    pod 'React-jsiexecutor', :path => '../node_modules/react-native/ReactCommon/jsiexecutor'
    pod 'React-jsinspector', :path => '../node_modules/react-native/ReactCommon/jsinspector'
    pod 'yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
    pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
    pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
    pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'
end

target 'YOUR_TARGET' do
    pods()
end
```

The first part lists the React Native libraries that you want to link. This is defined in a function and then used in the `target` block below. You need to change `YOUR_TARGET` to be the name of the target which is listed in Xcode. You can find this by opening Xcode, pressing the project at the top of the left panel, and then looking at the target name.

If you have multiple targets (for example, one for development and another for production) then you can have multiple `target` blocks in your `Podfile`. This is why we defined the pods in a shared method.

Once this is done, you can run `bundle exec pod install` from the `ios` directory. This will generate a `Podfile.lock` file (similar to your `Yarn.lock` or `package-lock.json`) and a `.xcworkspace` file. You should now close your previous Xcode P*roject* and open the _Workspace_. This workspace includes two _projects;_ your app project and a _Pods_ project. From now on you will need to use this workspace whenever you use Xcode to build your app. Not doing this will lead to builds errors.

The next step is to remove the existing libraries from your Xcode project. The easiest way to do this is to open Xcode and delete the `Libraries` group in the left menu. Make sure you choose "Remove references" to avoid breaking your node modules.

At this point you can either continue to the next section to add auto linking support, or use the `react-native link` command to manually add libraries to your `Podfile`. If you choose the `link` route, then you will need to run `bundle exec pod install` to complete the linking.

You may still need to manually link libraries which do not support Cocoapods, however, this is quite a small list of libraries now.

#### Migrate iOS to Autolinking

Autolinking allows you to avoid some of the complexity of setting up linking when you add a new library to your React Native project. To do this, you need to make sure you have setup Cocoapods correctly.

To add Autolinking support, you need to make a few small changes to your `Podfile`. Firstly, at the top of the `Podfile` add this line:

```ruby
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
```

Next, you need replace all of the library `podfile` lines from your `Podfile` with this single line:

```ruby
use_native_modules!
```

You need to leave the React Native related ones in place. See the list above for the ones which are related to the React Native core.

At this point, you can run `bundle exec pod install` to complete the linking and then test that everything still works as expected. You may still need to manually link any older libraries which do not support autolinking, however, this is a very small list of libraries now.

#### Migrate Android to Autolinking

Adding Autolinking support for Android is pretty similar to adding support on iOS. Firstly, in your `android/settings.gradle` remove the current contents of the file and replace it all with:

```groovy
rootProject.name = 'YOUR_APP_NAME'
apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
include ':app'
```

Make sure you keep the root project name the same as you previously had.

Next, open `android/app/build.gradle` and add this line to the very end of the file:

```groovy
apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
```

You then need to go up to the `dependencies` block and remove all of the `implementation` lines for the libraries that you use.

Lastly, you need to make a few changes to your `[MainApplication.java](http://mainapplication.java)` file. Inside the `getPackages` method, replace the contents of the method with:

```java
List<ReactPackage> packages = new PackageList(this).getPackages();
// Manually add any missing packages like this
// packages.add(new PostsnapPackage());
return packages;
```

This replaces the currently list of packages that you had. You can then go to the top of that file and replace the manual imports your previously had with:

```java
import com.facebook.react.PackageList;
```

At this point, you can build your Android app and ensure everything still works as expected.

#### Lean Core

As mentioned above, some of the non-core part of React Native have been extracted from the main module and moved out to community run repos. If you currently use one of these three APIs, you will need to install the new community module and change your imports to replace the old core version. Most libraries are drop in replacements and come with improvements over the old "core" version.

- **NetInfo** has been replaced by **@**[react-native-community/netinfo](https://github.com/react-native-community/react-native-netinfo)
- **WebView** has been replaced by @[react-native-community/webview](https://github.com/react-native-community/react-native-webview)
- **Geolocation** has been replaced by @[react-native-community/geolocation](https://github.com/react-native-community/react-native-geolocation)

To automate the upgrade, you can use the [rn-upgrade-deprecated-modules](https://github.com/lucasbento/rn-update-deprecated-modules) tool. However, I would recommend looking at the READMEs of the replacement project to check for any compatibility changes.

### Testing & Finishing Up

Those are all of the changes that you are required to make for all projects, however, there are a couple of other breaking changes which might affect some apps. You should read through the changelog to see if anything applies to your project. You should also go through the libraries you use to see if any upgrade is required.
