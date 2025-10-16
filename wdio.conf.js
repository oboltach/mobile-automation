// at top of wdio.conf.js
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---- Environment switches ----
const IS_CI = process.env.CI === 'true';
const USE_PREBUILT_WDA = IS_CI || process.env.USE_PREBUILT_WDA === 'true'; // CI=fast prebuild; local=auto build unless you opt-in

// Normalize iOS version: "18" -> "18.0"
const rawVersion  = process.env.IOS_VERSION || '18.0';
const IOS_VERSION = /^\d+$/.test(rawVersion) ? `${rawVersion}.0` : rawVersion;

// Devices / paths / ports
const IOS_DEVICE    = process.env.IOS_DEVICE   || 'iPhone 16 Pro';
const IOS_DEVICE_2  = process.env.IOS_DEVICE_2 || 'iPhone 16 Plus';
const IOS_APP       = process.env.IOS_APP || path.resolve(
  __dirname,
  './node_modules/ios-uicatalog/UIKitCatalog/build/Release-iphonesimulator/UIKitCatalog-iphonesimulator.app'
);
const IOS_UDID      = process.env.IOS_UDID;   // CI sets, local optional
const IOS_UDID_2    = process.env.IOS_UDID_2;

const cacheBase     = process.env.XDG_CACHE_HOME || os.tmpdir();
const WDA_PORT_1    = Number(process.env.WDA_PORT_1 || 8100);
const WDA_PORT_2    = Number(process.env.WDA_PORT_2 || 8101);
const WDA_DIR_1     = path.join(cacheBase, `wda-${WDA_PORT_1}`);
const WDA_DIR_2     = path.join(cacheBase, `wda-${WDA_PORT_2}`);
const WK_PROXY_1    = Number(process.env.WK_PROXY_PORT_1 || 27753);
const WK_PROXY_2    = Number(process.env.WK_PROXY_PORT_2 || 27754);
const APPIUM_PORT   = Number(process.env.WD_PORT || 4723);

// Small helper to conditionally add derivedDataPath
const prebuilt = (dir) => USE_PREBUILT_WDA ? {
  'appium:usePrebuiltWDA': true,
  'appium:derivedDataPath': dir
} : {
  'appium:usePrebuiltWDA': false
};

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
      ...(IOS_UDID ? { 'appium:udid': IOS_UDID } : {}), // CI pins, local optional
      'appium:newCommandTimeout': 240,
      'appium:autoAcceptAlerts': false,
      'appium:wdaLaunchTimeout': 180000,
      'appium:wdaConnectionTimeout': 180000,
      'appium:xcodebuildTimeout': 300000,
      'appium:simulatorStartupTimeout': 120000,
      'appium:iosInstallPause': 8000,
      'appium:isHeadless': false,
      'appium:noReset': true,
      ...prebuilt(WDA_DIR_1),
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
      ...prebuilt(WDA_DIR_2),
      'appium:showXcodeLog': true,
      'appium:wdaLocalPort': WDA_PORT_2,
      'appium:webkitDebugProxyPort': WK_PROXY_2,
    }
  ],

  services: [[
    'appium',
    { args: { address: '127.0.0.1', port: APPIUM_PORT } }
  ]],

  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: true, disableWebdriverScreenshotsReporting: false }]
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
