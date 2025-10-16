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
const IOS_APP       = process.env.IOS_APP       || path.resolve(
  __dirname,
  './node_modules/ios-uicatalog/UIKitCatalog/build/Release-iphonesimulator/UIKitCatalog-iphonesimulator.app'
);
// UDIDs are optional on CI
const IOS_UDID      = process.env.IOS_UDID;
const IOS_UDID_2    = process.env.IOS_UDID_2;

// Stable, prebuild-matching WDA DerivedData folders (NO process.pid!)
const cacheBase     = process.env.XDG_CACHE_HOME || os.tmpdir();
const WDA_PORT_1    = +(process.env.WDA_PORT_1 || 8100);
const WDA_PORT_2    = +(process.env.WDA_PORT_2 || 8101);
const WDA_DIR_1     = path.join(cacheBase, `wda-${WDA_PORT_1}`);
const WDA_DIR_2     = path.join(cacheBase, `wda-${WDA_PORT_2}`);

export const config = {
  runner: 'local',
  port: 4723,

  specs: ['./test/specs/**/*.js'],
  suites: { smoke: ['./test/specs/**/*smoke*.{js,ts}'] },

  maxInstances: +(process.env.MAX_INSTANCES || 2),

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
      'appium:simulatorStartupTimeout': 120000,
      'appium:iosInstallPause': 8000,
      'appium:isHeadless': false,
      'appium:noReset': true,

      // PREBUILT WDA: make Appium reuse the prebuilt artifacts
      'appium:usePrebuiltWDA': true,
      'appium:derivedDataPath': WDA_DIR_1,

      // dedicated ports per worker
      'appium:wdaLocalPort': WDA_PORT_1,
      'appium:webkitDebugProxyPort': +(process.env.WK_PROXY_PORT_1 || 27753),
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
      'appium:simulatorStartupTimeout': 120000,
      'appium:iosInstallPause': 8000,
      'appium:isHeadless': false,
      'appium:noReset': true,

      // PREBUILT WDA
      'appium:usePrebuiltWDA': true,
      'appium:derivedDataPath': WDA_DIR_2,

      'appium:wdaLocalPort': WDA_PORT_2,
      'appium:webkitDebugProxyPort': +(process.env.WK_PROXY_PORT_2 || 27754),
    }
  ],

  logLevel: 'info',
  waitforTimeout: 10000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  services: [[
    'appium',
    {
      args: {
        address: '127.0.0.1',
        port: +(process.env.WD_PORT || 4723),
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
  // =====
  // Hooks (all optional; leave commented or implement as needed)
  // =====
  // onPrepare: function (config, capabilities) {},
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {},
  // onWorkerEnd: function (cid, exitCode, specs, retries) {},
  // beforeSession: function (config, capabilities, specs, cid) {},
  // before: function (capabilities, specs) {},
  // beforeCommand: function (commandName, args) {},
  // beforeSuite: function (suite) {},
  // beforeTest: function (test, context) {},
  // beforeHook: function (test, context, hookName) {},
  // afterHook: function (test, context, { error, result, duration, passed, retries }, hookName) {},
  // afterTest: function (test, context, { error, result, duration, passed, retries }) {},
  // afterSuite: function (suite) {},
  // afterCommand: function (commandName, args, result, error) {},
  // after: function (result, capabilities, specs) {},
  // afterSession: function (config, capabilities, specs) {},
  // onComplete: function (exitCode, config, capabilities, results) {},
  // onReload: function (oldSessionId, newSessionId) {},
  // beforeAssertion: function (params) {},
  // afterAssertion: function (params) {},
};
