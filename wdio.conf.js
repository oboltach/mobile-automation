// wdio.conf.js (ESM)
// ------------------
// Usage:
//   PLATFORM=ios     npm run test:ios
//   PLATFORM=android npm run test:android
//
// Defaults to PLATFORM=ios to keep CI stable.

import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---------------------------
 * Platform switch (SAFE)
 * --------------------------- */
const PLATFORM = (process.env.PLATFORM || 'ios').toLowerCase(); // ios | android | all (we only use ios/android)

/* ---------------------------
 * iOS SETTINGS (kept CI-safe)
 * --------------------------- */
const IOS_DEVICE    = process.env.IOS_DEVICE    || 'iPhone 16 Pro';
const IOS_DEVICE_2  = process.env.IOS_DEVICE_2  || 'iPhone 16 Plus';
const rawVersion    = process.env.IOS_VERSION   || '18.0';
const IOS_VERSION   = /^\d+$/.test(rawVersion) ? `${rawVersion}.0` : rawVersion;

const IOS_APP = process.env.IOS_APP || path.resolve(
  __dirname,
  './node_modules/ios-uicatalog/UIKitCatalog/build/Release-iphonesimulator/UIKitCatalog-iphonesimulator.app'
);

// Optional UDIDs (CI exports these)
const IOS_UDID   = process.env.IOS_UDID;
const IOS_UDID_2 = process.env.IOS_UDID_2;

// WDA cache/ports (stable per worker)
const cacheBase  = process.env.XDG_CACHE_HOME || os.tmpdir();
const WDA_PORT_1 = Number(process.env.WDA_PORT_1 || 8100);
const WDA_PORT_2 = Number(process.env.WDA_PORT_2 || 8101);
const WDA_DIR_1  = path.join(cacheBase, `wda-${WDA_PORT_1}`);
const WDA_DIR_2  = path.join(cacheBase, `wda-${WDA_PORT_2}`);

const WK_PROXY_1 = Number(process.env.WK_PROXY_PORT_1 || 27753);
const WK_PROXY_2 = Number(process.env.WK_PROXY_PORT_2 || 27754);

// Toggle prebuilt WDA (CI=true, local can set USE_PREBUILT_WDA=false if desired)
const USE_PREBUILT_WDA = process.env.USE_PREBUILT_WDA !== 'false';

/* ---------------------------
 * ANDROID SETTINGS
 * --------------------------- */
const ANDROID_APP              = process.env.ANDROID_APP || path.resolve(__dirname, './apps/ApiDemos-debug.apk');
const ANDROID_DEVICE           = process.env.ANDROID_DEVICE || 'Pixel 7';
const ANDROID_PLATFORM_VERSION = process.env.ANDROID_PLATFORM_VERSION || '14'; // API 34
const SYS_PORT_1               = Number(process.env.SYS_PORT_1 || 8200);
const SYS_PORT_2               = Number(process.env.SYS_PORT_2 || 8201);
const CDP_PORT_1               = Number(process.env.CDP_PORT_1 || 9515);
const CDP_PORT_2               = Number(process.env.CDP_PORT_2 || 9516);

/* ---------------------------
 * Appium / WDIO core
 * --------------------------- */
const APPIUM_PORT    = Number(process.env.WD_PORT || 4723);
const MAX_INSTANCES  = Number(process.env.MAX_INSTANCES || 2);

const iosCaps = [
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

    // CI stabilizers
    'appium:wdaLaunchTimeout': 180000,
    'appium:wdaConnectionTimeout': 180000,
    'appium:xcodebuildTimeout': 300000,
    'appium:simulatorStartupTimeout': 120000,
    'appium:iosInstallPause': 8000,
    'appium:isHeadless': false,
    'appium:noReset': true,

    // Prebuilt WDA (CI) — can be disabled locally via USE_PREBUILT_WDA=false
    ...(USE_PREBUILT_WDA ? { 'appium:usePrebuiltWDA': true, 'appium:derivedDataPath': WDA_DIR_1 } : {}),

    'appium:showXcodeLog': true,

    // dedicated ports per worker
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

    // CI stabilizers
    'appium:wdaLaunchTimeout': 180000,
    'appium:wdaConnectionTimeout': 180000,
    'appium:xcodebuildTimeout': 300000,
    'appium:simulatorStartupTimeout': 120000,
    'appium:iosInstallPause': 8000,
    'appium:isHeadless': false,
    'appium:noReset': true,

    ...(USE_PREBUILT_WDA ? { 'appium:usePrebuiltWDA': true, 'appium:derivedDataPath': WDA_DIR_2 } : {}),

    'appium:showXcodeLog': true,

    'appium:wdaLocalPort': WDA_PORT_2,
    'appium:webkitDebugProxyPort': WK_PROXY_2,
  }
];

const androidCaps = [
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

    // Parallel ports
    'appium:systemPort': SYS_PORT_1,
    'appium:chromedriverPort': CDP_PORT_1,

    // Webview helpers
    'appium:allowInsecure': 'chromedriver_autodownload',
    'appium:ensureWebviewsHavePages': true,
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

    'appium:allowInsecure': 'chromedriver_autodownload',
    'appium:ensureWebviewsHavePages': true,
  }
];

/* ---------------------------
 * Exported WDIO config
 * --------------------------- */
export const config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: APPIUM_PORT,

  specs: ['./test/specs/**/*.js'],
  // Suites: keep your smoke (iOS) and add android-only suite
  suites: {
    smoke: ['./test/specs/**/*smoke*.{js,ts}'],       // iOS smoke (unchanged)
    android: ['./test/specs/android/**/*.spec.js'],   // Android-only specs
  },

  maxInstances: MAX_INSTANCES,

  //
  // Only load capabilities for the selected PLATFORM.
  // Default is 'ios' to keep CI behavior unchanged.
  //
    // ===============  STABILITY SETTINGS  =================
  bail: 0,                              // Do not stop after first spec failure

  specFileRetries: Number(process.env.SPEC_RETRIES || 1),
  specFileRetriesDelay: 5,
  specFileRetriesDeferred: true,

  connectionRetryCount: 3,
  connectionRetryTimeout: 180000,
  waitforTimeout: 15000,

  // Automatically capture screenshots on failure
  afterTest: function (test, context, { error, result, duration, passed }) {
    if (!passed) {
      try {
        browser.takeScreenshot();
      } catch (e) {}
    }
  },

  // Optional: implicit wait to stabilize UIKitCatalog Launch
  before: function () {
    try {
      browser.setImplicitTimeout(8000);
    } catch (e) {}
  },
  capabilities: PLATFORM === 'android' ? androidCaps : iosCaps,

  logLevel: 'info',
  waitforTimeout: 10000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  services: [[
    'appium',
    {
      args: {
        address: '127.0.0.1',
        port: APPIUM_PORT,
        // basePath remains default '/'
      }
    }
  ]],

  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }]
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: Number(process.env.MOCHA_RETRIES || 1)
  },


  //
  // Hooks — keep default unless you want extra logging
  //
  // onPrepare() {},
  // onWorkerStart() {},
  // onWorkerEnd() {},
  // beforeSession() {},
  // before() {},
  // after() {},
  // onComplete() {},
};
