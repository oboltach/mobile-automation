//needed because we use ESM (type:module)
//needed because we use ESM (type:module)
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      'appium:isHeadless': true,
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
      'appium:isHeadless': true,
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
        // keep basePath default '/'
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

  mochaOpts: { ui: 'bdd', timeout: 120000 }
},
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onPrepare: function (config, capabilities) {
    // },
    /**
     * Gets executed before a worker process is spawned and can be used to initialize specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {object} specs    specs to be run in the worker process
     * @param  {object} args     object that will be merged with the main configuration once worker is initialized
     * @param  {object} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just after a worker process has exited.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {number} exitCode 0 - success, 1 - fail
     * @param  {object} specs    specs to be run in the worker process
     * @param  {number} retries  number of retries used
     */
    // onWorkerEnd: function (cid, exitCode, specs, retries) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     * @param {string} cid worker id (e.g. 0-0)
     */
    // beforeSession: function (config, capabilities, specs, cid) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {object}         browser      instance of created browser/device session
     */
    // before: function (capabilities, specs) {
    // },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Hook that gets executed before the suite starts
     * @param {object} suite suite details
     */
    // beforeSuite: function (suite) {
    // },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    // beforeTest: function (test, context) {
    // },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    // beforeHook: function (test, context, hookName) {
    // },
    /**
     * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
     * afterEach in Mocha)
     */
    // afterHook: function (test, context, { error, result, duration, passed, retries }, hookName) {
    // },
    /**
     * Function to be executed after a test (in Mocha/Jasmine only)
     * @param {object}  test             test object
     * @param {object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {*}       result.result    return object of test function
     * @param {number}  result.duration  duration of test
     * @param {boolean} result.passed    true if test has passed, otherwise false
     * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
     */
    // afterTest: function(test, context, { error, result, duration, passed, retries }) {
    // },


    /**
     * Hook that gets executed after the suite has ended
     * @param {object} suite suite details
     */
    // afterSuite: function (suite) {
    // },
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {number} result 0 - command success, 1 - command error
     * @param {object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {object} exitCode 0 - success, 1 - fail
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    // onComplete: function(exitCode, config, capabilities, results) {
    // },
    /**
    * Gets executed when a refresh happens.
    * @param {string} oldSessionId session ID of the old session
    * @param {string} newSessionId session ID of the new session
    */
    // onReload: function(oldSessionId, newSessionId) {
    // }
    /**
    * Hook that gets executed before a WebdriverIO assertion happens.
    * @param {object} params information about the assertion to be executed
    */
    // beforeAssertion: function(params) {
    // }
    /**
    * Hook that gets executed after a WebdriverIO assertion happened.
    * @param {object} params information about the assertion that was executed, including its results
    */
    // afterAssertion: function(params) {
    // }
}
