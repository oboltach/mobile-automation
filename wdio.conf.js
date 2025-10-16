// needed because we use ESM (type:module)
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// CI-friendly env defaults.
const IOS_DEVICE    = process.env.IOS_DEVICE    || 'iPhone 16 Pro';
const IOS_DEVICE_2  = process.env.IOS_DEVICE_2  || 'iPhone 16 Plus';
const IOS_VERSION   = process.env.IOS_VERSION   || '18.0';
const IOS_APP       = process.env.IOS_APP || path.resolve(
  __dirname,
  './node_modules/ios-uicatalog/UIKitCatalog/build/Release-iphonesimulator/UIKitCatalog-iphonesimulator.app'
);

// UDIDs are optional on CI (we export them in the workflow)
const IOS_UDID      = process.env.IOS_UDID;
const IOS_UDID_2    = process.env.IOS_UDID_2;

// Stable, prebuild-matching WDA DerivedData folders (NO process.pid!)
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

  specs: ['./test/specs/**/*.js'],
  suites: { smoke: ['./test/specs/**/*smoke*.{js,ts}'] },

  maxInstances: Number(process.env.MAX_INSTANCES || 2),

  capabilities: [
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
      'appium:xcodebuildTimeout': 180000,
      'appium:simulatorStartupTimeout': 120000,
      'appium:iosInstallPause': 8000,
      'appium:isHeadless': false,   // sims are already booted; keep visible for WDA reliability
      'appium:noReset': true,

      // PREBUILT WDA: reuse the artifacts we built in the workflow
      'appium:usePrebuiltWDA': true,
      'appium:derivedDataPath': WDA_DIR_1,

      // Extra logging to diagnose any xcodebuild/WDA issues
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
      'appium:xcodebuildTimeout': 180000,
      'appium:simulatorStartupTimeout': 120000,
      'appium:iosInstallPause': 8000,
      'appium:isHeadless': false,
      'appium:noReset': true,

      // PREBUILT WDA (second device points to its own derivedDataPath)
      'appium:usePrebuiltWDA': true,
      'appium:derivedDataPath': WDA_DIR_2,

      'appium:showXcodeLog': true,

      'appium:wdaLocalPort': WDA_PORT_2,
      'appium:webkitDebugProxyPort': WK_PROXY_2,
    }
  ],

  logLevel: 'info',
  waitforTimeout: 10000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  services: [[
    'appium',
    {
      // Make sure the spawned Appium matches the host/port we configured above
      args: {
        address: '127.0.0.1',
        port: APPIUM_PORT,
        'base-path': '/',            // explicit base path
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

  mochaOpts: { ui: 'bdd', timeout: 120000 },

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
