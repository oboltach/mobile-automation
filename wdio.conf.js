import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// PLATFORM SWITCH
const PLATFORM = (process.env.PLATFORM || 'ios').toLowerCase();
const isAndroid = PLATFORM === 'android';
const isIOS = PLATFORM === 'ios';

// CI-friendly env defaults.
const IOS_DEVICE    = process.env.IOS_DEVICE    || 'iPhone 16 Pro';
const IOS_DEVICE_2  = process.env.IOS_DEVICE_2  || 'iPhone 16 Plus';
const rawVersion = process.env.IOS_VERSION || '18.0';
const IOS_VERSION = /^\d+$/.test(rawVersion) ? `${rawVersion}.0` : rawVersion;
const IOS_APP       = process.env.IOS_APP || path.resolve(
  __dirname,
  './node_modules/ios-uicatalog/UIKitCatalog/build/Release-iphonesimulator/UIKitCatalog-iphonesimulator.app'
);

const IOS_UDID      = process.env.IOS_UDID;
const IOS_UDID_2    = process.env.IOS_UDID_2;

// ANDROID CONFIG
const ANDROID_APP   = process.env.ANDROID_APP || path.resolve(
  __dirname,
  './apps/ApiDemos-debug.apk'
);
const ANDROID_DEVICE = process.env.ANDROID_DEVICE || 'Pixel 7';
const ANDROID_PLATFORM_VERSION = process.env.ANDROID_PLATFORM_VERSION || '14';
const SYS_PORT_1 = Number(process.env.SYS_PORT_1 || 8200);
const SYS_PORT_2 = Number(process.env.SYS_PORT_2 || 8201);
const CDP_PORT_1 = Number(process.env.CDP_PORT_1 || 9515);
const CDP_PORT_2 = Number(process.env.CDP_PORT_2 || 9516);

// Stable, prebuild-matching WDA DerivedData folders
const cacheBase     = process.env.XDG_CACHE_HOME || os.tmpdir();
const WDA_PORT_1    = Number(process.env.WDA_PORT_1 || 8100);
const WDA_PORT_2    = Number(process.env.WDA_PORT_2 || 8101);
const WDA_DIR_1     = path.join(cacheBase, `wda-${WDA_PORT_1}`);
const WDA_DIR_2     = path.join(cacheBase, `wda-${WDA_PORT_2}`);
const WK_PROXY_1    = Number(process.env.WK_PROXY_PORT_1 || 27753);
const WK_PROXY_2    = Number(process.env.WK_PROXY_PORT_2 || 27754);

// Keep Appium port consistent everywhere
const APPIUM_PORT   = Number(process.env.WD_PORT || 4723);

export const config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: APPIUM_PORT,

  // ✅ PLATFORM-BASED TEST SELECTION
  specs: isAndroid
    ? ['./test/specs/android/**/*.spec.js']
    : ['./test/specs/**/*.spec.js'],

  exclude: isIOS
    ? ['./test/specs/android/**']
    : [],

  maxInstances: Number(process.env.MAX_INSTANCES || 2),

  capabilities: isAndroid
    ? [
        {
          platformName: 'Android',
          maxInstances: 1,
          'appium:automationName': 'UiAutomator2',
          'appium:platformVersion': ANDROID_PLATFORM_VERSION,
          'appium:deviceName': ANDROID_DEVICE,
          'appium:app': ANDROID_APP,
          'appium:newCommandTimeout': 240,
          'appium:autoGrantPermissions': true,
          'appium:disableWindowAnimation': true,
          'appium:systemPort': SYS_PORT_1,
          'appium:chromedriverPort': CDP_PORT_1,
          'appium:ensureWebviewsHavePages': true,
          'appium:allowInsecure': 'chromedriver_autodownload'
        },
        {
          platformName: 'Android',
          maxInstances: 1,
          'appium:automationName': 'UiAutomator2',
          'appium:platformVersion': ANDROID_PLATFORM_VERSION,
          'appium:deviceName': ANDROID_DEVICE,
          'appium:app': ANDROID_APP,
          'appium:newCommandTimeout': 240,
          'appium:autoGrantPermissions': true,
          'appium:disableWindowAnimation': true,
          'appium:systemPort': SYS_PORT_2,
          'appium:chromedriverPort': CDP_PORT_2,
          'appium:ensureWebviewsHavePages': true,
          'appium:allowInsecure': 'chromedriver_autodownload'
        }
      ]
    : [
        {
          platformName: 'iOS',
          maxInstances: 1,
          'appium:automationName': 'XCUITest',
          'appium:platformVersion': IOS_VERSION,
          'appium:deviceName': IOS_DEVICE,
          'appium:app': IOS_APP,
          ...(IOS_UDID ? { 'appium:udid': IOS_UDID } : {}),
          'appium:newCommandTimeout': 240,
          'appium:autoAcceptAlerts': false,
          'appium:wdaLaunchTimeout': 180000,
          'appium:wdaConnectionTimeout': 180000,
          'appium:xcodebuildTimeout': 300000,
          'appium:simulatorStartupTimeout': 120000,
          'appium:iosInstallPause': 8000,
          'appium:isHeadless': false,
          'appium:noReset': true,
          'appium:usePrebuiltWDA': true,
          'appium:derivedDataPath': WDA_DIR_1,
          'appium:showXcodeLog': true,
          'appium:wdaLocalPort': WDA_PORT_1,
          'appium:webkitDebugProxyPort': WK_PROXY_1,
        },
        {
          platformName: 'iOS',
          maxInstances: 1,
          'appium:automationName': 'XCUITest',
          'appium:platformVersion': IOS_VERSION,
          'appium:deviceName': IOS_DEVICE_2,
          'appium:app': IOS_APP,
          ...(IOS_UDID_2 ? { 'appium:udid': IOS_UDID_2 } : {}),
          'appium:newCommandTimeout': 240,
          'appium:autoAcceptAlerts': false,
          'appium:wdaLaunchTimeout': 180000,
          'appium:wdaConnectionTimeout': 180000,
          'appium:xcodebuildTimeout': 300000,
          'appium:simulatorStartupTimeout': 120000,
          'appium:iosInstallPause': 8000,
          'appium:isHeadless': false,
          'appium:noReset': true,
          'appium:usePrebuiltWDA': true,
          'appium:derivedDataPath': WDA_DIR_2,
          'appium:showXcodeLog': true,
          'appium:wdaLocalPort': WDA_PORT_2,
          'appium:webkitDebugProxyPort': WK_PROXY_2,
        }
      ],

  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  reporters: ['spec'],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  }
};
